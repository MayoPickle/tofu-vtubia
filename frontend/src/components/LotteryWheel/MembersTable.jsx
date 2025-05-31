import React from 'react';
import { Table, Input, InputNumber, Button, Space, Popconfirm, Upload, message, Card, List, Form, Empty } from 'antd';
import { UploadOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { useDeviceDetect } from '../../utils/deviceDetector';

function MembersTable({ members, setMembers }) {
  const { isMobile } = useDeviceDetect();

  // 图片上传
  const handleImageUpload = (file, idx) => {
    const formData = new FormData();
    formData.append('file', file);

    fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.url) {
          const newMembers = [...members];
          newMembers[idx].image = data.url;
          setMembers(newMembers);
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

  // 更新人员名称
  const handleNameChange = (value, idx) => {
    const newMembers = [...members];
    newMembers[idx].name = value;
    setMembers(newMembers);
  };

  // 更新权重（概率）
  const handleProbabilityChange = (value, idx) => {
    const newMembers = [...members];
    newMembers[idx].probability = value || 1;
    setMembers(newMembers);
  };

  // 更新图片链接
  const handleImageUrlChange = (value, idx) => {
    const newMembers = [...members];
    newMembers[idx].image = value;
    setMembers(newMembers);
  };

  // 删除人员
  const handleDeleteMember = (idx) => {
    const newList = [...members];
    newList.splice(idx, 1);
    setMembers(newList);
  };

  // 移动端列表视图
  const renderMobileView = () => {
    if (!members || members.length === 0) {
      return <Empty description="暂无人员" />;
    }

    return (
      <List
        dataSource={members}
        renderItem={(item, idx) => (
          <List.Item style={{ padding: 0, marginBottom: 12 }}>
            <Card 
              size="small" 
              style={{ 
                width: '100%',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                borderRadius: '8px'
              }}
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ 
                    fontWeight: 500, 
                    color: '#FF85A2',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <UserOutlined />
                    人员 {idx + 1}
                  </span>
                  <Popconfirm
                    title="确认删除该人员？"
                    onConfirm={() => handleDeleteMember(idx)}
                  >
                    <Button 
                      danger 
                      type="text" 
                      size="small"
                      icon={<DeleteOutlined />}
                      style={{ color: '#ff85c0' }}
                    />
                  </Popconfirm>
                </div>
              }
            >
              <Form layout="vertical">
                <Form.Item label="人员名称" style={{ marginBottom: 12 }}>
                  <Input
                    value={item.name}
                    onChange={(e) => handleNameChange(e.target.value, idx)}
                    placeholder="请输入人员名称"
                  />
                </Form.Item>
                
                <Form.Item label="权重(数值越大被选中概率越高)" style={{ marginBottom: 12 }}>
                  <InputNumber
                    min={0.1}
                    step={0.1}
                    value={item.probability}
                    onChange={(value) => handleProbabilityChange(value, idx)}
                    style={{ width: '100%' }}
                    placeholder="设置权重"
                  />
                </Form.Item>
                
                <Form.Item label="头像" style={{ marginBottom: 8 }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Input
                      value={item.image}
                      placeholder="粘贴头像链接"
                      onChange={(e) => handleImageUrlChange(e.target.value, idx)}
                    />
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Upload
                        beforeUpload={(file) => handleImageUpload(file, idx)}
                        showUploadList={false}
                      >
                        <Button 
                          icon={<UploadOutlined />} 
                          size="small"
                          type="primary"
                          style={{ backgroundColor: '#ff85c0', borderColor: '#ff85c0' }}
                        >
                          上传头像
                        </Button>
                      </Upload>
                      
                      {item.image && (
                        <img
                          src={item.image}
                          alt="人员头像"
                          style={{
                            width: 48,
                            height: 48,
                            objectFit: 'cover',
                            borderRadius: '50%',
                            border: '2px solid #ff85c0',
                          }}
                        />
                      )}
                    </div>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </List.Item>
        )}
      />
    );
  };

  // 桌面端表格视图
  const renderDesktopView = () => {
    const updatedColumns = [
      {
        title: '人员名称',
        dataIndex: 'name',
        render: (text, record, idx) => (
          <Input
            value={text}
            onChange={(e) => handleNameChange(e.target.value, idx)}
            placeholder="请输入人员名称"
            style={{ width: '90%' }}
            prefix={<UserOutlined style={{ color: '#FF85A2' }} />}
          />
        ),
      },
      {
        title: '权重',
        dataIndex: 'probability',
        width: 120,
        render: (val, record, idx) => (
          <InputNumber
            min={0.1}
            step={0.1}
            value={val}
            onChange={(value) => handleProbabilityChange(value, idx)}
            style={{ width: '100%' }}
            placeholder="权重"
          />
        ),
      },
      {
        title: '头像',
        dataIndex: 'image',
        responsive: ['md'],
        render: (val, record, idx) => (
          <Space>
            <Upload
              beforeUpload={(file) => handleImageUpload(file, idx)}
              showUploadList={false}
            >
              <Button 
                icon={<UploadOutlined />} 
                type="primary"
                size="small"
                style={{ backgroundColor: '#ff85c0', borderColor: '#ff85c0' }}
              >
                上传
              </Button>
            </Upload>

            <Input
              style={{ width: 200 }}
              value={val}
              placeholder="或在此粘贴头像链接"
              onChange={(e) => handleImageUrlChange(e.target.value, idx)}
            />

            {val ? (
              <img
                src={val}
                alt="人员头像"
                style={{
                  width: 48,
                  height: 48,
                  objectFit: 'cover',
                  borderRadius: '50%',
                  border: '2px solid #ff85c0',
                }}
              />
            ) : (
              <div style={{ 
                color: '#999',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <UserOutlined />
                暂无头像
              </div>
            )}
          </Space>
        ),
      },
      {
        title: '操作',
        width: 80,
        render: (val, record, idx) => (
          <Space>
            <Popconfirm
              title="确认删除该人员？"
              onConfirm={() => handleDeleteMember(idx)}
            >
              <Button 
                danger 
                size="small"
                icon={<DeleteOutlined />}
                style={{ backgroundColor: '#fff0f6', borderColor: '#ffadd2', color: '#ff85c0' }}
              >
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ];

    return (
      <Table
        dataSource={Array.isArray(members) ? members : []}
        columns={updatedColumns}
        pagination={false}
        rowKey={(item, idx) => idx}
        style={{ marginBottom: 20 }}
        bordered
        size="middle"
      />
    );
  };

  return isMobile ? renderMobileView() : renderDesktopView();
}

export default MembersTable; 