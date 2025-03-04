// AdminUserList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, message, Space, Typography, Card, List } from 'antd';
import { useDeviceDetect } from '../utils/deviceDetector';

const { Title } = Typography;

function AdminUserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isMobile } = useDeviceDetect();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      message.error(err.response?.data?.message || '获取用户列表失败');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId) => {
    try {
      await axios.post(`/api/users/${userId}/reset_password`); 
      message.success(`用户 ${userId} 密码已重置为 'xiaotu123'`);
    } catch (err) {
      message.error(err.response?.data?.message || '重置密码失败');
    }
  };

  const handleToggleAdmin = async (userId) => {
    try {
      const res = await axios.post(`/api/users/${userId}/toggle_admin`);
      message.success(res.data.message || '管理员权限已更新');
      setUsers((prev) => prev.map(u => {
        if (u.id === userId) {
          return { ...u, is_admin: res.data.is_admin };
        }
        return u;
      }));
    } catch (err) {
      message.error(err.response?.data?.message || '更新管理员权限失败');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns = [
    { 
      title: 'ID', 
      dataIndex: 'id', 
      key: 'id', 
      width: 50 
    },
    { 
      title: '用户名', 
      dataIndex: 'username', 
      key: 'username',
      responsive: ['sm']
    },
    { 
      title: 'B站UID', 
      dataIndex: 'bilibili_uid', 
      key: 'bilibili_uid',
      responsive: ['sm']
    },
    {
      title: '是否管理员',
      dataIndex: 'is_admin',
      key: 'is_admin',
      render: (val) => val ? '是' : '否',
      responsive: ['sm']
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => {
        const isAdmin = record.is_admin;
        return (
          <Space direction={isMobile ? 'vertical' : 'horizontal'} size="small">
            <Button size={isMobile ? 'small' : 'middle'} onClick={() => handleResetPassword(record.id)}>
              重置密码
            </Button>
            <Button size={isMobile ? 'small' : 'middle'} onClick={() => handleToggleAdmin(record.id)}>
              {isAdmin ? '取消管理员' : '设为管理员'}
            </Button>
          </Space>
        );
      },
    }
  ];

  // 移动端列表视图
  const renderMobileList = () => (
    <List
      loading={loading}
      dataSource={users}
      renderItem={user => (
        <Card 
          size="small" 
          style={{ marginBottom: '8px' }}
          actions={[
            <Button size="small" onClick={() => handleResetPassword(user.id)}>重置密码</Button>,
            <Button size="small" onClick={() => handleToggleAdmin(user.id)}>
              {user.is_admin ? '取消管理员' : '设为管理员'}
            </Button>
          ]}
        >
          <List.Item.Meta
            title={`${user.username} (ID: ${user.id})`}
            description={
              <Space direction="vertical" size={2}>
                <div>B站UID: {user.bilibili_uid}</div>
                <div>管理员: {user.is_admin ? '是' : '否'}</div>
              </Space>
            }
          />
        </Card>
      )}
    />
  );

  return (
    <div style={{ 
      padding: isMobile ? '12px 8px' : '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <Title 
        level={isMobile ? 3 : 2} 
        style={{ 
          marginBottom: isMobile ? 12 : 16,
          fontSize: isMobile ? '18px' : '24px',
          lineHeight: 1.4,
          color: '#000000',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        用户管理
      </Title>
      
      {isMobile ? renderMobileList() : (
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={Array.isArray(users) ? users : []}
          scroll={{ x: 'max-content' }}
          pagination={{
            defaultPageSize: 10,
            size: isMobile ? 'small' : 'default'
          }}
        />
      )}
    </div>
  );
}

export default AdminUserList;
