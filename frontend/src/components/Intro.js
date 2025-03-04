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
        headStyle={{ 
          backgroundColor: '#ffeef2',
          borderBottom: '1px solid #ffc2d1',
          borderRadius: '16px 16px 0 0'
        }}
      >
        <Title level={isMobile ? 3 : 2} style={{ 
          textAlign: 'center',
          color: '#ff5c8d'
        }}>
          <HeartOutlined style={{ marginRight: '8px' }} />
          9872星球的故事
          <HeartOutlined style={{ marginLeft: '8px' }} />
        </Title>
        
        <Paragraph style={{ 
          fontSize: isMobile ? '14px' : '16px',
          color: '#ff85a2',
          textAlign: 'center',
          fontWeight: 'bold',
          marginBottom: '20px'
        }}>
          欢迎来到充满音乐和欢乐的粉色星球！
        </Paragraph>
        
        <Paragraph style={{ fontSize: isMobile ? '14px' : '16px' }}>
          欢迎来到 9872星球，这里流传着许多神秘而有趣的传说。据说这里的居民
          喜欢用音乐和故事来表达情感。每到黄昏时分，天空会闪耀七彩流光……
        </Paragraph>
        <Paragraph style={{ fontSize: isMobile ? '14px' : '16px' }}>
          （TODO：此处要写点什么）
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
              9872星球是一个分享音乐和故事的平台，我们致力于为大家提供一个自由表达的空间。
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
              如果你也热爱音乐和故事，欢迎加入我们的星球大家庭！
            </Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Intro;
