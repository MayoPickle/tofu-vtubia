import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, message, Tooltip, Typography, Space, Divider } from 'antd';
import { CopyOutlined, LockOutlined, UnlockOutlined, SyncOutlined } from '@ant-design/icons';
import { useDeviceDetect } from '../utils/deviceDetector';

const { Title, Paragraph, Text } = Typography;

// 4个挡位配置 - 修改为粉色系渐变
const levels = [
  {
    label: '幽灵',
    trigger: '观测站幽灵+密码',
    exponent: 2,
    comment: '一倍',
    color: 'linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%)',
  },
  {
    label: '强袭',
    trigger: '观测站强袭+密码',
    exponent: 3,
    comment: '十倍',
    color: 'linear-gradient(135deg, #FF69B4 0%, #FF1493 100%)',
  },
  {
    label: '泰坦',
    trigger: '观测站泰坦+密码',
    exponent: 4,
    comment: '百倍',
    color: 'linear-gradient(135deg, #FF1493 0%, #C71585 100%)',
  },
  {
    label: '全境',
    trigger: '观测站全境+密码',
    exponent: 5,
    comment: 'ALL IN',
    color: 'linear-gradient(135deg, #C71585 0%, #8B008B 100%)',
  },
];

/**
 * 真实 4 位密码
 */
function getRealPassword(exponent) {
  const now = new Date();
  // 严格使用UTC时间
  const M = now.getUTCMonth() + 1; // 1~12
  const D = now.getUTCDate();      // 1~31
  const H = now.getUTCHours();     // 0~23

  // 修改计算逻辑：使用相加而非拼接
  const baseNum = M + D + H;

  const bigVal = Math.pow(baseNum, exponent);
  const last4 = bigVal % 10000;

  return last4.toString().padStart(4, '0');
}

/**
 * 当前用户能否看到/复制真实密码
 * - 未登录 => 全部 "****"
 * - 管理员 => 全部真实密码
 * - 普通用户 => 仅前2挡位(0/1)真实密码, 后2(2/3) => "****"
 */
function getEffectivePassword(idx, realPwd, isLoggedIn, isAdmin) {
  if (!isLoggedIn) return '****';
  if (isAdmin) return realPwd;
  // 普通用户 => 仅前2挡位显示密码
  return (idx < 2) ? realPwd : '****';
}

/**
 * 是否可复制该挡位
 */
function canCopy(idx, isLoggedIn, isAdmin) {
  if (!isLoggedIn) return false;
  if (isAdmin) return true;
  // 普通用户 => 只能复制前2个
  return (idx < 2);
}

/**
 * 若按钮被禁用，返回原因；否则返回空字符串
 */
function getDisabledReason(idx, isLoggedIn, isAdmin) {
  if (!isLoggedIn) {
    return '请先登录后才可显示';
  }
  if (isAdmin) {
    return ''; // 管理员不禁用，无需理由
  }
  // 普通用户，idx >= 2 => 后2个挡位禁用
  if (idx >= 2) {
    return '只有管理员才能使用此挡位';
  }
  return ''; // 可用
}

/**
 * 去掉 "+密码"
 */
function getTriggerPrefix(originalTrigger) {
  return originalTrigger.replace('+密码', '');
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => {
      message.success('已复制到剪贴板');
    })
    .catch(() => {
      message.error('复制失败');
    });
}

// 密码过期倒计时计算
function getCountdownTime() {
  const now = new Date();
  const currentHour = now.getUTCHours();
  const nextHour = new Date(now);
  
  nextHour.setUTCHours(currentHour + 1, 0, 0, 0);
  
  // 计算剩余毫秒数
  const diffMs = nextHour - now;
  
  // 转换为分钟和秒
  const minutes = Math.floor(diffMs / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);
  
  return { minutes, seconds };
}

function Observatory({ isLoggedIn, isAdmin }) {
  const { isMobile } = useDeviceDetect();
  
  // 添加时间状态和自动刷新功能
  const [currentTime, setCurrentTime] = useState(new Date());
  const [countdown, setCountdown] = useState(getCountdownTime());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // 手动刷新函数
  const handleRefresh = () => {
    setIsRefreshing(true);
    setCurrentTime(new Date());
    setCountdown(getCountdownTime());
    
    // 模拟刷新动画效果
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };
  
  useEffect(() => {
    // 每分钟更新一次时间，确保密码保持最新
    const minuteTimer = setInterval(() => {
      setCurrentTime(new Date());
      setCountdown(getCountdownTime());
    }, 60000); // 60秒 = 1分钟
    
    // 倒计时每秒更新
    const secondTimer = setInterval(() => {
      setCountdown(getCountdownTime());
    }, 1000);
    
    // 组件卸载时清除定时器
    return () => {
      clearInterval(minuteTimer);
      clearInterval(secondTimer);
    };
  }, []);
  
  return (
    <div 
      style={{ 
        padding: isMobile ? '12px 8px' : '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'rgba(255, 245, 250, 0.8)',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(220, 110, 170, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 192, 203, 0.2)'
      }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        marginBottom: isMobile ? 12 : 20 
      }}>
        <Title level={isMobile ? 3 : 2} style={{ 
          margin: 0, 
          background: 'linear-gradient(45deg, #FF69B4, #FFB6C1)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 700,
        }}>
          观测站
        </Title>
        <Tooltip title="刷新密码">
          <Button 
            type="text"
            icon={<SyncOutlined spin={isRefreshing} style={{ color: '#FF69B4' }} />} 
            onClick={handleRefresh}
            style={{ marginLeft: 10 }}
          />
        </Tooltip>
      </div>
      
      <div style={{ 
        textAlign: 'center', 
        marginBottom: isMobile ? 16 : 24,
        padding: '8px',
        background: 'rgba(255, 230, 240, 0.6)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 192, 203, 0.3)'
      }}>
        <Text type="secondary" style={{ fontSize: isMobile ? '12px' : '14px', color: '#FF1493' }}>
          密码将在 {countdown.minutes}:{countdown.seconds.toString().padStart(2, '0')} 后更新
        </Text>
      </div>

      <Row gutter={isMobile ? [12, 12] : [16, 16]}>
        {levels.map((lvl, idx) => {
          // 1) 计算真实密码
          const realPwd = getRealPassword(lvl.exponent);

          // 2) 根据权限决定显示"****"还是真实密码
          const finalPwd = getEffectivePassword(idx, realPwd, isLoggedIn, isAdmin);

          // 3) 生成可复制的最终字符串
          const prefix = getTriggerPrefix(lvl.trigger);
          const finalTrigger = prefix + finalPwd;

          // 4) 判断按钮是否可用
          const copyAllowed = canCopy(idx, isLoggedIn, isAdmin);

          // 5) 若禁用 => 返回原因，用 Tooltip 提示
          const disabledReason = getDisabledReason(idx, isLoggedIn, isAdmin);

          return (
            <Col xs={12} sm={12} md={6} key={lvl.label}>
              <Card
                title={
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {!copyAllowed && <LockOutlined style={{ marginRight: 5 }} />}
                    {copyAllowed && <UnlockOutlined style={{ marginRight: 5 }} />}
                    <span>{lvl.label}</span>
                  </div>
                }
                bordered={false}
                size={isMobile ? "small" : "default"}
                style={{ 
                  textAlign: 'center', 
                  height: '100%',
                  backgroundImage: 'linear-gradient(to bottom, rgba(255, 245, 250, 0.95), rgba(255, 240, 245, 0.85))',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(220, 110, 170, 0.08)',
                  border: '1px solid rgba(255, 192, 203, 0.2)',
                  transition: 'all 0.3s ease',
                }}
                styles={{
                  header: {
                    fontSize: isMobile ? '14px' : '16px',
                    padding: isMobile ? '8px' : '12px',
                    fontWeight: 'bold',
                    borderBottom: '1px solid rgba(255, 192, 203, 0.3)',
                    backgroundImage: lvl.color,
                    color: 'white',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                  },
                  body: {
                    padding: isMobile ? '12px' : '24px'
                  }
                }}
                hoverable
              >
                <Paragraph style={{ 
                  fontSize: isMobile ? '12px' : '14px', 
                  marginBottom: isMobile ? 8 : 12,
                  color: '#555'
                }}>
                  挡位说明：<Text strong style={{ color: '#FF1493' }}>{lvl.comment}</Text>
                </Paragraph>

                <Divider style={{ margin: isMobile ? '8px 0' : '12px 0', borderColor: 'rgba(255, 192, 203, 0.3)' }} />

                {/* 触发关键词 + 复制按钮 */}
                <div style={{ marginBottom: isMobile ? 10 : 16 }}>
                  <Paragraph style={{ 
                    marginBottom: isMobile ? 6 : 10,
                    fontSize: isMobile ? '12px' : '14px',
                    color: '#666'
                  }}>
                    触发关键词：
                    <Text strong style={{ 
                      color: '#111',
                      display: 'block',
                      padding: '5px',
                      margin: '4px 0',
                      background: 'rgba(255, 230, 240, 0.5)',
                      borderRadius: '4px',
                      wordBreak: 'break-all',
                      border: '1px solid rgba(255, 192, 203, 0.2)'
                    }}>
                      {finalTrigger}
                    </Text>
                  </Paragraph>

                  <Tooltip
                    title={disabledReason} // 若为空字符串则不显示
                    mouseEnterDelay={0.2}  // 鼠标悬停0.2s后显示提示
                  >
                    <Button
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipboard(finalTrigger)}
                      size={isMobile ? "small" : "middle"}
                      disabled={!copyAllowed}
                      type="primary"
                      style={{ 
                        background: copyAllowed ? lvl.color : undefined,
                        borderColor: 'transparent',
                        width: '100%',
                        boxShadow: copyAllowed ? '0 2px 6px rgba(255, 105, 180, 0.25)' : 'none',
                      }}
                    >
                      复制触发词
                    </Button>
                  </Tooltip>
                </div>

                {/* 显示4位密码(或 "****") */}
                <div style={{ 
                  fontSize: isMobile ? '28px' : '36px', 
                  fontWeight: 'bold', 
                  fontFamily: 'monospace',
                  color: finalPwd === '****' ? '#C9C9C9' : '#FF1493',
                  padding: '10px 0',
                  letterSpacing: '2px',
                  textShadow: finalPwd === '****' ? 'none' : '0 1px 0 rgba(255, 105, 180, 0.1)',
                }}>
                  {finalPwd}
                </div>
                <div style={{ 
                  fontSize: isMobile ? '10px' : '12px', 
                  color: '#999', 
                  marginTop: 4 
                }}>
                  当前 4 位密码
                </div>
              </Card>
            </Col>
          );
        })}

        {/* 机器人豆豆使用说明：放在密码卡片下面 */}
        <Col span={24}>
          <Card
            bordered={false}
            style={{
              marginTop: isMobile ? 4 : 8,
              background: 'linear-gradient(180deg, rgba(255, 245, 250, 0.95), rgba(255, 240, 245, 0.85))',
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(220, 110, 170, 0.08)',
              border: '1px solid rgba(255, 192, 203, 0.2)'
            }}
            styles={{
              header: {
                padding: isMobile ? '8px 12px' : '12px 16px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #FF69B4, #FFB6C1)',
                color: '#fff',
                textShadow: '0 1px 2px rgba(0,0,0,0.15)'
              },
              body: {
                padding: isMobile ? 12 : 16
              }
            }}
            title={
              <span>
                机器人豆豆使用说明
              </span>
            }
          >
            <Paragraph style={{ marginBottom: isMobile ? 8 : 10, color: '#555' }}>
              <Text strong style={{ color: '#FF1493' }}>触发关键词：</Text> 豆豆
            </Paragraph>
            <Divider style={{ margin: isMobile ? '8px 0' : '12px 0', borderColor: 'rgba(255, 192, 203, 0.3)' }} />
            <Paragraph style={{ marginBottom: isMobile ? 6 : 8, color: '#666' }}>
              <Text strong style={{ color: '#FF69B4' }}>模式控制</Text>
            </Paragraph>
            <ul style={{ paddingLeft: isMobile ? 18 : 20, marginTop: 0, marginBottom: isMobile ? 8 : 12, color: '#555', fontSize: isMobile ? 12 : 14 }}>
              <li>关闭欢迎模式：弹幕发送「记仇机器人关闭欢迎模式」</li>
              <li>开启欢迎模式：弹幕发送「记仇机器人开启欢迎模式」</li>
            </ul>
            <Paragraph style={{ marginBottom: isMobile ? 6 : 8, color: '#666' }}>
              <Text strong style={{ color: '#FF69B4' }}>自动 PK 投票</Text>
            </Paragraph>
            <ul style={{ paddingLeft: isMobile ? 18 : 20, marginTop: 0, marginBottom: isMobile ? 8 : 12, color: '#555', fontSize: isMobile ? 12 : 14 }}>
              <li>打 1 票：弹幕发送「记仇机器人挽尊299792」</li>
              <li>打 10 票：弹幕发送「记仇机器人有效299792」</li>
            </ul>
            <Paragraph style={{ marginBottom: 0, color: '#555' }}>
              <Text strong style={{ color: '#FF69B4' }}>点赞</Text>：触发豆豆后弹幕中包含”点赞“会触发点赞
            </Paragraph>
          </Card>
        </Col>
      </Row>
      
      {/* 添加上次更新时间提示 */}
      <div style={{
        textAlign: 'center',
        fontSize: isMobile ? '11px' : '13px',
        color: '#888',
        marginTop: isMobile ? 16 : 24,
        padding: '8px',
        background: 'rgba(255, 230, 240, 0.3)',
        borderRadius: '6px',
        border: '1px solid rgba(255, 192, 203, 0.2)'
      }}>
        <SyncOutlined spin={isRefreshing} style={{ marginRight: 5, color: '#FF69B4' }} />
        密码自动更新 (上次更新: {currentTime.toLocaleTimeString()})
      </div>
    </div>
  );
}

export default Observatory;
