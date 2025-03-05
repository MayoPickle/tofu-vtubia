#!/usr/bin/env python
# main.py - 应用入口点
import os
import argparse
from dotenv import load_dotenv
from app import create_app
from database import init_db

# 加载环境变量
load_dotenv()

def parse_args():
    """解析命令行参数"""
    parser = argparse.ArgumentParser(description='歌曲列表后端服务')
    parser.add_argument('--init-db', action='store_true', help='初始化数据库')
    parser.add_argument('--reset-db', action='store_true', help='重置数据库（会删除现有数据）')
    return parser.parse_args()

if __name__ == "__main__":
    # 解析命令行参数
    args = parse_args()
    
    # 处理数据库初始化/重置选项
    if args.init_db:
        print("正在初始化数据库...")
        init_db(reset=False)
        print("数据库初始化完成！")
        exit(0)
    
    if args.reset_db:
        print("警告：即将重置数据库，所有现有数据将被删除！")
        confirm = input("确定要继续吗？(y/n): ")
        if confirm.lower() == 'y':
            print("正在重置数据库...")
            init_db(reset=True)
            print("数据库重置完成！")
        else:
            print("操作已取消")
        exit(0)
    
    # 创建应用实例
    app = create_app()
    
    # 从环境变量获取主机和端口，如果未设置则使用默认值
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    
    # 启动应用
    print(f"启动服务器 - {'调试模式' if debug else '生产模式'}")
    app.run(host=host, port=port, debug=debug) 