// Intro.js
import React from 'react';
import { Typography, Card, Image, Space, Row, Col } from 'antd';
import { HeartOutlined, StarOutlined, SmileOutlined } from '@ant-design/icons';
import { useDeviceDetect } from '../utils/deviceDetector';

const { Title, Paragraph, Text } = Typography;

function Intro() {
  const { isMobile } = useDeviceDetect();

  return (
    <div style={{ 
      padding: isMobile ? '16px 8px' : '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <Card 
        style={{ 
          marginBottom: isMobile ? 16 : 24,
          borderRadius: '16px',
          boxShadow: '0 6px 16px rgba(255, 133, 162, 0.2)',
          border: '1px solid #ffc2d1'
        }}
        variant="outlined"
        styles={{
          header: { 
            backgroundColor: '#ffeef2',
            borderBottom: '1px solid #ffc2d1',
            borderRadius: '16px 16px 0 0'
          }
        }}
      >
        <Title level={isMobile ? 3 : 2} style={{ 
          textAlign: 'center',
          color: '#ff5c8d'
        }}>
          <HeartOutlined style={{ marginRight: '8px' }} />
          9672星球的故事
          <HeartOutlined style={{ marginLeft: '8px' }} />
        </Title>
        
        <Paragraph style={{ 
          fontSize: isMobile ? '14px' : '16px',
          color: '#ff85a2',
          textAlign: 'center',
          fontWeight: 'bold',
          marginBottom: '20px'
        }}>
          欢迎来到9672星球，荒凉，寂寞，但充满希望✨
        </Paragraph>
        
        <Paragraph style={{ fontSize: isMobile ? '14px' : '16px' }}>
          在这个神奇的星球上，住着一群热爱音乐和故事的小精灵。每当夜幕降临，他们就会聚集在一起，用美妙的歌声和有趣的故事点亮整个星空。🌙
        </Paragraph>
        <Paragraph style={{ fontSize: isMobile ? '14px' : '16px' }}>
          这里的天空总是变幻莫测，有时是温柔的粉色，有时是梦幻的紫色，有时还会出现彩虹般的极光。在这里，每一天都是新的冒险，每一刻都充满惊喜！🌈
        </Paragraph>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card 
            title={
              <span>
                <StarOutlined style={{ marginRight: '8px', color: '#ff85a2' }} />
                关于我们
              </span>
            } 
            style={{ 
              height: '100%',
              borderRadius: '16px',
              boxShadow: '0 6px 16px rgba(255, 133, 162, 0.2)',
              border: '1px solid #ffc2d1'
            }}
            styles={{
              header: { 
                backgroundColor: '#ffeef2',
                borderBottom: '1px solid #ffc2d1',
                borderRadius: '16px 16px 0 0'
              }
            }}
          >
            <Paragraph style={{ fontSize: isMobile ? '14px' : '16px' }}>
              我们在乎每一位路过或者选择留在星球上的开拓者呢！✨ 这里的故事像星星一样闪闪发光，像彩虹一样绚丽多彩，让我们一起创造属于我们的美好回忆吧！💫
            </Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card 
            title={
              <span>
                <SmileOutlined style={{ marginRight: '8px', color: '#ff85a2' }} />
                加入我们
              </span>
            } 
            style={{ 
              height: '100%',
              borderRadius: '16px',
              boxShadow: '0 6px 16px rgba(255, 133, 162, 0.2)',
              border: '1px solid #ffc2d1'
            }}
            styles={{
              header: { 
                backgroundColor: '#ffeef2',
                borderBottom: '1px solid #ffc2d1',
                borderRadius: '16px 16px 0 0'
              }
            }}
          >
            <Paragraph style={{ fontSize: isMobile ? '14px' : '16px' }}>
              请在BiliBili关注<a href="https://space.bilibili.com/3546719987960278" target="_blank" rel="noopener noreferrer" style={{ color: '#ff85a2' }}>万能小兔旅店</a>，加入大家庭，和我们一起建设9672星球吧！✨
            </Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Intro;
