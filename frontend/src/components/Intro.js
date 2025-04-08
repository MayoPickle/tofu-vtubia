// Intro.js
import React, { useEffect, useState } from 'react';
import { Typography, Card, Space, Row, Col, Spin, message, Empty } from 'antd';
import { useDeviceDetect } from '../utils/deviceDetector';
import StoryHeader from './story/StoryHeader';
import StoryContent from './story/StoryContent';
import AboutUsCard from './story/AboutUsCard';
import JoinUsCard from './story/JoinUsCard';
import GuardsList from './story/GuardsList';
import GuardStoryModal from './story/GuardStoryModal';
import PageBackground from './story/PageBackground';
import { fetchGuardsData, getGuardLevelColor, getGuardLevelText, generateGuardStory } from '../utils/guardsHelper';

const { Text } = Typography;

// 主题颜色和渐变定义
export const themeColor = '#FF85A2';
export const themeGradient = 'linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%)';

function Intro() {
  const { isMobile } = useDeviceDetect();
  const [showCards, setShowCards] = useState(false);
  const [expandStory, setExpandStory] = useState(false);
  const [guards, setGuards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedGuards, setExpandedGuards] = useState({});
  const [selectedGuard, setSelectedGuard] = useState(null);
  const [storyModalVisible, setStoryModalVisible] = useState(false);
  
  // 获取舰长数据
  useEffect(() => {
    const fetchGuards = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/guards');
        if (!response.ok) {
          throw new Error('获取舰长数据失败');
        }
        const data = await response.json();
        setGuards(data.guards || []);
      } catch (error) {
        console.error('获取舰长数据错误:', error);
        message.error('获取舰长数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchGuards();
  }, []);

  // 页面加载时添加动画效果
  useEffect(() => {
    // 延迟显示卡片，创造渐入效果
    const timer = setTimeout(() => {
      setShowCards(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // 处理守护者展开/收起
  const handleGuardExpand = (guardId) => {
    setExpandedGuards(prev => ({
      ...prev,
      [guardId]: !prev[guardId]
    }));
  };

  // 打开守护者故事模态框
  const openGuardStory = (guard) => {
    setSelectedGuard(guard);
    setStoryModalVisible(true);
  };

  return (
    <div style={{ 
      padding: isMobile ? '16px 8px' : '24px',
      maxWidth: '100%',
      margin: '0 auto',
      position: 'relative',
      overflowX: 'hidden',
      boxSizing: 'border-box',
      minHeight: '100vh'
    }}>
      {/* 装饰性背景元素 */}
      <PageBackground isMobile={isMobile} />
      
      {/* 故事头部部分 */}
      <StoryHeader 
        isMobile={isMobile}
        expandStory={expandStory} 
        setExpandStory={setExpandStory}
      />

      {/* 关于我们和加入我们卡片 */}
      <Row gutter={[20, 20]}>
        <Col xs={24} md={12}
          style={{
            opacity: showCards ? 1 : 0,
            transform: showCards ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.5s ease 0.3s',
          }}
        >
          <AboutUsCard isMobile={isMobile} />
        </Col>
        <Col xs={24} md={12}
          style={{
            opacity: showCards ? 1 : 0,
            transform: showCards ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.5s ease 0.5s',
          }}
        >
          <JoinUsCard isMobile={isMobile} />
        </Col>
      </Row>
      
      {/* 舰长信息卡片 */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <GuardsList.Title isMobile={isMobile} />
            <GuardsList.Counter count={guards.length} />
          </div>
        }
        style={{ 
          marginTop: '24px',
          borderRadius: '16px',
          boxShadow: '0 8px 20px rgba(255, 133, 162, 0.15)',
          border: '1px solid rgba(255, 192, 203, 0.3)',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          animation: showCards ? 'slideUp 0.6s ease-out' : 'none',
        }}
        bordered={false}
      >
        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            background: 'rgba(255, 240, 245, 0.5)',
            borderRadius: '12px',
          }}>
            <Space direction="vertical" size="middle" align="center">
              <Spin size="large" />
              <Text type="secondary">正在召集星球守护者...</Text>
            </Space>
          </div>
        ) : guards.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text type="secondary">暂时还没有守护者加入我们</Text>
            }
          />
        ) : (
          <GuardsList 
            guards={guards}
            isMobile={isMobile}
            showCards={showCards}
            expandedGuards={expandedGuards}
            handleGuardExpand={handleGuardExpand}
            openGuardStory={openGuardStory}
          />
        )}
      </Card>

      {/* 守护者故事弹窗 */}
      {selectedGuard && (
        <GuardStoryModal
          visible={storyModalVisible}
          onClose={() => setStoryModalVisible(false)}
          guard={selectedGuard}
        />
      )}

      {/* 全局CSS动画定义 */}
      <style jsx="true">{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
        
        @keyframes rotateDown {
          from {
            transform: rotate(180deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        
        @keyframes rotateUp {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(180deg);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 0.4;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.6;
          }
        }

        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
          100% {
            transform: translateY(0px);
          }
        }

        .guard-card:hover .avatar-container {
          transform: scale(1.05) rotate(5deg);
          box-shadow: 0 8px 24px rgba(255, 182, 193, 0.3);
        }

        .guard-card:hover .avatar-image {
          border-color: ${themeColor} !important;
        }

        .guard-card {
          position: relative;
        }

        .guard-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, rgba(255, 182, 193, 0.1), rgba(255, 105, 180, 0.1));
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
          border-radius: 16px;
        }

        .guard-card:hover::after {
          opacity: 1;
        }

        .medal-tag {
          position: relative;
          transform-origin: center;
        }

        .medal-tag:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(255, 105, 180, 0.3),
                     0 0 20px rgba(255, 182, 193, 0.5);
          z-index: 1;
        }

        .medal-tag::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: inherit;
          border-radius: 12px;
          opacity: 0;
          transition: opacity 0.3s ease;
          filter: blur(8px);
          z-index: -1;
        }

        .medal-tag:hover::before {
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
}

export default Intro;
