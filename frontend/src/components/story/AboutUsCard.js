import React from 'react';
import { Typography, Card } from 'antd';
import { StarOutlined } from '@ant-design/icons';
import { themeColor } from '../Intro';

const { Paragraph, Text } = Typography;

// 关于我们卡片组件
const AboutUsCard = ({ isMobile }) => {
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
            <StarOutlined style={{ color: themeColor, fontSize: '18px' }} />
          </div>
          <span style={{ 
            fontWeight: 'bold', 
            fontSize: isMobile ? '16px' : '18px',
            background: 'linear-gradient(45deg, #FF85A2, #FF1493)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>关于我们</span>
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
      }}>
        我们在乎每一位路过或者选择留在星球上的开拓者呢！<span style={{ color: themeColor }}>✨</span> 这里的故事像星星一样闪闪发光，像彩虹一样绚丽多彩，让我们一起创造属于我们的美好回忆吧！<span style={{ color: themeColor }}>💫</span>
      </Paragraph>
      
      <div style={{
        marginTop: '16px',
        background: 'rgba(255, 240, 245, 0.5)',
        padding: '12px',
        borderRadius: '10px',
        border: '1px dashed rgba(255, 192, 203, 0.3)',
      }}>
        <Text style={{ 
          fontSize: isMobile ? '14px' : '15px',
          color: '#666',
          fontStyle: 'italic',
        }}>
          "每一个来到9672星球的人，都是这个故事的一部分..."
        </Text>
      </div>
    </Card>
  );
};

export default AboutUsCard; 