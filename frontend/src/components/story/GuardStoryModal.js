import React from 'react';
import { Modal, Avatar, Typography } from 'antd';
import { themeColor } from '../Intro';
import { getGuardLevelColor, generateGuardStory } from '../../utils/guardsHelper';

const { Paragraph } = Typography;

// 守护者故事模态框组件
const GuardStoryModal = ({ visible, onClose, guard }) => {
  if (!guard) return null;
  
  const stories = generateGuardStory(guard);
  
  return (
    <Modal
      title={
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 0',
        }}>
          <Avatar 
            size={48}
            src={guard.face ? `/api/proxy/image?url=${encodeURIComponent(guard.face)}` : null}
            style={{
              border: `2px solid ${getGuardLevelColor(guard.guard_level)}`,
            }}
          />
          <div>
            <div style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '4px',
            }}>
              {guard.username} 的故事
            </div>
            <div style={{
              fontSize: '14px',
              color: '#666',
            }}>
              已陪伴: {guard.accompany} 天
            </div>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      style={{ top: 20 }}
      bodyStyle={{ 
        padding: '24px',
        maxHeight: '70vh',
        overflow: 'auto',
      }}
    >
      {stories.map((story, index) => (
        <div key={index} style={{
          marginBottom: index < stories.length - 1 ? '32px' : 0,
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: themeColor,
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'rgba(255, 133, 162, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
            }}>
              {index + 1}
            </div>
            {story.title}
          </div>
          <Paragraph style={{
            fontSize: '14px',
            lineHeight: '1.8',
            color: '#666',
            margin: 0,
            paddingLeft: '32px',
          }}>
            {story.content}
          </Paragraph>
        </div>
      ))}
    </Modal>
  );
};

export default GuardStoryModal; 