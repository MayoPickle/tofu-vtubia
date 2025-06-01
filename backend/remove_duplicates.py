#!/usr/bin/env python3
"""
清除数据库中重复歌曲的脚本
重复标准：相同的 title 和 artist
保留策略：保留ID最小的记录（即最早添加的）
"""

import sys
from database import get_connection

def find_duplicates():
    """查找重复的歌曲"""
    conn = get_connection()
    cur = conn.cursor()
    
    # 查找重复的歌曲（基于title和artist）
    cur.execute('''
        SELECT title, artist, COUNT(*) as count 
        FROM songs 
        GROUP BY title, artist 
        HAVING COUNT(*) > 1
        ORDER BY count DESC
    ''')
    
    duplicates = cur.fetchall()
    conn.close()
    
    return duplicates

def get_duplicate_ids():
    """获取需要删除的重复歌曲ID列表"""
    conn = get_connection()
    cur = conn.cursor()
    
    # 查找每组重复歌曲中除了最小ID外的所有ID
    cur.execute('''
        SELECT id
        FROM songs s1
        WHERE EXISTS (
            SELECT 1 
            FROM songs s2 
            WHERE s1.title = s2.title 
            AND s1.artist = s2.artist 
            AND s1.id > s2.id
        )
        ORDER BY id
    ''')
    
    duplicate_ids = [row[0] for row in cur.fetchall()]
    conn.close()
    
    return duplicate_ids

def remove_duplicates(dry_run=True):
    """删除重复的歌曲
    
    Args:
        dry_run: 如果为True，只显示会删除的记录，不实际删除
    """
    print("=== 数据库重复歌曲清理工具 ===\n")
    
    # 先显示当前统计
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM songs")
    total_before = cur.fetchone()[0]
    print(f"当前数据库中总歌曲数: {total_before}")
    
    # 查找重复的歌曲
    duplicates = find_duplicates()
    
    if not duplicates:
        print("✅ 数据库中没有发现重复的歌曲！")
        conn.close()
        return
    
    print(f"\n发现 {len(duplicates)} 组重复歌曲:")
    print("-" * 80)
    print(f"{'歌曲名':<30} {'艺术家':<20} {'重复次数':<10}")
    print("-" * 80)
    
    total_duplicates = 0
    for title, artist, count in duplicates[:20]:  # 只显示前20个
        print(f"{title[:28]:<30} {artist[:18]:<20} {count:<10}")
        total_duplicates += count - 1  # 每组保留1个，删除count-1个
    
    if len(duplicates) > 20:
        remaining = len(duplicates) - 20
        remaining_count = sum(count - 1 for _, _, count in duplicates[20:])
        total_duplicates += remaining_count
        print(f"... 还有 {remaining} 组重复歌曲")
    
    print("-" * 80)
    print(f"总计需要删除的重复歌曲数: {total_duplicates}")
    
    # 获取要删除的ID列表
    duplicate_ids = get_duplicate_ids()
    
    if dry_run:
        print(f"\n🔍 预览模式 - 以下是将要删除的歌曲ID:")
        print(f"ID列表: {duplicate_ids[:50]}{'...' if len(duplicate_ids) > 50 else ''}")
        print(f"\n⚠️  如要实际删除，请运行: python remove_duplicates.py --confirm")
    else:
        # 实际删除
        print(f"\n🗑️  开始删除 {len(duplicate_ids)} 首重复歌曲...")
        
        if duplicate_ids:
            # 批量删除
            placeholders = ','.join(['?' for _ in duplicate_ids])
            delete_query = f"DELETE FROM songs WHERE id IN ({placeholders})"
            cur.execute(delete_query, duplicate_ids)
            conn.commit()
            
            # 显示删除后的统计
            cur.execute("SELECT COUNT(*) FROM songs")
            total_after = cur.fetchone()[0]
            
            print(f"✅ 删除完成！")
            print(f"删除前: {total_before} 首歌曲")
            print(f"删除后: {total_after} 首歌曲")
            print(f"实际删除: {total_before - total_after} 首重复歌曲")
    
    conn.close()

def show_detailed_duplicates():
    """显示重复歌曲的详细信息"""
    conn = get_connection()
    cur = conn.cursor()
    
    # 获取重复歌曲的详细信息
    cur.execute('''
        SELECT s1.id, s1.title, s1.artist, s1.album, s1.year
        FROM songs s1
        WHERE EXISTS (
            SELECT 1 
            FROM songs s2 
            WHERE s1.title = s2.title 
            AND s1.artist = s2.artist 
            AND s1.id != s2.id
        )
        ORDER BY s1.title, s1.artist, s1.id
    ''')
    
    duplicates = cur.fetchall()
    
    if duplicates:
        print("\n📋 重复歌曲详细列表:")
        print("-" * 100)
        print(f"{'ID':<6} {'歌曲名':<30} {'艺术家':<20} {'专辑':<25} {'年份':<6}")
        print("-" * 100)
        
        current_song = None
        for row in duplicates:
            song_key = (row[1], row[2])  # title, artist
            if song_key != current_song:
                if current_song is not None:
                    print("-" * 100)
                current_song = song_key
            
            print(f"{row[0]:<6} {row[1][:28]:<30} {row[2][:18]:<20} {(row[3] or '')[:23]:<25} {row[4] or '':<6}")
    
    conn.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == "--confirm":
            # 实际删除
            remove_duplicates(dry_run=False)
        elif sys.argv[1] == "--detail":
            # 显示详细信息
            show_detailed_duplicates()
        elif sys.argv[1] == "--help":
            print("用法:")
            print("  python remove_duplicates.py          # 预览模式，不实际删除")
            print("  python remove_duplicates.py --confirm # 实际删除重复歌曲")
            print("  python remove_duplicates.py --detail  # 显示重复歌曲详细信息")
            print("  python remove_duplicates.py --help    # 显示帮助信息")
        else:
            print("未知参数，使用 --help 查看用法")
    else:
        # 默认预览模式
        remove_duplicates(dry_run=True) 