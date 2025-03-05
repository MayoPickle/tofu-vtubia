# database.py
import sqlite3
import os
import json

class Database:
    def __init__(self, db_path="songs.db"):
        """初始化数据库类，设置数据库路径"""
        self.db_path = db_path
    
    def get_connection(self):
        """获取数据库连接"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # 方便后续以字典形式获取数据
        return conn
    
    def init_db(self, reset=False):
        """初始化数据库：创建必要的表并插入示例数据
        
        Args:
            reset: 如果为True，则删除现有数据库并重新创建
        """
        if reset and os.path.exists(self.db_path):
            os.remove(self.db_path)
        
        # 创建所有表
        self.create_users_table()
        self.create_songs_table()
        self.create_prizes_table()
        
        # 插入初始数据
        self.seed_users_data()
        self.seed_songs_data()
    
    def create_users_table(self):
        """创建用户表"""
        conn = self.get_connection()
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                bilibili_uid TEXT,
                is_admin INTEGER DEFAULT 0
            )
        """)
        conn.commit()
        conn.close()
    
    def create_songs_table(self):
        """创建歌曲表"""
        conn = self.get_connection()
        cur = conn.cursor()
        cur.execute("""
        CREATE TABLE IF NOT EXISTS songs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            artist TEXT NOT NULL,
            album TEXT,
            genre TEXT,
            year INTEGER,
            meta_data TEXT,
            tags TEXT
        )
        """)
        conn.commit()
        conn.close()
    
    def create_prizes_table(self):
        """创建奖品表"""
        conn = self.get_connection()
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS prizes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                probability REAL NOT NULL,
                image TEXT
            )
        """)
        conn.commit()
        conn.close()
    
    def seed_users_data(self):
        """插入默认用户数据"""
        conn = self.get_connection()
        cur = conn.cursor()
        
        # 检查是否已存在管理员用户
        cur.execute("SELECT id FROM users WHERE username = ?", ("tofu",))
        if not cur.fetchone():
            # 插入默认管理员
            admin_users = [
                ("tofu", "5b5f2a30642928dc7f96079f72a4ac0f", "3915536", 1),
                ("xiaotu", "5b5f2a30642928dc7f96079f72a4ac0f", "3915536", 1)
            ]
            cur.executemany("""
                INSERT INTO users (username, password, bilibili_uid, is_admin)
                VALUES (?, ?, ?, ?)
            """, admin_users)
            conn.commit()
        
        conn.close()
    
    def seed_songs_data(self):
        """插入示例歌曲数据"""
        conn = self.get_connection()
        cur = conn.cursor()
        
        # 检查是否已存在歌曲数据
        cur.execute("SELECT COUNT(*) FROM songs")
        count = cur.fetchone()[0]
        
        if count == 0:
            # 插入示例歌曲数据
            example_songs = [
                ("Shape of You", "Ed Sheeran", "Divide", "Pop", 2017, '{"duration": "3:53", "producer": "Steve Mac"}', "流行,英文,热门,电子"),
                ("Billie Jean", "Michael Jackson", "Thriller", "Pop", 1982, '{"duration": "4:54"}', "经典,流行,舞曲,节奏布鲁斯"),
                ("Hotel California", "Eagles", "Hotel California", "Rock", 1977, '{"duration": "6:30"}', "经典,摇滚,吉他,传奇"),
                ("Imagine", "John Lennon", "Imagine", "Rock", 1971, '{"duration": "3:07"}', "经典,摇滚,和平,抒情"),
                ("Lose Yourself", "Eminem", "8 Mile Soundtrack", "Hip-Hop", 2002, '{"duration": "5:20"}', "说唱,激励,电影原声"),
                ("青花瓷", "周杰伦", "我很忙", "C-Pop", 2007, '{"duration": "3:59"}', "华语,古风,流行,国风"),
                ("漂洋过海来看你", "李宗盛", "山丘", "Folk", 1989, '{"duration": "5:45"}', "华语,民谣,经典,情歌"),
                ("水星记", "郭顶", "飞行器的执行周期", "Alternative", 2016, '{"duration": "4:09"}', "华语,流行,小众,治愈"),
                ("纸短情长", "烟把儿", "纸短情长", "Folk", 2018, '{"duration": "3:24"}', "华语,民谣,情歌,网络"),
                ("春夏秋冬", "张国荣", "Summer Romance", "C-Pop", 1988, '{"duration": "4:16"}', "华语,经典,粤语,流行")
            ]
            
            cur.executemany("""
            INSERT INTO songs (title, artist, album, genre, year, meta_data, tags)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, example_songs)
            conn.commit()
        
        conn.close()

# 创建默认数据库实例
db = Database()

# 提供简便的访问方法，便于从其他模块调用
def get_connection():
    """获取数据库连接"""
    return db.get_connection()

def init_db(reset=False):
    """初始化数据库"""
    db.init_db(reset)
