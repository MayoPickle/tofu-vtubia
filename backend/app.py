import sqlite3
from flask import Flask, jsonify, request, session, Response
from flask_cors import CORS
from database import get_connection, init_db, db
from config import get_config
import psycopg2
import psycopg2.extras
from datetime import datetime
import re
import requests
from datetime import date, datetime, timedelta

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
        if "user_id" not in session:
            return jsonify({"message": "请先登录"}), 401
        
        user_id = session["user_id"]

        # 查询该用户在 prizes 表中的奖品
        conn = get_connection()
        cur = conn.cursor()
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
        if "user_id" not in session:
            return jsonify({"message": "请先登录"}), 401
        
        data = request.get_json() or {}
        prizes = data.get("prizes", [])
        
        # 使用会话中的用户ID
        conn = get_connection()
        cur = conn.cursor()
        user_id = session["user_id"]
        
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
        前端提交 { uid, password }
        - 如果匹配, 写入 session: user_id, uid, username, is_admin
        - 否则401
        """
        data = request.get_json() or {}
        uid = (data.get("uid") or data.get("bilibili_uid") or "").strip()
        # 仅保留数字，防止传入诸如 "UID:123" 导致类型错误
        uid = re.sub(r"\D", "", uid)
        password = data.get("password") or ""
        password = password.strip()

        if not uid or not password:
            return jsonify({"message": "UID和密码不能为空"}), 400

        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, username, password, is_admin, bilibili_uid FROM users WHERE bilibili_uid = ?", (uid,))
        row = cur.fetchone()
        conn.close()

        if not row or row["password"] != password:
            return jsonify({"message": "UID或密码错误"}), 401
        
        # 登录成功，设置 session
        session["user_id"] = row["id"]
        session["uid"] = row["bilibili_uid"]
        session["username"] = row["username"]  # 仅用于显示
        session["is_admin"] = row["is_admin"]
        
        return jsonify({
            "message": "登录成功",
            "username": row["username"],
            "uid": row["bilibili_uid"],
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
        前端提交 { uid, password, password_confirm, username? }
        - 成功：自动登录并返回用户信息
        - 失败：返回错误信息
        """
        data = request.get_json() or {}
        uid = (data.get("uid") or data.get("bilibili_uid") or "").strip()
        uid = re.sub(r"\D", "", uid)
        username = (data.get("username") or "").strip()  # 可选，用于展示
        password = data.get("password") or ""
        password = password.strip()
        password_confirm = data.get("password_confirm") or ""
        password_confirm = password_confirm.strip()
        agree = bool(data.get("agree"))

        # 基本验证
        if not uid or not password:
            return jsonify({"message": "UID和密码不能为空"}), 400
        if not agree:
            return jsonify({"message": "请先阅读并同意用户协议与隐私政策"}), 400
        
        if password != password_confirm:
            return jsonify({"message": "两次输入的密码不一致"}), 400

        # 查询 UID 是否已存在
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT id FROM users WHERE bilibili_uid = ?", (uid,))
        if cur.fetchone():
            conn.close()
            return jsonify({"message": f"UID {uid} 已被注册"}), 400

        # 验证近2分钟是否在指定房间投喂包含“灯牌”的礼物
        try:
            config = get_config()
            pg_conn = psycopg2.connect(
                host=config.POSTGRES_HOST,
                port=config.POSTGRES_PORT,
                database=config.POSTGRES_DB,
                user=config.POSTGRES_USER,
                password=config.POSTGRES_PASSWORD
            )
            cur_pg = pg_conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

            two_minutes_ago = datetime.utcnow() - timedelta(minutes=2)
            # 匹配 gift_name 或揭示后的名称包含“灯牌”
            sql = """
                SELECT 1
                FROM gift_records
                WHERE uid = %s
                  AND room_id::text = %s
                  AND timestamp >= %s
                  AND (
                        gift_name ILIKE %s OR
                        NULLIF((blind_box::jsonb)->>'revealed_gift_name','') ILIKE %s
                  )
                LIMIT 1
            """
            room_id = str(1883353860)
            like_term = '%灯牌%'
            cur_pg.execute(sql, [str(uid), room_id, two_minutes_ago, like_term, like_term])
            found = cur_pg.fetchone() is not None
            cur_pg.close()
            pg_conn.close()
            if not found:
                return jsonify({"message": "未检测到近2分钟内的“灯牌”礼物，请投喂后再试"}), 400
        except Exception as e:
            return jsonify({"message": f"验证礼物失败：{str(e)}"}), 500
        
        # 插入新用户
        # 若未提供展示用用户名，则默认使用 UID
        display_name = username if username else str(uid)
        cur.execute("""
            INSERT INTO users (username, password, bilibili_uid, is_admin)
            VALUES (?, ?, ?, ?)
        """, (display_name, password, uid, 0))
        conn.commit()
        
        # 获取新用户ID
        user_id = cur.lastrowid
        conn.close()
        
        # 设置session，自动登录
        session["user_id"] = user_id
        session["uid"] = uid
        session["username"] = display_name
        session["is_admin"] = 0
        
        return jsonify({
            "message": "注册成功",
            "username": display_name,
            "uid": uid,
            "is_admin": 0
        }), 201

    @app.route("/api/register/verify_gift", methods=["POST"])
    def verify_gift_for_register():
        """
        校验指定 UID 是否在最近2分钟内于指定房间投喂过名称包含“灯牌”的礼物。
        前端提交 { uid }
        返回 { verified: true/false }
        """
        data = request.get_json() or {}
        uid = (data.get("uid") or data.get("bilibili_uid") or "").strip()
        uid = re.sub(r"\D", "", uid)
        if not uid:
            return jsonify({"message": "缺少UID"}), 400

        try:
            config = get_config()
            pg_conn = psycopg2.connect(
                host=config.POSTGRES_HOST,
                port=config.POSTGRES_PORT,
                database=config.POSTGRES_DB,
                user=config.POSTGRES_USER,
                password=config.POSTGRES_PASSWORD
            )
            cur_pg = pg_conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

            two_minutes_ago = datetime.utcnow() - timedelta(minutes=2)
            sql = """
                SELECT 1
                FROM gift_records
                WHERE uid = %s
                  AND room_id::text = %s
                  AND timestamp >= %s
                  AND (
                        gift_name ILIKE %s OR
                        NULLIF((blind_box::jsonb)->>'revealed_gift_name','') ILIKE %s
                  )
                LIMIT 1
            """
            room_id = str(1883353860)
            like_term = '%灯牌%'
            cur_pg.execute(sql, [str(uid), room_id, two_minutes_ago, like_term, like_term])
            found = cur_pg.fetchone() is not None
            cur_pg.close()
            pg_conn.close()
            return jsonify({"verified": bool(found)}), 200
        except Exception as e:
            return jsonify({"message": f"验证礼物失败：{str(e)}"}), 500

    @app.route("/api/forgot_password/reset", methods=["POST"])
    def reset_password_with_gift():
        """
        忘记密码：通过 UID + 近2分钟“灯牌”礼物验证来重置密码，并自动登录。
        前端提交 { uid, password }
        返回 200 并写入会话。
        """
        data = request.get_json() or {}
        uid = (data.get("uid") or data.get("bilibili_uid") or "").strip()
        uid = re.sub(r"\D", "", uid)
        password = (data.get("password") or "").strip()
        if not uid or not password:
            return jsonify({"message": "UID和新密码不能为空"}), 400

        # 先验证近2分钟内是否有“灯牌”礼物
        try:
            config = get_config()
            pg_conn = psycopg2.connect(
                host=config.POSTGRES_HOST,
                port=config.POSTGRES_PORT,
                database=config.POSTGRES_DB,
                user=config.POSTGRES_USER,
                password=config.POSTGRES_PASSWORD
            )
            cur_pg = pg_conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

            two_minutes_ago = datetime.utcnow() - timedelta(minutes=2)
            sql = """
                SELECT 1
                FROM gift_records
                WHERE uid = %s
                  AND room_id::text = %s
                  AND timestamp >= %s
                  AND (
                        gift_name ILIKE %s OR
                        NULLIF((blind_box::jsonb)->>'revealed_gift_name','') ILIKE %s
                  )
                LIMIT 1
            """
            room_id = str(1883353860)
            like_term = '%灯牌%'
            cur_pg.execute(sql, [str(uid), room_id, two_minutes_ago, like_term, like_term])
            found = cur_pg.fetchone() is not None
            cur_pg.close()
            pg_conn.close()
            if not found:
                return jsonify({"message": "未检测到近2分钟内的“灯牌”礼物，无法重置密码"}), 400
        except Exception as e:
            return jsonify({"message": f"验证礼物失败：{str(e)}"}), 500

        # 更新本地 sqlite 密码并自动登录
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, username, is_admin FROM users WHERE bilibili_uid = ?", (uid,))
        row = cur.fetchone()
        if not row:
            conn.close()
            return jsonify({"message": "用户不存在"}), 404

        cur.execute("UPDATE users SET password = ? WHERE id = ?", (password, row["id"]))
        conn.commit()
        conn.close()

        session["user_id"] = row["id"]
        session["uid"] = uid
        session["username"] = row["username"]
        session["is_admin"] = row["is_admin"]

        return jsonify({
            "message": "重置密码成功",
            "username": row["username"],
            "uid": uid,
            "is_admin": row["is_admin"]
        }), 200

    @app.route("/api/check_auth", methods=["GET"])
    def check_auth():
        """
        检查用户是否已登录，前端可用于验证会话有效性
        """
        if "user_id" not in session:
            return jsonify({"authenticated": False}), 200
        
        return jsonify({
            "authenticated": True,
            "username": session.get("username"),
            "uid": session.get("uid"),
            "is_admin": session.get("is_admin", 0)
        }), 200

    @app.route("/api/me", methods=["GET"])
    def get_current_user():
        """
        获取当前会话用户的详细信息
        返回字段：authenticated, id, username, bilibili_uid, is_admin
        未登录时返回 { authenticated: False }
        """
        if "user_id" not in session:
            return jsonify({"authenticated": False}), 200

        user_id = session.get("user_id")

        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT id, username, bilibili_uid, is_admin
            FROM users
            WHERE id = ?
        """, (user_id,))
        row = cur.fetchone()
        conn.close()

        if not row:
            return jsonify({"authenticated": False}), 200

        return jsonify({
            "authenticated": True,
            "id": row["id"],
            "username": row["username"],
            "bilibili_uid": row["bilibili_uid"],
            "is_admin": row["is_admin"]
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

    # 棉花糖相关API
    @app.route("/api/cotton_candy", methods=["POST"])
    def create_cotton_candy():
        """
        创建新的棉花糖，任何人都可以发送
        """
        data = request.get_json() or {}
        
        # 获取发送者，如果用户已登录则使用用户名，否则使用默认值"幽灵DD"
        sender = session.get("username", "幽灵DD")
        if not data.get("sender") or data.get("sender").strip() == "":
            data["sender"] = sender
            
        title = data.get("title", "").strip()
        content = data.get("content", "").strip()
        
        # 内容是必填项
        if not content:
            return jsonify({"message": "棉花糖内容不能为空"}), 400
        
        conn = get_connection()
        cur = conn.cursor()
        
        cur.execute("""
            INSERT INTO cotton_candy (sender, title, content, read)
            VALUES (?, ?, ?, 0)
        """, (data["sender"], title, content))
        
        conn.commit()
        candy_id = cur.lastrowid
        conn.close()
        
        return jsonify({
            "message": "棉花糖发送成功",
            "id": candy_id
        }), 201
    
    @app.route("/api/cotton_candy", methods=["GET"])
    def get_cotton_candy_list():
        """
        获取棉花糖列表，需要管理员权限
        支持分页和筛选已读/未读
        """
        if not session.get("is_admin"):
            return jsonify({"message": "需要管理员权限"}), 403
        
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        read_filter = request.args.get("read")
        
        # 计算偏移量
        offset = (page - 1) * per_page
        
        conn = get_connection()
        cur = conn.cursor()
        
        # 构建查询
        query = "SELECT * FROM cotton_candy"
        params = []
        
        if read_filter is not None:
            read_value = 1 if read_filter.lower() == 'true' else 0
            query += " WHERE read = ?"
            params = [read_value]
        
        # 添加排序和分页
        query += " ORDER BY create_time DESC LIMIT ? OFFSET ?"
        params.extend([per_page, offset])
        
        # 执行查询
        cur.execute(query, params)
        rows = cur.fetchall()
        
        # 获取总数
        count_query = "SELECT COUNT(*) FROM cotton_candy"
        if read_filter is not None:
            count_query += " WHERE read = ?"
            cur.execute(count_query, [read_value])
        else:
            cur.execute(count_query)
            
        total = cur.fetchone()[0]
        
        # 格式化结果
        candies = []
        for row in rows:
            candies.append({
                "id": row["id"],
                "sender": row["sender"],
                "title": row["title"],
                "content": row["content"],
                "create_time": row["create_time"],
                "read": bool(row["read"])
            })
        
        conn.close()
        
        return jsonify({
            "candies": candies,
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": (total + per_page - 1) // per_page
        }), 200
    
    @app.route("/api/cotton_candy/<int:candy_id>", methods=["GET"])
    def get_cotton_candy(candy_id):
        """
        获取单个棉花糖详情，需要管理员权限
        """
        if not session.get("is_admin"):
            return jsonify({"message": "需要管理员权限"}), 403
        
        conn = get_connection()
        cur = conn.cursor()
        
        cur.execute("SELECT * FROM cotton_candy WHERE id = ?", (candy_id,))
        row = cur.fetchone()
        
        if not row:
            conn.close()
            return jsonify({"message": "棉花糖不存在"}), 404
        
        # 标记为已读
        if not row["read"]:
            cur.execute("UPDATE cotton_candy SET read = 1 WHERE id = ?", (candy_id,))
            conn.commit()
        
        candy = {
            "id": row["id"],
            "sender": row["sender"],
            "title": row["title"],
            "content": row["content"],
            "create_time": row["create_time"],
            "read": True  # 已读取即标记为已读
        }
        
        conn.close()
        
        return jsonify(candy), 200
    
    @app.route("/api/cotton_candy/<int:candy_id>", methods=["DELETE"])
    def delete_cotton_candy(candy_id):
        """
        删除棉花糖，需要管理员权限
        """
        if not session.get("is_admin"):
            return jsonify({"message": "需要管理员权限"}), 403
        
        conn = get_connection()
        cur = conn.cursor()
        
        # 先检查是否存在
        cur.execute("SELECT id FROM cotton_candy WHERE id = ?", (candy_id,))
        if not cur.fetchone():
            conn.close()
            return jsonify({"message": "棉花糖不存在"}), 404
        
        # 删除
        cur.execute("DELETE FROM cotton_candy WHERE id = ?", (candy_id,))
        conn.commit()
        conn.close()
        
        return jsonify({
            "message": "棉花糖已删除",
            "id": candy_id
        }), 200
    
    @app.route("/api/cotton_candy/mark_read", methods=["POST"])
    def mark_cotton_candy_read():
        """
        批量标记棉花糖为已读，需要管理员权限
        """
        if not session.get("is_admin"):
            return jsonify({"message": "需要管理员权限"}), 403
        
        data = request.get_json() or {}
        candy_ids = data.get("ids", [])
        
        if not candy_ids:
            return jsonify({"message": "未提供棉花糖ID"}), 400
        
        conn = get_connection()
        cur = conn.cursor()
        
        # 构建更新语句
        placeholders = ','.join(['?'] * len(candy_ids))
        query = f"UPDATE cotton_candy SET read = 1 WHERE id IN ({placeholders})"
        
        cur.execute(query, candy_ids)
        conn.commit()
        conn.close()
        
        return jsonify({
            "message": "棉花糖已标记为已读",
            "count": len(candy_ids)
        }), 200
    
    @app.route("/api/cotton_candy/unread_count", methods=["GET"])
    def get_unread_count():
        """
        获取未读棉花糖数量，需要管理员权限
        """
        if not session.get("is_admin"):
            return jsonify({"message": "需要管理员权限"}), 403
        
        conn = get_connection()
        cur = conn.cursor()
        
        cur.execute("SELECT COUNT(*) FROM cotton_candy WHERE read = 0")
        count = cur.fetchone()[0]
        conn.close()
        
        return jsonify({"unread_count": count}), 200

    # 获取舰长信息API
    @app.route("/api/guards", methods=["GET"])
    def get_guards():
        """
        获取特定直播间的舰长信息
        """
        try:
            # 从配置中获取数据库连接信息
            config = get_config()
            # 连接PostgreSQL数据库
            conn = psycopg2.connect(
                host=config.POSTGRES_HOST,
                port=config.POSTGRES_PORT,
                database=config.POSTGRES_DB,
                user=config.POSTGRES_USER,
                password=config.POSTGRES_PASSWORD
            )
            
            # 使用DictCursor，这样可以通过列名访问结果
            cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
            
            # 查询特定直播间的舰长信息
            cur.execute("""
                SELECT id, room_id, ruid, uid, rank, accompany, 
                       username, face, name_color, is_mystery,
                       medal_name, medal_level, medal_color_start, 
                       medal_color_end, medal_color_border, medal_color,
                       guard_level, expired_str, is_top3, timestamp
                FROM bilibili_guards 
                WHERE room_id = 1883353860
                ORDER BY rank ASC
            """)
            
            rows = cur.fetchall()
            
            # 格式化结果
            guards = []
            for row in rows:
                guard = {
                    "id": row["id"],
                    "room_id": row["room_id"],
                    "ruid": row["ruid"],
                    "uid": row["uid"],
                    "rank": row["rank"],
                    "accompany": row["accompany"],
                    "username": row["username"],
                    "face": row["face"],
                    "name_color": row["name_color"],
                    "is_mystery": row["is_mystery"],
                    "medal_name": row["medal_name"],
                    "medal_level": row["medal_level"],
                    "medal_color_start": row["medal_color_start"],
                    "medal_color_end": row["medal_color_end"],
                    "medal_color_border": row["medal_color_border"],
                    "medal_color": row["medal_color"],
                    "guard_level": row["guard_level"],
                    "expired_str": row["expired_str"],
                    "is_top3": row["is_top3"],
                    "timestamp": row["timestamp"].isoformat() if row["timestamp"] else None
                }
                guards.append(guard)
            
            cur.close()
            conn.close()
            
            return jsonify({
                "message": "获取舰长信息成功",
                "total": len(guards),
                "guards": guards
            }), 200
            
        except Exception as e:
            print(f"获取舰长信息错误: {str(e)}")  # 添加错误日志
            return jsonify({
                "message": f"获取舰长信息失败: {str(e)}"
            }), 500

    @app.route("/api/pnl/self", methods=["GET"])
    def get_self_pnl():
        """
        计算当前登录用户的盈亏（仅盲盒礼物）
        口径：
        - 成本: total_coin（或 total_price），以金币口径计
        - 价值: 盲盒结果中的 reward_total_coin / total_value（若缺失按0处理）
        维度：今天 / 本周 / 本月 / 总计
        返回：{ today: {cost, value, pnl}, week: {...}, month: {...}, total: {...} }
        """
        # 会话校验
        if "user_id" not in session:
            return jsonify({"message": "请先登录"}), 401

        # 查询用户的 bilibili_uid（在 sqlite 用户表）
        conn_sqlite = get_connection()
        cur_sqlite = conn_sqlite.cursor()
        cur_sqlite.execute("SELECT bilibili_uid FROM users WHERE id = ?", (session["user_id"],))
        row = cur_sqlite.fetchone()
        conn_sqlite.close()
        if not row or not row["bilibili_uid"]:
            return jsonify({"message": "未绑定B站UID，无法统计盈亏"}), 400

        uid = str(row["bilibili_uid"]).strip()

        # 连接 Postgres 查询 gift_records
        try:
            config = get_config()
            pg_conn = psycopg2.connect(
                host=config.POSTGRES_HOST,
                port=config.POSTGRES_PORT,
                database=config.POSTGRES_DB,
                user=config.POSTGRES_USER,
                password=config.POSTGRES_PASSWORD
            )
            cur = pg_conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

            def query_range(start_time=None):
                params = [uid, str(1883353860)]
                time_filter_sql = ""
                if start_time is not None:
                    time_filter_sql = " AND timestamp >= %s"
                    params.append(start_time)

                # 仅统计盲盒礼物 is_blind_gift = true
                # 成本：优先 blind_box.original_gift_price -> 回退 total_coin/total_price/price
                # 价值：优先 blind_box.revealed_gift_price -> 回退 blind_box.gift_tip_price -> total_price/price/total_coin
                sql = f"""
                    SELECT 
                        COALESCE(SUM(
                            COALESCE(
                                (NULLIF((blind_box::jsonb)->>'original_gift_price','')::numeric) * COALESCE(gift_num, 1),
                                total_coin,
                                total_price,
                                (price * COALESCE(gift_num, 1)),
                                0
                            )
                        ), 0) AS total_cost,
                        COALESCE(SUM(
                            COALESCE(
                                (NULLIF((blind_box::jsonb)->>'revealed_gift_price','')::numeric) * COALESCE(gift_num, 1),
                                (NULLIF((blind_box::jsonb)->>'gift_tip_price','')::numeric) * COALESCE(gift_num, 1),
                                total_price,
                                (price * COALESCE(gift_num, 1)),
                                total_coin,
                                0
                            )
                        ), 0) AS total_value
                    FROM gift_records
                    WHERE uid = %s 
                      AND is_blind_gift = true
                      AND room_id::text = %s
                      {time_filter_sql}
                """
                cur.execute(sql, params)
                r = cur.fetchone()
                cost = float(r["total_cost"] or 0)
                value = float(r["total_value"] or 0)
                return {
                    "cost": cost,
                    "value": value,
                    "pnl": value - cost
                }

            today_start = datetime.combine(date.today(), datetime.min.time())
            week_start = today_start - timedelta(days=today_start.weekday())
            month_start = today_start.replace(day=1)

            result = {
                "today": query_range(today_start),
                "week": query_range(week_start),
                "month": query_range(month_start),
                "total": query_range(None)
            }

            cur.close()
            pg_conn.close()
            return jsonify(result), 200
        except Exception as e:
            print(f"计算盈亏失败: {str(e)}")
            return jsonify({"message": f"计算盈亏失败: {str(e)}"}), 500

    @app.route("/api/pnl/self/top_gifts", methods=["GET"])
    def get_self_top_gifts():
        """
        当前登录用户在本房间投喂的礼物按单次价值的最高值进行Top5排序。
        返回：[{ gift_id, gift_name, max_value, assets:{gif,webp,img_basic}, last_timestamp }]
        单位：分（前端换算为电池）。
        """
        if "user_id" not in session:
            return jsonify({"message": "请先登录"}), 401

        conn_sqlite = get_connection()
        cur_sqlite = conn_sqlite.cursor()
        cur_sqlite.execute("SELECT bilibili_uid FROM users WHERE id = ?", (session["user_id"],))
        row = cur_sqlite.fetchone()
        conn_sqlite.close()
        if not row or not row["bilibili_uid"]:
            return jsonify({"items": []}), 200

        uid = str(row["bilibili_uid"]).strip()

        try:
            config = get_config()
            pg_conn = psycopg2.connect(
                host=config.POSTGRES_HOST,
                port=config.POSTGRES_PORT,
                database=config.POSTGRES_DB,
                user=config.POSTGRES_USER,
                password=config.POSTGRES_PASSWORD
            )
            cur = pg_conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

            sql = """
                WITH record_values AS (
                    SELECT 
                      gift_id,
                      gift_name,
                      -- 单价（不乘 gift_num）
                      COALESCE(
                        CASE 
                          WHEN is_blind_gift THEN 
                            COALESCE(
                              NULLIF((blind_box::jsonb)->>'revealed_gift_price','')::numeric,
                              NULLIF((blind_box::jsonb)->>'gift_tip_price','')::numeric,
                              price
                            )
                          ELSE 
                            COALESCE(
                              price,
                              NULLIF(total_price,0) / NULLIF(gift_num,1),
                              total_price
                            )
                        END, 0
                      ) AS single_unit_value,
                      gift_assets,
                      timestamp
                    FROM gift_records
                    WHERE uid = %s
                      AND room_id::text = %s
                )
                SELECT 
                  gift_id,
                  gift_name,
                  MAX(single_unit_value) AS max_value,
                  MAX(NULLIF((gift_assets::jsonb)->>'gif','')) AS asset_gif,
                  MAX(NULLIF((gift_assets::jsonb)->>'webp','')) AS asset_webp,
                  MAX(NULLIF((gift_assets::jsonb)->>'img_basic','')) AS asset_img,
                  MAX(timestamp) AS last_timestamp
                FROM record_values
                GROUP BY gift_id, gift_name
                ORDER BY max_value DESC
                LIMIT 5
            """
            cur.execute(sql, [uid, str(1883353860)])
            rows = cur.fetchall()
            items = []
            for r in rows:
                items.append({
                    "gift_id": r["gift_id"],
                    "gift_name": r["gift_name"],
                    "max_value": float(r["max_value"] or 0),
                    "assets": {
                        "gif": r["asset_gif"],
                        "webp": r["asset_webp"],
                        "img_basic": r["asset_img"],
                    },
                    "last_timestamp": r["last_timestamp"].isoformat() if r["last_timestamp"] else None
                })
            cur.close()
            pg_conn.close()
            return jsonify({"items": items}), 200
        except Exception as e:
            print(f"获取Top礼物失败: {str(e)}")
            return jsonify({"message": f"获取Top礼物失败: {str(e)}"}), 500

    @app.route("/api/pnl/self/top_profit_blind", methods=["GET"])
    def get_self_top_profit_blind():
        """
        盲盒“单次差价(揭示-成本)”最大的 Top5（仅本房间）。
        返回字段：original_gift_name, revealed_gift_name, original_cost, revealed_value, profit, assets, timestamp。
        单位：分。
        """
        if "user_id" not in session:
            return jsonify({"message": "请先登录"}), 401

        conn_sqlite = get_connection()
        cur_sqlite = conn_sqlite.cursor()
        cur_sqlite.execute("SELECT bilibili_uid FROM users WHERE id = ?", (session["user_id"],))
        row = cur_sqlite.fetchone()
        conn_sqlite.close()
        if not row or not row["bilibili_uid"]:
            return jsonify({"items": []}), 200

        uid = str(row["bilibili_uid"]).strip()

        try:
            config = get_config()
            pg_conn = psycopg2.connect(
                host=config.POSTGRES_HOST,
                port=config.POSTGRES_PORT,
                database=config.POSTGRES_DB,
                user=config.POSTGRES_USER,
                password=config.POSTGRES_PASSWORD
            )
            cur = pg_conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

            sql = """
                SELECT 
                  gift_id,
                  gift_name,
                  NULLIF((blind_box::jsonb)->>'original_gift_name','') AS original_gift_name_json,
                  NULLIF((blind_box::jsonb)->>'revealed_gift_name','') AS revealed_gift_name_json,
                  COALESCE(
                    (NULLIF((blind_box::jsonb)->>'original_gift_price','')::numeric) * COALESCE(gift_num,1),
                    total_coin,
                    total_price,
                    (price * COALESCE(gift_num,1)),
                    0
                  ) AS original_cost,
                  COALESCE(
                    (NULLIF((blind_box::jsonb)->>'revealed_gift_price','')::numeric) * COALESCE(gift_num,1),
                    (NULLIF((blind_box::jsonb)->>'gift_tip_price','')::numeric) * COALESCE(gift_num,1),
                    total_price,
                    (price * COALESCE(gift_num,1)),
                    total_coin,
                    0
                  ) AS revealed_value,
                  gift_assets,
                  timestamp
                FROM gift_records
                WHERE uid = %s
                  AND room_id::text = %s
                  AND is_blind_gift = true
                ORDER BY (COALESCE(
                           (NULLIF((blind_box::jsonb)->>'revealed_gift_price','')::numeric) * COALESCE(gift_num,1),
                           (NULLIF((blind_box::jsonb)->>'gift_tip_price','')::numeric) * COALESCE(gift_num,1),
                           total_price,
                           (price * COALESCE(gift_num,1)),
                           total_coin,
                           0
                         ) - COALESCE(
                           (NULLIF((blind_box::jsonb)->>'original_gift_price','')::numeric) * COALESCE(gift_num,1),
                           total_coin,
                           total_price,
                           (price * COALESCE(gift_num,1)),
                           0
                         )) DESC
                LIMIT 5
            """
            cur.execute(sql, [uid, str(1883353860)])
            rows = cur.fetchall()
            items = []
            for r in rows:
                original_name = r["original_gift_name_json"] or None
                revealed_name = r["revealed_gift_name_json"] or r["gift_name"]
                cost = float(r["original_cost"] or 0)
                value = float(r["revealed_value"] or 0)
                assets = r["gift_assets"]
                gif = None
                webp = None
                img_basic = None
                if isinstance(assets, dict):
                    gif = assets.get("gif")
                    webp = assets.get("webp")
                    img_basic = assets.get("img_basic")
                items.append({
                    "original_gift_name": original_name,
                    "revealed_gift_name": revealed_name,
                    "original_cost": cost,
                    "revealed_value": value,
                    "profit": value - cost,
                    "assets": {
                        "gif": gif,
                        "webp": webp,
                        "img_basic": img_basic,
                    },
                    "timestamp": r["timestamp"].isoformat() if r["timestamp"] else None
                })
            cur.close()
            pg_conn.close()
            return jsonify({"items": items}), 200
        except Exception as e:
            print(f"获取盲盒差价Top失败: {str(e)}")
            return jsonify({"message": f"获取盲盒差价Top失败: {str(e)}"}), 500

    @app.route("/api/pnl/self/special_blind_summary", methods=["GET"])
    def get_self_special_blind_summary():
        """
        统计指定“盲盒亏损项”礼物的汇总数据（仅本房间）：
        - gift_ids 固定为 [32125, 32698, 32694, 32126]
        - 仅统计 is_blind_gift = true 的记录
        - 维度：按揭示礼物(revealed_gift_id)聚合
        返回：{ items: [{ gift_id, gift_name, total_units, total_cost, total_value }], totals: { units, cost, value } }
        单位：分（前端做换算显示电池）。
        """
        if "username" not in session:
            return jsonify({"message": "请先登录"}), 401

        # 查询用户的 bilibili_uid
        conn_sqlite = get_connection()
        cur_sqlite = conn_sqlite.cursor()
        cur_sqlite.execute("SELECT bilibili_uid FROM users WHERE id = ?", (session["user_id"],))
        row = cur_sqlite.fetchone()
        conn_sqlite.close()
        if not row or not row["bilibili_uid"]:
            return jsonify({"items": [], "totals": {"units": 0, "cost": 0, "value": 0}}), 200

        uid = str(row["bilibili_uid"]).strip()
        special_ids = [32125, 32698, 32694, 32126]

        try:
            config = get_config()
            pg_conn = psycopg2.connect(
                host=config.POSTGRES_HOST,
                port=config.POSTGRES_PORT,
                database=config.POSTGRES_DB,
                user=config.POSTGRES_USER,
                password=config.POSTGRES_PASSWORD
            )
            cur = pg_conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

            placeholders = ",".join(["%s"] * len(special_ids))
            sql = f"""
                WITH rec AS (
                  SELECT 
                    NULLIF((blind_box::jsonb)->>'revealed_gift_id','')::bigint AS revealed_id,
                    COALESCE(NULLIF((blind_box::jsonb)->>'revealed_gift_name',''), gift_name) AS revealed_name,
                    COALESCE(gift_num,1) AS units,
                    COALESCE(
                      (NULLIF((blind_box::jsonb)->>'original_gift_price','')::numeric) * COALESCE(gift_num,1),
                      total_coin,
                      total_price,
                      (price * COALESCE(gift_num,1)),
                      0
                    ) AS original_cost,
                    COALESCE(
                      (NULLIF((blind_box::jsonb)->>'revealed_gift_price','')::numeric) * COALESCE(gift_num,1),
                      (NULLIF((blind_box::jsonb)->>'gift_tip_price','')::numeric) * COALESCE(gift_num,1),
                      total_price,
                      (price * COALESCE(gift_num,1)),
                      total_coin,
                      0
                    ) AS revealed_value,
                    gift_assets
                  FROM gift_records
                  WHERE uid = %s
                    AND room_id::text = %s
                    AND is_blind_gift = true
                    AND NULLIF((blind_box::jsonb)->>'revealed_gift_id','')::bigint IN ({placeholders})
                )
                SELECT 
                  revealed_id AS gift_id,
                  revealed_name AS gift_name,
                  COALESCE(SUM(units), 0) AS total_units,
                  COALESCE(SUM(original_cost), 0) AS total_cost,
                  COALESCE(SUM(revealed_value), 0) AS total_value,
                  MAX(NULLIF((gift_assets::jsonb)->>'gif','')) AS asset_gif,
                  MAX(NULLIF((gift_assets::jsonb)->>'webp','')) AS asset_webp,
                  MAX(NULLIF((gift_assets::jsonb)->>'img_basic','')) AS asset_img
                FROM rec
                GROUP BY revealed_id, revealed_name
                ORDER BY total_units DESC
            """

            params = [uid, str(1883353860)] + special_ids
            cur.execute(sql, params)
            rows = cur.fetchall()
            items = []
            totals_units = 0
            totals_cost = 0.0
            totals_value = 0.0
            for r in rows:
                units = int(r["total_units"] or 0)
                cost = float(r["total_cost"] or 0)
                value = float(r["total_value"] or 0)
                totals_units += units
                totals_cost += cost
                totals_value += value
                items.append({
                    "gift_id": int(r["gift_id"]) if r["gift_id"] is not None else None,
                    "gift_name": r["gift_name"],
                    "total_units": units,
                    "total_cost": cost,
                    "total_value": value,
                    "assets": {
                        "gif": r["asset_gif"],
                        "webp": r["asset_webp"],
                        "img_basic": r["asset_img"],
                    }
                })

            cur.close()
            pg_conn.close()
            return jsonify({
                "items": items,
                "totals": {
                    "units": totals_units,
                    "cost": totals_cost,
                    "value": totals_value
                }
            }), 200
        except Exception as e:
            print(f"获取特别礼物汇总失败: {str(e)}")
            return jsonify({"message": f"获取特别礼物汇总失败: {str(e)}"}), 500

    @app.route("/api/points/self", methods=["GET"])
    def get_self_points():
        """
        计算当前登录用户在指定直播间自 2025-09-16 起的“积分”。
        规则：1 电池 = 1 积分（以总消费累计）。单位换算：数据库金额以“分”（电池*100），因此积分 = floor(总消费分/100)。
        返回：{ points: number, start_date: 'YYYY-MM-DD', days: [{ date: 'YYYY-MM-DD', cost: number }] }
        说明：仅按 room_id=1883353860 且当前登录用户的 uid 统计；包含所有礼物类型（不限制 is_blind_gift）。
        """
        if "user_id" not in session:
            return jsonify({"message": "请先登录"}), 401

        # 获取用户 bilibili_uid
        conn_sqlite = get_connection()
        cur_sqlite = conn_sqlite.cursor()
        cur_sqlite.execute("SELECT bilibili_uid FROM users WHERE id = ?", (session["user_id"],))
        row = cur_sqlite.fetchone()
        conn_sqlite.close()
        if not row or not row["bilibili_uid"]:
            return jsonify({"points": 0, "start_date": "2025-09-16", "days": []}), 200

        uid = str(row["bilibili_uid"]).strip()

        # 允许通过查询参数覆盖开始日期（可选）
        start_date_str = request.args.get("start_date")
        try:
            if start_date_str:
                start_date_dt = datetime.strptime(start_date_str, "%Y-%m-%d").date()
            else:
                start_date_dt = date(2025, 9, 16)
        except Exception:
            start_date_dt = date(2025, 9, 16)

        try:
            config = get_config()
            pg_conn = psycopg2.connect(
                host=config.POSTGRES_HOST,
                port=config.POSTGRES_PORT,
                database=config.POSTGRES_DB,
                user=config.POSTGRES_USER,
                password=config.POSTGRES_PASSWORD
            )
            cur = pg_conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

            # 采用东八区自然日统计：将 UTC 时间 +8 小时再取 date
            sql = """
                WITH rec AS (
                  SELECT 
                    (timestamp AT TIME ZONE 'UTC' + INTERVAL '8 hours')::date AS day_cn,
                    COALESCE(
                      (NULLIF((blind_box::jsonb)->>'original_gift_price','')::numeric) * COALESCE(gift_num,1),
                      total_coin,
                      total_price,
                      (price * COALESCE(gift_num,1)),
                      0
                    ) AS cost
                  FROM gift_records
                  WHERE uid = %s
                    AND room_id::text = %s
                    AND timestamp >= %s
                )
                SELECT day_cn AS day, COALESCE(SUM(cost), 0) AS total_cost
                FROM rec
                GROUP BY day_cn
                ORDER BY day_cn ASC
            """

            # Postgres 端时间边界按 UTC 存储，起始以 00:00:00 +08:00 对应的 UTC 时间传入，近似以 >= 边界过滤
            # 这里直接以本地日期的 00:00:00（naive）用于 >=，兼容现存存储（若为 UTC，会略微扩大范围但后续分日聚合不影响阈值判断）。
            start_dt = datetime.combine(start_date_dt, datetime.min.time())
            cur.execute(sql, [uid, str(1883353860), start_dt])
            rows = cur.fetchall()

            days = []
            points = 0
            threshold = 1000 * 100  # 1000 电池（金额以分计）
            for r in rows:
                day_str = r["day"].isoformat() if r["day"] else None
                total_cost = float(r["total_cost"] or 0)
                days.append({"date": day_str, "cost": total_cost})
                if total_cost >= threshold:
                    points += 1

            cur.close()
            pg_conn.close()

            return jsonify({
                "points": points,
                "start_date": start_date_dt.isoformat(),
                "days": days
            }), 200
        except Exception as e:
            print(f"计算积分失败: {str(e)}")
            return jsonify({"message": f"计算积分失败: {str(e)}"}), 500

    # 添加图片代理接口
    @app.route("/api/proxy/image")
    def proxy_image():
        """
        代理获取图片，解决防盗链问题
        """
        image_url = request.args.get('url')
        if not image_url:
            return jsonify({"message": "缺少图片URL"}), 400
            
        try:
            # 设置请求头，模拟浏览器请求
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://www.bilibili.com'
            }
            response = requests.get(image_url, headers=headers)
            
            # 返回图片数据
            return Response(
                response.content,
                mimetype=response.headers['Content-Type'],
                headers={
                    "Cache-Control": "public, max-age=31536000",
                    "Access-Control-Allow-Origin": "*"
                }
            )
        except Exception as e:
            print(f"代理图片错误: {str(e)}")
            return jsonify({"message": "获取图片失败"}), 500

    


# 创建应用实例
app = create_app()

if __name__ == "__main__":
    # 从环境变量获取主机和端口
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 5000))  # 默认使用5000端口
    app.run(debug=True, host=host, port=port)
