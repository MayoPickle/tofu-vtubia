import React from 'react';
import { Typography, Card, Button } from 'antd';
import { SmileOutlined, HeartOutlined } from '@ant-design/icons';
import { themeColor, themeGradient } from '../Intro';

const { Paragraph } = Typography;

// 加入我们卡片组件
const JoinUsCard = ({ isMobile }) => {
  return (
    <Card 
      title={
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
            <SmileOutlined style={{ color: themeColor, fontSize: '18px' }} />
          </div>
          <span style={{ 
            fontWeight: 'bold', 
            fontSize: isMobile ? '16px' : '18px',
            background: 'linear-gradient(45deg, #FF85A2, #FF1493)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>加入我们</span>
        </div>
      } 
      style={{ 
        height: '100%',
        borderRadius: '16px',
        boxShadow: '0 8px 20px rgba(255, 133, 162, 0.15)',
        border: '1px solid rgba(255, 192, 203, 0.3)',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}
      bordered={false}
      hoverable
    >
      <Paragraph style={{ 
        fontSize: isMobile ? '15px' : '16px',
        lineHeight: '1.8',
        color: '#555',
        marginBottom: '20px',
      }}>
        请在BiliBili关注我们，加入大家庭，和我们一起建设9672星球吧！<span style={{ color: themeColor }}>✨</span>
      </Paragraph>
      
      <Button 
        type="primary" 
        size={isMobile ? "middle" : "large"}
        href="https://space.bilibili.com/3546719987960278" 
        target="_blank" 
        rel="noopener noreferrer"
        style={{
          width: '100%',
          background: themeGradient,
          border: 'none',
          borderRadius: '10px',
          fontWeight: 'bold',
          height: isMobile ? '40px' : '46px',
          boxShadow: '0 4px 12px rgba(255, 133, 162, 0.3)',
          transition: 'all 0.3s ease',
        }}
      >
        <HeartOutlined style={{ marginRight: '8px' }} />
        关注 万能小兔旅店
      </Button>
      
      <div style={{
        marginTop: '16px',
        fontSize: isMobile ? '13px' : '14px',
        color: '#888',
        textAlign: 'center',
      }}>
        每一位新朋友的加入都让星球更加闪耀 ✨
      </div>
    </Card>
  );
};

export default JoinUsCard; 