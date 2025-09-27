# config.py
import os
from dotenv import load_dotenv
from datetime import timedelta

# 加载.env文件
load_dotenv()

class Config:
    """应用配置类"""
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
    UPLOAD_FOLDER = 'uploads'  # 文件上传目录
    DB_PATH = os.getenv("DB_PATH", 'songs.db')
    PERMANENT_SESSION_LIFETIME = timedelta(days=180)
    
    # PostgreSQL数据库配置
    POSTGRES_HOST = os.getenv("POSTGRES_HOST")
    POSTGRES_PORT = int(os.getenv("POSTGRES_PORT", "5432"))
    POSTGRES_DB = os.getenv("POSTGRES_DB")
    POSTGRES_USER = os.getenv("POSTGRES_USER")
    POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")

class ProductionConfig(Config):
    """生产环境配置"""
    pass

class DevelopmentConfig(Config):
    """开发环境配置"""
    DEBUG = True

class TestingConfig(Config):
    """测试环境配置"""
    TESTING = True
    DB_PATH = 'test_songs.db'

# 根据环境变量选择配置
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config():
    """根据环境变量获取配置"""
    env = os.environ.get('FLASK_ENV', 'default')
    return config.get(env, config['default']) 