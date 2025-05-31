import React from 'react';
import { Card, Input, InputNumber, Upload, Button, Space, Form, message } from 'antd';
import { GiftOutlined, UploadOutlined, SaveOutlined } from '@ant-design/icons';
import { useDeviceDetect } from '../../utils/deviceDetector';

const { TextArea } = Input;

function GiftSetting({ gift, setGift, onSave }) {
  const { isMobile } = useDeviceDetect();

  // 图片上传
  const handleImageUpload = (file) => {
    const formData = new FormData();
    formData.append('file', file);

    fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.url) {
          setGift({ ...gift, image: data.url });
          message.success('图片上传成功');
        } else {
          message.error(data.message || '图片上传失败');
        }
      })
      .catch((err) => {
        console.error('图片上传错误', err);
        message.error('网络异常，上传失败');
      });

    // 阻止 antd 默认上传行为
    return false;
  };

  const handleNameChange = (value) => {
    setGift({ ...gift, name: value });
  };

  const handleDescriptionChange = (value) => {
    setGift({ ...gift, description: value });
  };

  const handleQuantityChange = (value) => {
    setGift({ ...gift, quantity: value || 1 });
  };

  const handleImageUrlChange = (value) => {
    setGift({ ...gift, image: value });
  };

  return (
    <Card 
      title={
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            color: '#FF85A2' 
          }}>
            <GiftOutlined />
            礼品设置
          </div>
          {onSave && (
            <Button
              onClick={onSave}
              icon={<SaveOutlined />}
              style={{ 
                borderColor: '#FF85A2',
                color: '#FF85A2',
                borderRadius: '8px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px'
              }}
              size="small"
              title="保存到本地浏览器"
            >
              本地保存
            </Button>
          )}
        </div>
      }
      style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(255, 133, 162, 0.15)',
        border: '1px solid rgba(255, 192, 203, 0.3)',
        backdropFilter: 'blur(10px)'
      }}
      bodyStyle={{ padding: isMobile ? '16px' : '24px' }}
    >
      <Form layout="vertical">
        <Form.Item label="礼品名称" style={{ marginBottom: 16 }}>
          <Input
            value={gift.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="请输入礼品名称，如：牛奶"
            prefix={<GiftOutlined style={{ color: '#FF85A2' }} />}
            style={{ borderRadius: '8px' }}
          />
        </Form.Item>

        <Form.Item label="礼品描述" style={{ marginBottom: 16 }}>
          <TextArea
            value={gift.description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="请输入礼品描述，如：美味的牛奶一瓶"
            rows={3}
            style={{ borderRadius: '8px' }}
          />
        </Form.Item>

        <Form.Item label="数量" style={{ marginBottom: 16 }}>
          <InputNumber
            min={1}
            value={gift.quantity}
            onChange={handleQuantityChange}
            style={{ width: '100%', borderRadius: '8px' }}
            placeholder="礼品数量"
          />
        </Form.Item>

        <Form.Item label="礼品图片">
          <Space direction={isMobile ? 'vertical' : 'horizontal'} style={{ width: '100%' }}>
            <Upload
              beforeUpload={handleImageUpload}
              showUploadList={false}
            >
              <Button 
                icon={<UploadOutlined />} 
                type="primary"
                style={{ 
                  backgroundColor: '#ff85c0', 
                  borderColor: '#ff85c0',
                  borderRadius: '8px'
                }}
              >
                上传图片
              </Button>
            </Upload>

            <Input
              style={{ 
                width: isMobile ? '100%' : '300px',
                borderRadius: '8px'
              }}
              value={gift.image}
              placeholder="或在此粘贴图片链接"
              onChange={(e) => handleImageUrlChange(e.target.value)}
            />
          </Space>

          {gift.image && (
            <div style={{ 
              marginTop: 16, 
              textAlign: 'center',
              padding: '16px',
              backgroundColor: 'rgba(255, 182, 193, 0.1)',
              borderRadius: '12px',
              border: '1px dashed #FF85A2'
            }}>
              <img
                src={gift.image}
                alt="礼品图片"
                style={{
                  maxWidth: '200px',
                  maxHeight: '200px',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  border: '2px solid #FF85A2',
                }}
              />
              <div style={{ 
                marginTop: '8px', 
                color: '#FF85A2',
                fontWeight: 500
              }}>
                {gift.name} × {gift.quantity}
              </div>
              {gift.description && (
                <div style={{ 
                  marginTop: '4px', 
                  color: '#999',
                  fontSize: '14px'
                }}>
                  {gift.description}
                </div>
              )}
            </div>
          )}
        </Form.Item>
      </Form>
    </Card>
  );
}

export default GiftSetting; 