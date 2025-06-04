// AdminUserList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, message, Space, Typography, Card, List, Avatar, Tag, Tooltip, Badge, Input } from 'antd';
import { UserOutlined, KeyOutlined, CrownOutlined, ReloadOutlined, TeamOutlined, UserSwitchOutlined } from '@ant-design/icons';
import { useDeviceDetect } from '../utils/deviceDetector';

const { Title, Text } = Typography;

// 主题颜色和渐变定义
const themeColor = '#FF85A2';
const themeGradient = 'linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%)';
const lightPink = 'rgba(255, 192, 203, 0.3)';

function AdminUserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [searchText, setSearchText] = useState('');
  const { isMobile } = useDeviceDetect();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
      // 添加淡入效果
      setTimeout(() => setFadeIn(true), 100);
    } catch (err) {
      message.error({
        content: err.response?.data?.message || '获取用户列表失败',
        style: { borderRadius: '10px' }
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId, username) => {
    try {
      await axios.post(`/api/users/${userId}/reset_password`); 
      message.success({
        content: `用户 ${username} 密码已重置为 'xiaotu123'`,
        icon: <KeyOutlined style={{ color: themeColor }} />,
        style: { 
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(255, 133, 162, 0.2)' 
        }
      });
    } catch (err) {
      message.error({
        content: err.response?.data?.message || '重置密码失败',
        style: { borderRadius: '10px' }
      });
    }
  };

  const handleToggleAdmin = async (userId, username, isCurrentlyAdmin) => {
    try {
      const res = await axios.post(`/api/users/${userId}/toggle_admin`);
      message.success({
        content: `${username} ${isCurrentlyAdmin ? '已取消管理员权限' : '已设为管理员'}`,
        icon: <CrownOutlined style={{ color: isCurrentlyAdmin ? '#888' : '#FFD700' }} />,
        style: { 
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(255, 133, 162, 0.2)' 
        }
      });
      setUsers((prev) => prev.map(u => {
        if (u.id === userId) {
          return { ...u, is_admin: res.data.is_admin };
        }
        return u;
      }));
    } catch (err) {
      message.error({
        content: err.response?.data?.message || '更新管理员权限失败',
        style: { borderRadius: '10px' }
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 随机颜色生成器，为用户头像选择不同的柔和颜色
  const getAvatarColor = (userId) => {
    const colors = [
      '#FFB6C1', '#FFD1DC', '#FFC0CB', '#FF85A2',
      '#FF69B4', '#FFA6C9', '#FFB3DE', '#FF99CC'
    ];
    return colors[userId % colors.length];
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchText.trim().toLowerCase())
  );

  // 渲染用户标签 (管理员状态)
  const renderAdminTag = (isAdmin) => (
    isAdmin ? (
      <Tag
        style={{
          borderRadius: '12px',
          display: 'inline-flex',
          alignItems: 'center',
          fontWeight: 'bold',
          background: themeGradient,
          color: '#fff',
          border: 'none',
          boxShadow: '0 2px 4px rgba(255, 105, 180, 0.2)'
        }}
      >
        <CrownOutlined style={{ marginRight: '4px' }} />管理员
      </Tag>
    ) : (
      <Tag
        style={{
          borderRadius: '12px',
          display: 'inline-flex',
          alignItems: 'center',
          background: '#f5f5f5',
          border: '1px solid #ddd',
          color: '#999'
        }}
      >
        <UserOutlined style={{ marginRight: '4px' }} />普通用户
      </Tag>
    )
  );

  const columns = [
    { 
      title: 'ID', 
      dataIndex: 'id', 
      key: 'id', 
      width: 60,
      render: (id) => (
        <Text strong style={{ color: '#888' }}>#{id}</Text>
      )
    },
    { 
      title: '用户信息', 
      dataIndex: 'username', 
      key: 'username',
      render: (username, record) => (
        <Space>
          <Avatar 
            style={{ 
              backgroundColor: getAvatarColor(record.id),
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }} 
            icon={<UserOutlined />}
          />
          <Space direction="vertical" size={0}>
            <Text strong>{username}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              B站UID: {record.bilibili_uid || '未绑定'}
            </Text>
          </Space>
        </Space>
      ),
      responsive: ['sm']
    },
    {
      title: '权限',
      dataIndex: 'is_admin',
      key: 'is_admin',
      render: (isAdmin) => renderAdminTag(isAdmin),
      responsive: ['sm']
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => {
        const isAdmin = record.is_admin;
        return (
          <Space direction={isMobile ? 'vertical' : 'horizontal'} size="small">
            <Button 
              size={isMobile ? 'small' : 'middle'} 
              icon={<KeyOutlined />}
              onClick={() => handleResetPassword(record.id, record.username)}
              style={{
                borderRadius: '8px',
                transition: 'all 0.3s',
                background: 'white',
                border: `1px solid ${lightPink}`,
                color: '#666'
              }}
              className="hover-button"
            >
              重置密码
            </Button>
            <Button 
              size={isMobile ? 'small' : 'middle'} 
              type={isAdmin ? 'default' : 'primary'}
              icon={isAdmin ? <UserSwitchOutlined /> : <CrownOutlined />}
              onClick={() => handleToggleAdmin(record.id, record.username, isAdmin)}
              style={{
                borderRadius: '8px',
                transition: 'all 0.3s',
                ...(isAdmin ? {
                  background: 'white',
                  border: `1px solid ${lightPink}`,
                  color: '#666'
                } : {
                  background: themeGradient,
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(255, 133, 162, 0.3)'
                })
              }}
              className="hover-button"
            >
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
      dataSource={filteredUsers}
      renderItem={user => (
        <Card 
          size="small" 
          hoverable
          style={{ 
            marginBottom: '12px',
            borderRadius: '12px',
            boxShadow: '0 4px 8px rgba(255, 133, 162, 0.15)',
            border: `1px solid ${lightPink}`,
            overflow: 'hidden',
            opacity: fadeIn ? 1 : 0,
            transform: fadeIn ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.3s ease',
            transitionDelay: `${user.id % 10 * 50}ms`,
          }}
          className="user-card"
        >
          <List.Item.Meta
            avatar={
              <Avatar 
                size="large" 
                style={{ 
                  backgroundColor: getAvatarColor(user.id),
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }} 
                icon={<UserOutlined />} 
              />
            }
            title={
              <Space>
                <Text strong style={{ fontSize: '16px' }}>{user.username}</Text>
                {renderAdminTag(user.is_admin)}
              </Space>
            }
            description={
              <Space direction="vertical" size={2} style={{ marginTop: '4px' }}>
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  <span style={{ color: '#888' }}>ID:</span> {user.id}
                </Text>
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  <span style={{ color: '#888' }}>B站UID:</span> {user.bilibili_uid || '未绑定'}
                </Text>
              </Space>
            }
          />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-around', 
            marginTop: '12px',
            borderTop: `1px dashed ${lightPink}`,
            paddingTop: '12px'
          }}>
            <Button 
              size="small" 
              icon={<KeyOutlined />}
              onClick={() => handleResetPassword(user.id, user.username)}
              style={{
                flex: 1,
                marginRight: '8px',
                borderRadius: '8px',
                background: 'white',
                border: `1px solid ${lightPink}`,
                color: '#666',
                transition: 'all 0.3s',
              }}
              className="hover-button"
            >
              重置密码
            </Button>
            <Button 
              size="small" 
              type={user.is_admin ? 'default' : 'primary'}
              icon={user.is_admin ? <UserSwitchOutlined /> : <CrownOutlined />}
              onClick={() => handleToggleAdmin(user.id, user.username, user.is_admin)}
              style={{
                flex: 1,
                borderRadius: '8px',
                transition: 'all 0.3s',
                ...(user.is_admin ? {
                  background: 'white',
                  border: `1px solid ${lightPink}`,
                  color: '#666'
                } : {
                  background: themeGradient,
                  border: 'none',
                  boxShadow: '0 4px 8px rgba(255, 133, 162, 0.3)'
                })
              }}
              className="hover-button"
            >
              {user.is_admin ? '取消管理员' : '设为管理员'}
            </Button>
          </div>
        </Card>
      )}
    />
  );

  return (
    <div style={{ 
      padding: isMobile ? '16px 8px' : '24px',
      maxWidth: '1200px',
      margin: '0 auto',
      position: 'relative',
    }}>
      {/* 装饰性背景元素 */}
      <div style={{
        position: 'absolute',
        width: '180px',
        height: '180px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,192,203,0.1) 0%, rgba(255,192,203,0) 70%)',
        top: isMobile ? '5%' : '10%',
        right: '-50px',
        zIndex: -1,
      }} />
      
      <div style={{
        position: 'absolute',
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,105,180,0.08) 0%, rgba(255,105,180,0) 70%)',
        bottom: isMobile ? '5%' : '10%',
        left: '-30px',
        zIndex: -1,
      }} />
      
      {/* 标题区域 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: isMobile ? '16px' : '24px',
      }}>
        <div style={{ 
          background: 'rgba(255, 133, 162, 0.1)', 
          borderRadius: '50%', 
          width: isMobile ? '40px' : '48px', 
          height: isMobile ? '40px' : '48px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginRight: '16px',
          boxShadow: '0 4px 10px rgba(255, 133, 162, 0.15)'
        }}>
          <TeamOutlined style={{ 
            color: themeColor, 
            fontSize: isMobile ? '20px' : '24px' 
          }} />
        </div>
        <div>
          <Title 
            level={isMobile ? 3 : 2} 
            style={{ 
              margin: 0,
              fontSize: isMobile ? '20px' : '26px',
              background: themeGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
            }}
          >
            用户管理
          </Title>
          <Text style={{ color: '#888', fontSize: isMobile ? '13px' : '14px' }}>
            总用户数: <Badge count={users.length} style={{ backgroundColor: themeColor }} />
          </Text>
        </div>

        <Input
          placeholder="搜索用户名"
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{
            marginLeft: 'auto',
            marginRight: '12px',
            width: isMobile ? '120px' : '200px',
            borderRadius: '8px'
          }}
          className="search-input"
        />

        {/* 刷新按钮 */}
        <Tooltip title="刷新用户列表">
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchUsers}
            loading={loading}
            style={{
              borderRadius: '50%',
              width: isMobile ? '34px' : '36px',
              height: isMobile ? '34px' : '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${lightPink}`,
              color: themeColor,
              transition: 'all 0.3s ease',
            }}
            className="refresh-button"
          />
        </Tooltip>
      </div>
      
      {/* 卡片容器 */}
      <Card
        bordered={false}
        style={{
          borderRadius: '16px',
          boxShadow: '0 8px 20px rgba(255, 133, 162, 0.15)',
          border: `1px solid ${lightPink}`,
          overflow: 'hidden',
          opacity: fadeIn ? 1 : 0,
          transform: fadeIn ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.5s ease',
        }}
        bodyStyle={{ 
          padding: isMobile ? '12px 8px' : '16px',
          background: 'rgba(255, 255, 255, 0.9)',
        }}
      >
        {/* 顶部渐变装饰条 */}
        <div style={{
          height: '4px',
          background: themeGradient,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
        }} />
        
        {isMobile ? renderMobileList() : (
          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={Array.isArray(filteredUsers) ? filteredUsers : []}
            scroll={{ x: 'max-content' }}
            pagination={{
              defaultPageSize: 10,
              size: isMobile ? 'small' : 'default',
              style: { marginTop: '16px' }
            }}
            rowClassName={(record, index) => 
              `table-row ${fadeIn ? 'fade-in' : ''}`
            }
            style={{ transition: 'all 0.3s ease' }}
          />
        )}
      </Card>

      {/* 全局CSS样式 */}
      <style jsx="true">{`
        .user-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 16px rgba(255, 133, 162, 0.25);
        }
        
        .hover-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(255, 133, 162, 0.2);
        }
        
        .refresh-button:hover {
          transform: rotate(180deg);
          background-color: #FFF0F5;
        }
        
        .table-row {
          transition: all 0.3s ease;
        }
        
        .table-row:hover {
          background-color: rgba(255, 240, 245, 0.5) !important;
        }
        
        .fade-in {
          animation: fadeInAnimation 0.5s ease forwards;
        }

        .search-input:hover,
        .search-input:focus-within {
          border-color: ${themeColor} !important;
          box-shadow: 0 0 0 2px rgba(255, 133, 162, 0.2);
        }
        
        @keyframes fadeInAnimation {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* 美化表格样式 */
        .ant-table-thead > tr > th {
          background: rgba(255, 240, 245, 0.5);
          color: #888;
          font-weight: bold;
          border-bottom: 1px solid ${lightPink};
        }
        
        .ant-table-tbody > tr > td {
          border-bottom: 1px solid ${lightPink};
        }
        
        /* 表格分页器样式 */
        .ant-pagination-item-active {
          border-color: ${themeColor};
        }
        
        .ant-pagination-item-active a {
          color: ${themeColor};
        }
      `}</style>
    </div>
  );
}

export default AdminUserList;
