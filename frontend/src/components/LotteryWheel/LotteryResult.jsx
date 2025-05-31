// LotteryResult.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Typography, Button, message, Space, Divider } from 'antd';
import { GiftOutlined, UserOutlined, TrophyOutlined, HeartOutlined, StarOutlined, CloseOutlined, SaveOutlined } from '@ant-design/icons';
import { useDeviceDetect } from '../../utils/deviceDetector';
import { LOTTERY_MODES } from './constants';

const { Title, Text } = Typography;

// 主题颜色和渐变定义
const themeColor = '#FF85A2';
const themeGradient = 'linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%)';

function LotteryResultModal({ visible, result, onClose }) {
  const { isMobile } = useDeviceDetect();
  const [showAnimation, setShowAnimation] = useState(false);

  // 当弹窗显示时触发动画
  useEffect(() => {
    if (visible && result && result.name) {
      setShowAnimation(true);
      const timer = setTimeout(() => {
        setShowAnimation(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible, result]);

  // 保存结果到历史记录
  const saveToHistory = () => {
    const history = JSON.parse(localStorage.getItem('lottery_history') || '[]');
    const newRecord = {
      ...result,
      timestamp: new Date().toISOString(),
      id: Date.now()
    };
    history.unshift(newRecord);
    // 只保留最近50条记录
    if (history.length > 50) {
      history.splice(50);
    }
    localStorage.setItem('lottery_history', JSON.stringify(history));
    message.success('结果已保存到历史记录');
  };

  // 没有结果时不显示弹窗
  if (!result || !result.name) {
    return null;
  }

  // 根据模式渲染不同的结果展示
  const renderResult = () => {
    const isGiftMemberMode = result.mode === LOTTERY_MODES.GIFT_MEMBER_MODE;
    
    return (
      <div style={{ 
        textAlign: 'center',
        padding: isMobile ? '32px 24px' : '48px',
        background: 'linear-gradient(135deg, rgba(255, 182, 193, 0.1) 0%, rgba(255, 105, 180, 0.1) 100%)',
        borderRadius: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* 装饰性背景 */}
        <div style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,192,203,0.2) 0%, rgba(255,192,203,0) 70%)',
          top: '-50px',
          right: '-50px',
          zIndex: 0,
        }} />
        
        <div style={{
          position: 'absolute',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,105,180,0.2) 0%, rgba(255,105,180,0) 70%)',
          bottom: '-30px',
          left: '-30px',
          zIndex: 0,
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* 祝贺图标和标题 */}
          <div style={{ 
            marginBottom: '32px',
            animation: showAnimation ? 'bounce 1s ease-in-out' : 'none'
          }}>
            <div style={{
              fontSize: isMobile ? '48px' : '64px',
              marginBottom: '16px',
              animation: showAnimation ? 'spin 2s ease-in-out' : 'none'
            }}>
              🎉
            </div>
            
            {isGiftMemberMode ? (
              <div>
                <Title level={isMobile ? 2 : 1} style={{ 
                  margin: '0 0 12px 0',
                  background: themeGradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: isMobile ? '28px' : '36px',
                  fontWeight: 'bold'
                }}>
                  🏆 恭喜中奖！
                </Title>
                <Text style={{ 
                  color: '#666', 
                  fontSize: isMobile ? '16px' : '18px',
                  display: 'block'
                }}>
                  幸运获奖者诞生了！
                </Text>
              </div>
            ) : (
              <div>
                <Title level={isMobile ? 2 : 1} style={{ 
                  margin: '0 0 12px 0',
                  background: themeGradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: isMobile ? '28px' : '36px',
                  fontWeight: 'bold'
                }}>
                  {result.name === '未中奖' ? '💔 很遗憾' : '🎁 恭喜中奖！'}
                </Title>
                <Text style={{ 
                  color: '#666', 
                  fontSize: isMobile ? '16px' : '18px',
                  display: 'block'
                }}>
                  {result.name === '未中奖' ? '这次没有中奖，下次再来' : '您抽中了精美奖品！'}
                </Text>
              </div>
            )}
          </div>

          {/* 主要结果展示 */}
          <div style={{ 
            marginBottom: '32px',
            transform: showAnimation ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.8s ease',
          }}>
            {/* 头像/奖品图片 */}
            {result.image && (
              <div style={{ 
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'center',
                transform: showAnimation ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 0.5s ease',
                filter: showAnimation ? 'drop-shadow(0 0 30px rgba(255, 133, 162, 0.6))' : 'drop-shadow(0 8px 24px rgba(255, 133, 162, 0.3))'
              }}>
                <img
                  src={result.image}
                  alt={result.name}
                  style={{
                    width: isMobile ? '150px' : '200px',
                    height: isMobile ? '150px' : '200px',
                    objectFit: 'cover',
                    borderRadius: isGiftMemberMode ? '50%' : '20px',
                    border: `4px solid ${themeColor}`,
                    background: '#fff',
                    animation: showAnimation ? 'pulse 2s ease-in-out infinite' : 'none'
                  }}
                />
              </div>
            )}

            {/* 名称 */}
            <Title level={isMobile ? 2 : 1} style={{ 
              margin: '16px 0',
              color: themeColor,
              textAlign: 'center',
              fontSize: isMobile ? '32px' : '42px',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(255, 133, 162, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              {isGiftMemberMode ? <UserOutlined /> : <GiftOutlined />}
              <span style={{ wordBreak: 'break-all' }}>{result.name}</span>
            </Title>

            {/* 礼物抽人模式：显示获得的礼品 */}
            {isGiftMemberMode && result.gift && (
              <div style={{
                marginTop: '24px',
                padding: '24px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '20px',
                border: '2px solid #FF85A2',
                boxShadow: '0 8px 24px rgba(255, 133, 162, 0.2)',
                maxWidth: '400px',
                margin: '24px auto 0'
              }}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <GiftOutlined style={{ fontSize: '24px', color: themeColor }} />
                  <Text style={{ 
                    fontSize: isMobile ? '18px' : '20px',
                    fontWeight: 'bold',
                    color: themeColor
                  }}>
                    获得礼品
                  </Text>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  {result.gift.image && (
                    <img
                      src={result.gift.image}
                      alt={result.gift.name}
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                        borderRadius: '12px',
                        marginBottom: '12px',
                        border: '2px solid #FF85A2'
                      }}
                    />
                  )}
                  <div style={{ 
                    fontSize: isMobile ? '20px' : '24px',
                    fontWeight: 'bold',
                    color: themeColor,
                    marginBottom: '8px'
                  }}>
                    {result.gift.name} × {result.gift.quantity}
                  </div>
                  {result.gift.description && (
                    <div style={{ 
                      fontSize: '14px',
                      color: '#666',
                      lineHeight: '1.4'
                    }}>
                      {result.gift.description}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <Space size="large" wrap>
            <Button
              type="primary"
              size="large"
              onClick={saveToHistory}
              icon={<SaveOutlined />}
              style={{
                background: themeGradient,
                border: 'none',
                borderRadius: '16px',
                height: '48px',
                fontSize: '16px',
                fontWeight: 'bold',
                boxShadow: '0 6px 16px rgba(255, 133, 162, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              保存记录
            </Button>
            
            <Button
              size="large"
              onClick={onClose}
              icon={<CloseOutlined />}
              style={{
                borderColor: themeColor,
                color: themeColor,
                borderRadius: '16px',
                height: '48px',
                fontSize: '16px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              关闭
            </Button>
          </Space>
        </div>
      </div>
    );
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      closable={false}
      centered
      width={isMobile ? '90%' : '600px'}
      maskStyle={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)'
      }}
      style={{
        top: 0,
      }}
      bodyStyle={{
        padding: 0,
        borderRadius: '24px',
        overflow: 'hidden'
      }}
    >
      {renderResult()}
      
      {/* 全局CSS动画定义 */}
      <style jsx="true">{`
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0, -20px, 0);
          }
          70% {
            transform: translate3d(0, -10px, 0);
          }
          90% {
            transform: translate3d(0, -4px, 0);
          }
        }
        
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 133, 162, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(255, 133, 162, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 133, 162, 0);
          }
        }
      `}</style>
    </Modal>
  );
}

export default LotteryResultModal;
