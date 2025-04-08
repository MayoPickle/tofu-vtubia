import React from 'react';
import { Typography, Card, Button } from 'antd';
import { HeartOutlined, BookOutlined } from '@ant-design/icons';
import { themeColor, themeGradient } from '../Intro';
import StoryContent from './StoryContent';

const { Title, Paragraph } = Typography;

// 故事头部组件
const StoryHeader = ({ isMobile, expandStory, setExpandStory }) => {
  return (
    <Card 
      style={{ 
        marginBottom: isMobile ? 24 : 32,
        borderRadius: '20px',
        boxShadow: '0 10px 25px rgba(255, 133, 162, 0.2)',
        border: '1px solid rgba(255, 192, 203, 0.3)',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        transform: 'translateY(0)',
        opacity: 1,
        animation: 'slideDown 0.6s ease-out',
      }}
      bordered={false}
    >
      {/* 顶部渐变装饰条 */}
      <div style={{
        height: '6px',
        background: themeGradient,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
      }} />
      
      <Title level={isMobile ? 3 : 2} style={{ 
        textAlign: 'center',
        marginTop: '12px',
        marginBottom: '24px',
        background: themeGradient,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: 700,
      }}>
        <HeartOutlined style={{ marginRight: '8px' }} />
        末代兔姬领主 · 小兔陛下
        <HeartOutlined style={{ marginLeft: '8px' }} />
      </Title>
      
      <Paragraph style={{ 
        fontSize: isMobile ? '16px' : '18px',
        color: themeColor,
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: '24px',
        letterSpacing: '0.5px',
      }}>
        用面粉与糖霜构筑王国，在烤箱与镜头前的星际小女王✨
      </Paragraph>
      
      {/* 故事梗概部分 */}
      <div style={{ 
        position: 'relative',
        padding: '20px',
        borderRadius: '16px',
        background: 'rgba(255, 240, 245, 0.5)',
        marginBottom: '20px',
        border: '1px solid rgba(255, 192, 203, 0.2)',
      }}>
        <Paragraph style={{ 
          fontSize: isMobile ? '15px' : '17px',
          lineHeight: '1.8',
          color: '#555',
          margin: 0,
        }}>
          欢迎来到宇宙级可爱的小兔陛下的王国！她是Universal Little Rabbit - 97·银河系指定外交官，也是9672星最后的陪护机器人。每当夜幕降临，她就会在直播间里统治她的小小宇宙，用烤焦的"陨石面包"和甜蜜的话语征服每一位臣民。<span style={{ color: themeColor }}>🌙</span>
        </Paragraph>
        <Paragraph style={{ 
          fontSize: isMobile ? '15px' : '17px',
          lineHeight: '1.8',
          color: '#555',
          marginBottom: 0,
          marginTop: '16px',
        }}>
          这位嘴硬心软的小兔领主，戴着小主人用胡萝卜发卡和泡泡糖粘成的"超厉害王冠"，正在用兔比计数法收集100万条"小兔陛下真厉害"。虽然偶尔会算错数学题，但她的梦想和爱心却是无限的！<span style={{ color: themeColor }}>🌈</span>
        </Paragraph>
      </div>
      
      {/* 阅读完整故事按钮 */}
      <div 
        style={{ 
          textAlign: 'center',
          marginBottom: '16px',
          cursor: 'pointer',
        }}
        onClick={() => setExpandStory(!expandStory)}
      >
        <Button
          type="link"
          icon={<BookOutlined style={{
            transform: expandStory ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.3s ease',
          }} />}
          style={{
            color: themeColor,
            fontWeight: 'bold',
            fontSize: isMobile ? '15px' : '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            margin: '0 auto',
          }}
        >
          {expandStory ? '收起完整故事' : '阅读完整故事'}
        </Button>
      </div>
      
      {/* 完整故事展开区域 */}
      <div style={{ 
        display: expandStory ? 'block' : 'none',
        width: '100%',
        marginBottom: expandStory ? '20px' : '0',
      }}>
        <StoryContent 
          isMobile={isMobile} 
          expandStory={expandStory} 
        />
      </div>
    </Card>
  );
};

export default StoryHeader; 