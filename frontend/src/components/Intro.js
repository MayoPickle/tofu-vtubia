// Intro.js
import React from 'react';
import { Typography, Card, Image, Space, Row, Col } from 'antd';
import { useDeviceDetect } from '../utils/deviceDetector';

const { Title, Paragraph } = Typography;

function Intro() {
  const { isMobile } = useDeviceDetect();

  return (
    <div style={{ 
      padding: isMobile ? '16px 8px' : '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <Card style={{ marginBottom: isMobile ? 16 : 24 }}>
        <Title level={isMobile ? 3 : 2} style={{ textAlign: 'center' }}>9872星球的故事</Title>
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
          <Card title="关于我们" style={{ height: '100%' }}>
            <Paragraph style={{ fontSize: isMobile ? '14px' : '16px' }}>
              9872星球是一个分享音乐和故事的平台，我们致力于为大家提供一个自由表达的空间。
            </Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="加入我们" style={{ height: '100%' }}>
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
