// PrizesTable.jsx
import React from 'react';
import { Table, Input, InputNumber, Button, Space, Popconfirm, Upload, message, Card, List, Form, Empty } from 'antd';
import { UploadOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useDeviceDetect } from '../../utils/deviceDetector';

// 这里也可以把图片上传逻辑放到容器里；
// 如果要在这里写，就直接在组件里 fetch('/api/upload') 即可。
// 为了简洁，演示时就直接写在 columns 里。
function PrizesTable({ prizes, setPrizes }) {
  const { isMobile } = useDeviceDetect();

  // 图片上传
  const handleImageUpload = (file, idx) => {
    const formData = new FormData();
    formData.append('image', file);

    fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const newPrizes = [...prizes];
          newPrizes[idx].image = data.url;
          setPrizes(newPrizes);
          message.success('图片上传成功');
        } else {
          message.error('图片上传失败');
        }
      })
      .catch((err) => {
        console.error('图片上传错误', err);
        message.error('网络异常，上传失败');
      });

    // 阻止 antd 默认上传行为
    return false;
  };

  // 更新奖品名称
  const handleNameChange = (value, idx) => {
    const newPrizes = [...prizes];
    newPrizes[idx].name = value;
    setPrizes(newPrizes);
  };

  // 更新概率
  const handleProbabilityChange = (value, idx) => {
    const newPrizes = [...prizes];
    newPrizes[idx].probability = value || 0;
    setPrizes(newPrizes);
  };

  // 更新图片链接
  const handleImageUrlChange = (value, idx) => {
    const newPrizes = [...prizes];
    newPrizes[idx].image = value;
    setPrizes(newPrizes);
  };

  // 删除奖品
  const handleDeletePrize = (idx) => {
    const newList = [...prizes];
    newList.splice(idx, 1);
    setPrizes(newList);
  };

  const columns = [
    {
      title: '奖品名称',
      dataIndex: 'name',
      render: (text, record, idx) => (
        <Input
          value={text}
          onChange={(e) => handleNameChange(e.target.value, idx)}
        />
      ),
    },
    {
      title: '概率(0~1)',
      dataIndex: 'probability',
      render: (val, record, idx) => (
        <InputNumber
          min={0}
          max={1}
          step={0.01}
          value={val}
          onChange={(value) => handleProbabilityChange(value, idx)}
        />
      ),
    },
    {
      title: '图片',
      dataIndex: 'image',
      responsive: ['md'],
      render: (val, record, idx) => (
        <Space>
          <Upload
            beforeUpload={(file) => handleImageUpload(file, idx)}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>上传</Button>
          </Upload>

          <Input
            style={{ width: 200 }}
            value={val}
            placeholder="或在此粘贴图片链接"
            onChange={(e) => handleImageUrlChange(e.target.value, idx)}
          />

          {val ? (
            <img
              src={val}
              alt="奖品图片"
              style={{
                width: 50,
                height: 50,
                objectFit: 'cover',
                border: '1px solid #ccc',
              }}
            />
          ) : (
            <div style={{ color: '#999' }}>暂无</div>
          )}
        </Space>
      ),
    },
    {
      title: '操作',
      render: (val, record, idx) => (
        <Space>
          <Popconfirm
            title="确认删除该奖品？"
            onConfirm={() => handleDeletePrize(idx)}
          >
            <Button danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 移动端列表视图
  const renderMobileView = () => {
    if (!prizes || prizes.length === 0) {
      return <Empty description="暂无奖品" />;
    }

    return (
      <List
        dataSource={prizes}
        renderItem={(item, idx) => (
          <List.Item style={{ padding: 0, marginBottom: 8 }}>
            <Card 
              size="small" 
              style={{ width: '100%' }}
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>奖品 {idx + 1}</span>
                  <Popconfirm
                    title="确认删除该奖品？"
                    onConfirm={() => handleDeletePrize(idx)}
                  >
                    <Button 
                      danger 
                      type="text" 
                      size="small"
                      icon={<DeleteOutlined />}
                    />
                  </Popconfirm>
                </div>
              }
            >
              <Form layout="vertical">
                <Form.Item label="奖品名称" style={{ marginBottom: 8 }}>
                  <Input
                    value={item.name}
                    onChange={(e) => handleNameChange(e.target.value, idx)}
                  />
                </Form.Item>
                
                <Form.Item label="概率(0~1)" style={{ marginBottom: 8 }}>
                  <InputNumber
                    min={0}
                    max={1}
                    step={0.01}
                    value={item.probability}
                    onChange={(value) => handleProbabilityChange(value, idx)}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                
                <Form.Item label="图片" style={{ marginBottom: 8 }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Input
                      value={item.image}
                      placeholder="粘贴图片链接"
                      onChange={(e) => handleImageUrlChange(e.target.value, idx)}
                    />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Upload
                        beforeUpload={(file) => handleImageUpload(file, idx)}
                        showUploadList={false}
                      >
                        <Button 
                          icon={<UploadOutlined />} 
                          size="small"
                        >
                          上传图片
                        </Button>
                      </Upload>
                      
                      {item.image && (
                        <img
                          src={item.image}
                          alt="奖品图片"
                          style={{
                            width: 40,
                            height: 40,
                            objectFit: 'cover',
                            border: '1px solid #ccc',
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
    return (
      <Table
        dataSource={Array.isArray(prizes) ? prizes : []}
        columns={columns}
        pagination={false}
        rowKey={(item, idx) => idx}
        style={{ marginBottom: 20 }}
      />
    );
  };

  return isMobile ? renderMobileView() : renderDesktopView();
}

export default PrizesTable;
