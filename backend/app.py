import sqlite3
from flask import Flask, jsonify, request, session
from flask_cors import CORS
from database import get_connection, init_db, db
from config import get_config

import os
import time
from flask import Flask, jsonify, request, session, send_from_directory, render_template
from werkzeug.utils import secure_filename

# 应用配置
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def create_app(config_object=None):
    """
    应用工厂函数，创建并配置Flask应用
    
    Args:
        config_object: 配置对象或字典
    """
    app = Flask(__name__, static_folder='build/static', template_folder='build')
    
    # 加载配置
    if config_object is None:
        config_object = get_config()
    
    app.config.from_object(config_object)
    
    # 确保上传目录存在
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    
    # 启用CORS
    CORS(app, supports_credentials=True)
    
    # 初始化数据库
    with app.app_context():
        # 设置数据库路径
        db.db_path = app.config.get('DB_PATH', 'songs.db')
        init_db(reset=False)
    
    # 注册路由和视图函数
    register_routes(app)
    
    return app

def register_routes(app):
    """
    注册所有路由和视图函数
    
    Args:
        app: Flask应用实例
    """
    
    # 前端静态文件服务
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        if path != "" and os.path.exists(os.path.join('build', path)):
            # 如果请求的文件存在于 build/ 下，就直接返回该文件
            return send_from_directory('build', path)
        else:
            # 否则返回 index.html，让前端路由来处理
            return send_from_directory('build', 'index.html')
    
    # 用户奖品相关API
    @app.route("/api/user/prizes", methods=["GET"])
    def get_user_prizes():
        """
        获取当前登录用户的所有奖品数据
        如果未登录则返回 401
        """
        if "username" not in session:
            return jsonify({"message": "请先登录"}), 401
        
        username = session["username"]

        # 查询对应用户ID
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT id FROM users WHERE username = ?", (username,))
        user_row = cur.fetchone()
        if not user_row:
            conn.close()
            return jsonify({"message": "用户不存在"}), 404
        
        user_id = user_row["id"]

        # 查询该用户在 prizes 表中的奖品
        cur.execute("""
            SELECT id, name, probability, image
            FROM prizes
            WHERE user_id = ?
        """, (user_id,))
        rows = cur.fetchall()
        conn.close()

        # 格式化返回
        prizes = []
        for r in rows:
            prizes.append({
                "id": r["id"],
                "name": r["name"],
                "probability": r["probability"],
                "image": r["image"]
            })
        return jsonify(prizes), 200

    @app.route("/api/user/prizes", methods=["POST"])
    def save_user_prizes():
        """
        保存用户奖品数据：
        - 如果未登录返回 401
        - 数据格式: { prizes: [{ name, probability, image }] }
        - 清空该用户之前所有奖品并插入新的
        """
        if "username" not in session:
            return jsonify({"message": "请先登录"}), 401
        
        username = session["username"]
        data = request.get_json() or {}
        prizes = data.get("prizes", [])
        
        # 先查询用户ID
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT id FROM users WHERE username = ?", (username,))
        user_row = cur.fetchone()
        if not user_row:
            conn.close()
            return jsonify({"message": "用户不存在"}), 404
        
        user_id = user_row["id"]
        
        # 清空该用户现有奖品
        cur.execute("DELETE FROM prizes WHERE user_id = ?", (user_id,))
        
        # 插入新的奖品数据
        for prize in prizes:
            name = prize.get("name", "").strip()
            probability = float(prize.get("probability", 0))
            image = prize.get("image", "")
            
            if not name:
                continue
            
            cur.execute("""
                INSERT INTO prizes (user_id, name, probability, image)
                VALUES (?, ?, ?, ?)
            """, (user_id, name, probability, image))

        conn.commit()
        conn.close()

        return jsonify({"message": "奖品信息已保存"}), 200

    # 用户认证相关API
    @app.route("/api/login", methods=["POST"])
    def login():
        """
        通过数据库验证用户
        前端提交 { username, password }
        - 如果匹配, session["is_admin"], session["username"] 写入
        - 否则401
        """
        data = request.get_json() or {}
        username = data.get("username") or ""
        username = username.strip()
        password = data.get("password") or ""
        password = password.strip()

        if not username or not password:
            return jsonify({"message": "用户名和密码不能为空"}), 400

        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, password, is_admin FROM users WHERE username = ?", (username,))
        row = cur.fetchone()
        conn.close()

        if not row or row["password"] != password:
            return jsonify({"message": "用户名或密码错误"}), 401
        
        # 登录成功，设置 session
        session["username"] = username
        session["user_id"] = row["id"]
        session["is_admin"] = row["is_admin"]
        
        return jsonify({
            "message": "登录成功",
            "username": username,
            "is_admin": row["is_admin"]
        }), 200

    @app.route("/api/logout", methods=["POST"])
    def logout():
        """登出用户，清除 session"""
        session.clear()
        return jsonify({"message": "已登出"}), 200

    @app.route("/api/register", methods=["POST"])
    def register():
        """
        注册新用户
        前端提交 { username, password, password_confirm }
        - 成功：自动登录并返回用户信息
        - 失败：返回错误信息
        """
        data = request.get_json() or {}
        username = data.get("username") or ""
        username = username.strip()
        password = data.get("password") or ""
        password = password.strip()
        password_confirm = data.get("password_confirm") or ""
        password_confirm = password_confirm.strip()
        bilibili_uid = data.get("bilibili_uid") or ""
        bilibili_uid = bilibili_uid.strip()

        # 基本验证
        if not username or not password:
            return jsonify({"message": "用户名和密码不能为空"}), 400
        
        if password != password_confirm:
            return jsonify({"message": "两次输入的密码不一致"}), 400

        # 查询用户名是否已存在
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT id FROM users WHERE username = ?", (username,))
        if cur.fetchone():
            conn.close()
            return jsonify({"message": f"用户名 {username} 已被使用"}), 400
        
        # 插入新用户
        cur.execute("""
            INSERT INTO users (username, password, bilibili_uid, is_admin)
            VALUES (?, ?, ?, ?)
        """, (username, password, bilibili_uid, 0))
        conn.commit()
        
        # 获取新用户ID
        user_id = cur.lastrowid
        conn.close()
        
        # 设置session，自动登录
        session["username"] = username
        session["user_id"] = user_id
        session["is_admin"] = 0
        
        return jsonify({
            "message": "注册成功",
            "username": username,
            "is_admin": 0
        }), 201

    @app.route("/api/check_auth", methods=["GET"])
    def check_auth():
        """
        检查用户是否已登录，前端可用于验证会话有效性
        """
        if "username" not in session:
            return jsonify({"authenticated": False}), 200
        
        return jsonify({
            "authenticated": True,
            "username": session["username"],
            "is_admin": session.get("is_admin", 0)
        }), 200

    # 文件上传相关API
    @app.route("/api/upload", methods=["POST"])
    def upload_image():
        """
        处理图片上传
        前端发送 multipart/form-data 格式请求，包含 image 字段
        - 成功返回图片URL
        - 失败返回错误信息
        """
        if "file" not in request.files:
            return jsonify({"message": "未找到上传文件"}), 400
        
        file = request.files["file"]
        
        if file.filename == "":
            return jsonify({"message": "未选择文件"}), 400
        
        if file:
            # 安全处理文件名
            filename = secure_filename(file.filename)
            # 添加时间戳前缀避免重名
            timestamp = int(time.time())
            filename = f"{timestamp}_{filename}"
            
            # 确保上传目录存在
            if not os.path.exists(UPLOAD_FOLDER):
                os.makedirs(UPLOAD_FOLDER)
            
            # 保存文件
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(file_path)
            
            # 返回可访问的URL
            file_url = f"/uploads/{filename}"
            return jsonify({"url": file_url}), 200
        
        return jsonify({"message": "上传失败"}), 500

    @app.route("/uploads/<path:filename>")
    def serve_uploaded_file(filename):
        """提供上传文件的访问"""
        return send_from_directory(UPLOAD_FOLDER, filename)

    # 用户管理相关API
    @app.route("/api/users", methods=["GET"])
    def list_users():
        """
        获取所有用户列表，仅管理员可用
        """
        if not session.get("is_admin"):
            return jsonify({"message": "需要管理员权限"}), 403
        
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT id, username, bilibili_uid, is_admin
            FROM users
            ORDER BY id
        """)
        
        users = []
        for row in cur.fetchall():
            users.append({
                "id": row["id"],
                "username": row["username"],
                "bilibili_uid": row["bilibili_uid"],
                "is_admin": row["is_admin"]
            })
        
        conn.close()
        return jsonify(users), 200

    @app.route("/api/users/<int:user_id>/reset_password", methods=["POST"])
    def reset_password(user_id):
        """
        重置用户密码，仅管理员可用
        """
        if not session.get("is_admin"):
            return jsonify({"message": "需要管理员权限"}), 403
        
        data = request.get_json() or {}
        new_password = data.get("password") or ""
        new_password = new_password.strip()
        
        if not new_password:
            return jsonify({"message": "密码不能为空"}), 400
        
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("UPDATE users SET password = ? WHERE id = ?", (new_password, user_id))
        
        if cur.rowcount == 0:
            conn.close()
            return jsonify({"message": "用户不存在"}), 404
        
        conn.commit()
        conn.close()
        
        return jsonify({"message": "密码已重置"}), 200

    @app.route("/api/users/<int:user_id>/toggle_admin", methods=["POST"])
    def toggle_admin(user_id):
        """
        切换用户的管理员状态，仅管理员可用
        """
        if not session.get("is_admin"):
            return jsonify({"message": "需要管理员权限"}), 403
        
        # 不允许自己取消自己的管理员权限
        if user_id == session.get("user_id"):
            return jsonify({"message": "不能修改自己的管理员状态"}), 400
        
        conn = get_connection()
        cur = conn.cursor()
        
        # 先查询当前状态
        cur.execute("SELECT is_admin FROM users WHERE id = ?", (user_id,))
        row = cur.fetchone()
        
        if not row:
            conn.close()
            return jsonify({"message": "用户不存在"}), 404
        
        # 切换状态
        new_status = 1 if row["is_admin"] == 0 else 0
        cur.execute("UPDATE users SET is_admin = ? WHERE id = ?", (new_status, user_id))
        conn.commit()
        conn.close()
        
        status_text = "授予" if new_status == 1 else "撤销"
        return jsonify({"message": f"已{status_text}管理员权限"}), 200

    # 歌曲管理相关API
    @app.route("/api/songs", methods=["GET"])
    def get_songs():
        """
        获取歌曲列表，支持分页和搜索
        查询参数:
        - page: 页码，默认1
        - per_page: 每页数量，默认10
        - search: 搜索关键词，默认为空
        """
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        search = request.args.get("search", "")
        
        # 计算偏移量
        offset = (page - 1) * per_page
        
        conn = get_connection()
        cur = conn.cursor()
        
        # 构建查询
        query = "SELECT * FROM songs"
        params = []
        
        if search:
            query += """ WHERE title LIKE ? OR artist LIKE ? OR album LIKE ? OR tags LIKE ?"""
            search_term = f"%{search}%"
            params = [search_term, search_term, search_term, search_term]
        
        # 添加分页
        query += " ORDER BY id DESC LIMIT ? OFFSET ?"
        params.extend([per_page, offset])
        
        # 执行查询
        cur.execute(query, params)
        rows = cur.fetchall()
        
        # 获取总数
        count_query = "SELECT COUNT(*) FROM songs"
        if search:
            count_query += """ WHERE title LIKE ? OR artist LIKE ? OR album LIKE ? OR tags LIKE ?"""
            cur.execute(count_query, [search_term, search_term, search_term, search_term])
        else:
            cur.execute(count_query)
            
        total = cur.fetchone()[0]
        conn.close()
        
        # 格式化结果
        songs = []
        for row in rows:
            songs.append({
                "id": row["id"],
                "title": row["title"],
                "artist": row["artist"],
                "album": row["album"],
                "genre": row["genre"],
                "year": row["year"],
                "meta_data": row["meta_data"],
                "tags": row["tags"]
            })
        
        return jsonify({
            "songs": songs,
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": (total + per_page - 1) // per_page
        }), 200

    @app.route("/api/songs/<int:song_id>", methods=["GET"])
    def get_song_by_id(song_id):
        """
        获取单个歌曲详情
        """
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM songs WHERE id = ?", (song_id,))
        row = cur.fetchone()
        conn.close()
        
        if not row:
            return jsonify({"message": "歌曲不存在"}), 404
        
        song = {
            "id": row["id"],
            "title": row["title"],
            "artist": row["artist"],
            "album": row["album"],
            "genre": row["genre"],
            "year": row["year"],
            "meta_data": row["meta_data"],
            "tags": row["tags"]
        }
        
        return jsonify(song), 200

    @app.route("/api/songs", methods=["POST"])
    def create_song():
        """
        创建新歌曲，需要管理员权限
        """
        if not session.get("is_admin"):
            return jsonify({"message": "需要管理员权限"}), 403
        
        data = request.get_json() or {}
        title = data.get("title") or ""
        title = title.strip()
        artist = data.get("artist") or ""
        artist = artist.strip()
        
        # 基本验证
        if not title or not artist:
            return jsonify({"message": "歌曲标题和艺术家不能为空"}), 400
        
        # 提取其他字段
        album = data.get("album") or ""
        album = album.strip()
        genre = data.get("genre") or ""
        genre = genre.strip()
        year = data.get("year")
        meta_data = data.get("meta_data", "")
        tags = data.get("tags") or ""
        tags = tags.strip()
        
        conn = get_connection()
        cur = conn.cursor()
        
        cur.execute("""
            INSERT INTO songs (title, artist, album, genre, year, meta_data, tags)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (title, artist, album, genre, year, meta_data, tags))
        
        conn.commit()
        song_id = cur.lastrowid
        conn.close()
        
        return jsonify({
            "message": "歌曲创建成功",
            "id": song_id
        }), 201

    @app.route("/api/songs/<int:song_id>", methods=["PUT"])
    def update_song(song_id):
        """
        更新歌曲信息，需要管理员权限
        """
        if not session.get("is_admin"):
            return jsonify({"message": "需要管理员权限"}), 403
        
        data = request.get_json() or {}
        title = data.get("title") or ""
        title = title.strip()
        artist = data.get("artist") or ""
        artist = artist.strip()
        
        # 基本验证
        if not title or not artist:
            return jsonify({"message": "歌曲标题和艺术家不能为空"}), 400
        
        # 提取其他字段
        album = data.get("album") or ""
        album = album.strip()
        genre = data.get("genre") or ""
        genre = genre.strip()
        year = data.get("year")
        meta_data = data.get("meta_data", "")
        tags = data.get("tags") or ""
        tags = tags.strip()
        
        conn = get_connection()
        cur = conn.cursor()
        
        # 先检查歌曲是否存在
        cur.execute("SELECT id FROM songs WHERE id = ?", (song_id,))
        if not cur.fetchone():
            conn.close()
            return jsonify({"message": "歌曲不存在"}), 404
        
        # 更新歌曲信息
        cur.execute("""
            UPDATE songs
            SET title = ?, artist = ?, album = ?, genre = ?, year = ?, meta_data = ?, tags = ?
            WHERE id = ?
        """, (title, artist, album, genre, year, meta_data, tags, song_id))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "message": "歌曲更新成功",
            "id": song_id
        }), 200

    @app.route("/api/songs/<int:song_id>", methods=["DELETE"])
    def delete_song(song_id):
        """
        删除歌曲，需要管理员权限
        """
        if not session.get("is_admin"):
            return jsonify({"message": "需要管理员权限"}), 403
        
        conn = get_connection()
        cur = conn.cursor()
        
        # 先检查歌曲是否存在
        cur.execute("SELECT id FROM songs WHERE id = ?", (song_id,))
        if not cur.fetchone():
            conn.close()
            return jsonify({"message": "歌曲不存在"}), 404
        
        # 删除歌曲
        cur.execute("DELETE FROM songs WHERE id = ?", (song_id,))
        conn.commit()
        conn.close()
        
        return jsonify({
            "message": "歌曲已删除",
            "id": song_id
        }), 200


# 创建应用实例
app = create_app()

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
