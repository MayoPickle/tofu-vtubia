import React from 'react';
import { List, Space, Tag, Avatar, Button, Typography } from 'antd';
import { HeartOutlined, CrownOutlined } from '@ant-design/icons';
import { themeColor } from '../Intro';
import { getGuardLevelColor, getGuardLevelText } from '../../utils/guardsHelper';

const { Paragraph } = Typography;

// 守护者列表组件
const GuardsList = ({ 
  guards, 
  isMobile, 
  showCards, 
  expandedGuards, 
  handleGuardExpand, 
  openGuardStory 
}) => {
  return (
    <List
      grid={{ 
        gutter: [24, 24],
        xs: 1,
        sm: 1,
        md: 2,
        lg: 2,
        xl: 3,
        xxl: 3,
      }}
      dataSource={guards}
      renderItem={(guard, index) => (
        <List.Item 
          style={{
            transform: showCards ? 'translateY(0)' : 'translateY(20px)',
            opacity: showCards ? 1 : 0,
            transition: `all 0.5s ease ${index * 0.1}s`,
          }}
        >
          <div
            style={{
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden',
              background: '#fff',
              boxShadow: '0 8px 24px rgba(255, 182, 193, 0.15)',
              border: '1px solid rgba(255, 192, 203, 0.2)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              minHeight: expandedGuards[guard.id] ? '380px' : '260px',
              display: 'flex',
              flexDirection: 'column',
              transform: 'translateY(0)',
              ':hover': {
                transform: 'translateY(-6px)',
                boxShadow: '0 12px 28px rgba(255, 182, 193, 0.25)',
              }
            }}
            onClick={() => handleGuardExpand(guard.id)}
            className="guard-card"
          >
            {/* 头像背景 */}
            <div style={{
              height: '100px',
              background: `linear-gradient(45deg, ${getGuardLevelColor(guard.guard_level)}22, ${getGuardLevelColor(guard.guard_level)}11)`,
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
            }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${getGuardLevelColor(guard.guard_level)}22 30%, transparent 70%)`,
                animation: 'pulse 3s infinite',
              }} />
            </div>

            {/* 头像 */}
            <div style={{
              position: 'absolute',
              top: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2,
            }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                padding: '3px',
                background: '#fff',
                boxShadow: '0 4px 16px rgba(255, 182, 193, 0.2)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                animation: 'float 3s ease-in-out infinite',
              }}
              className="avatar-container"
              >
                <Avatar 
                  size={94}
                  src={guard.face ? `/api/proxy/image?url=${encodeURIComponent(guard.face)}` : null}
                  style={{ 
                    border: `2px solid ${getGuardLevelColor(guard.guard_level)}22`,
                    transition: 'all 0.3s ease',
                  }}
                  className="avatar-image"
                  fallback={
                    <div style={{
                      width: '94px',
                      height: '94px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `linear-gradient(135deg, ${getGuardLevelColor(guard.guard_level)}22, ${getGuardLevelColor(guard.guard_level)}11)`,
                      color: getGuardLevelColor(guard.guard_level),
                      fontSize: '32px',
                      fontWeight: 'bold',
                    }}>
                      {guard.username.slice(0, 1)}
                    </div>
                  }
                />
              </div>
            </div>

            {/* 内容区域 */}
            <div style={{
              padding: '50px 16px 16px',
              textAlign: 'center',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            }}>
              <div style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}>
                {guard.username}
                {guard.is_top3 && (
                  <div style={{
                    background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: '14px',
                  }}>
                    👑 TOP {guard.rank}
                  </div>
                )}
              </div>

              <Space size={4} wrap style={{ justifyContent: 'center', marginBottom: '10px' }}>
                <Tag 
                  color={getGuardLevelColor(guard.guard_level)}
                  style={{
                    borderRadius: '10px',
                    padding: '1px 8px',
                    border: 'none',
                    fontSize: '12px',
                    opacity: 0.8,
                  }}
                >
                  <CrownOutlined style={{ marginRight: '4px' }} />
                  {getGuardLevelText(guard.guard_level)}
                </Tag>
                
                {guard.medal_name && (
                  <Tag
                    style={{
                      borderRadius: '10px',
                      padding: '1px 8px',
                      border: 'none',
                      background: `linear-gradient(45deg, ${guard.medal_color_start || '#FFB6C1'}, ${guard.medal_color_end || '#FF69B4'})`,
                      color: '#fff',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                    }}
                    className="medal-tag"
                    title={`粉丝勋章颜色: ${guard.medal_color_start} → ${guard.medal_color_end}`}
                  >
                    <span style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      background: 'rgba(255, 255, 255, 0.2)',
                      padding: '0 4px',
                      borderRadius: '8px',
                      marginRight: '2px',
                    }}>
                      🏅
                    </span>
                    {guard.medal_name} · {guard.medal_level}
                  </Tag>
                )}
              </Space>

              <div style={{
                fontSize: '13px',
                color: '#666',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                marginBottom: '12px',
              }}>
                <HeartOutlined style={{ color: themeColor }} />
                已陪伴: {guard.accompany} 天
              </div>

              {/* 展开的故事内容 */}
              <div style={{
                maxHeight: expandedGuards[guard.id] ? '160px' : '0',
                opacity: expandedGuards[guard.id] ? 1 : 0,
                overflow: 'hidden',
                transition: 'all 0.3s ease-in-out',
                marginTop: expandedGuards[guard.id] ? '12px' : '0',
                flex: 1,
              }}>
                <div style={{
                  background: 'rgba(255, 240, 245, 0.5)',
                  borderRadius: '12px',
                  padding: '24px 12px 12px',
                  fontSize: '13px',
                  color: '#666',
                  lineHeight: '1.6',
                  position: 'relative',
                  height: '100%',
                  marginTop: '10px',
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#fff',
                    padding: '2px 10px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    color: themeColor,
                    boxShadow: '0 2px 8px rgba(255, 182, 193, 0.2)',
                    border: '1px solid rgba(255, 192, 203, 0.3)',
                    whiteSpace: 'nowrap',
                    zIndex: 1,
                  }}>
                    守护者档案 #{guard.rank}
                  </div>
                  <Paragraph style={{ 
                    margin: 0,
                    fontSize: '13px',
                    color: '#666',
                  }}>
                    这是一位来自遥远星系的旅行者，带着对9672星球的向往而来。
                    在这里，{guard.username} 已经陪伴了 {guard.accompany} 个日夜，
                    见证了无数个日出日落，也留下了许多温暖的故事...
                  </Paragraph>
                </div>
              </div>

              {/* 展开/收起指示器 */}
              <div style={{
                marginTop: 'auto',
                color: '#999',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '4px 0',
              }}>
                <Button
                  type="link"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    openGuardStory(guard);
                  }}
                  style={{
                    fontSize: '13px',
                    color: themeColor,
                    padding: '4px 8px',
                    height: 'auto',
                    background: 'rgba(255, 133, 162, 0.1)',
                    borderRadius: '8px',
                  }}
                >
                  查看完整故事
                </Button>
                <span style={{ color: '#ccc' }}>|</span>
                {expandedGuards[guard.id] ? '收起简介' : '展开简介'} 
              </div>
            </div>
          </div>
        </List.Item>
      )}
    />
  );
};

// 列表标题组件
GuardsList.Title = ({ isMobile }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <div style={{ 
      background: 'rgba(255, 133, 162, 0.1)', 
      borderRadius: '50%', 
      width: '36px', 
      height: '36px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      marginRight: '12px',
    }}>
      <CrownOutlined style={{ color: themeColor, fontSize: '18px' }} />
    </div>
    <span style={{ 
      fontWeight: 'bold', 
      fontSize: isMobile ? '16px' : '18px',
      background: 'linear-gradient(45deg, #FF85A2, #FF1493)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }}>星球守护者</span>
  </div>
);

// 计数标签组件
GuardsList.Counter = ({ count }) => (
  <Tag color={themeColor} style={{ marginLeft: '8px' }}>
    {count} 位守护者
  </Tag>
);

export default GuardsList; 