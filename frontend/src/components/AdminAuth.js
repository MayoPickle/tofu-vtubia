import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dropdown, Menu, Modal, Form, Input, message, Avatar, Typography, Divider, Button, Space } from 'antd';
import { UserOutlined, LogoutOutlined, LoginOutlined, UserAddOutlined } from '@ant-design/icons';
import axios from 'axios';
import MD5 from 'crypto-js/md5';
import { useDeviceDetect } from '../utils/deviceDetector';

const { Text } = Typography;

function AdminAuth() {
  const navigate = useNavigate();
  const { isMobile } = useDeviceDetect();

  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState(null);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm] = Form.useForm();

  // 注册表单
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerForm] = Form.useForm();

  useEffect(() => {
    checkAuth();
  }, []);

  // 检查是否已登录
  const checkAuth = async () => {
    try {
      const res = await axios.get('/api/check_auth');
      if (res.data.is_admin) {
        setIsAdmin(true);
      }
      setUsername(res.data.username || null);
    } catch (err) {
      setIsAdmin(false);
      setUsername(null);
    }
  };

  // 提交登录
  const handleLoginSubmit = async () => {
    try {
      const values = await loginForm.validateFields();
      const hashedPassword = MD5(values.password).toString(); // 对密码进行 MD5 加密
  
      // 发送加密后的密码
      const res = await axios.post('/api/login', {
        username: values.username,
        password: hashedPassword
      });
  
      if (res.status === 200) {
        message.success('登录成功');
        setIsAdmin(res.data.is_admin);
        setUsername(res.data.username || '用户');
        setShowLoginModal(false);
        window.location.reload();
      }
    } catch (err) {
      message.error(err.response?.data?.message || '登录失败');
    }
  };
  

  // 处理登出
  const handleLogout = async () => {
    try {
      await axios.post('/api/logout', null, { withCredentials: true });
      setIsAdmin(false);
      setUsername(null);
      message.success('已登出');
      navigate('/intro');
    } catch (err) {
      message.error('登出失败');
    }
  };

  // 注册逻辑
  const openRegisterModal = () => {
    setShowRegisterModal(true);
    registerForm.resetFields();
  };

  const handleRegister = async () => {
    try {
      const values = await registerForm.validateFields();
      const hashedPassword = MD5(values.password).toString(); // 对密码进行 MD5 加密
  
      // 提交到 /api/register
      const res = await axios.post('/api/register', {
        username: values.username,
        password: hashedPassword,
        bilibili_uid: values.bilibili_uid || null
      });
  
      if (res.status === 201) {
        message.success('注册成功，请登录');
        setShowRegisterModal(false);
      }
    } catch (err) {
      message.error(err.response?.data?.message || '注册失败');
    }
  };

  // 渲染移动端界面
  const renderMobileView = () => {
    // 已登录状态
    if (username) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Avatar icon={<UserOutlined />} />
            <Text strong>{username}</Text>
            {isAdmin && <Text type="success">(管理员)</Text>}
          </div>
          
          <Space>
            {isAdmin && (
              <Button 
                size="small" 
                type="primary"
                onClick={() => navigate('/admin/users')}
              >
                用户管理
              </Button>
            )}
            
            <Button 
              size="small" 
              danger 
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              退出
            </Button>
          </Space>
        </div>
      );
    }
    
    // 未登录状态
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button 
          block 
          type="primary" 
          icon={<LoginOutlined />}
          onClick={() => setShowLoginModal(true)}
        >
          登录
        </Button>
        
        <Button 
          block 
          icon={<UserAddOutlined />}
          onClick={openRegisterModal}
        >
          注册
        </Button>
      </Space>
    );
  };

  // 渲染PC端界面
  const renderDesktopView = () => {
    // 已登录状态
    if (username) {
      const items = [
        {
          key: 'username',
          label: (
            <div style={{ padding: '6px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Avatar icon={<UserOutlined />} />
                <Text strong>{username}</Text>
              </div>
              {isAdmin && (
                <div style={{ marginTop: 4 }}>
                  <Text type="success">管理员身份</Text>
                </div>
              )}
            </div>
          ),
          disabled: true,
        },
        {
          type: 'divider',
        }
      ];
      
      if (isAdmin) {
        items.push({
          key: 'admin',
          label: <Link to="/admin/users" style={{ color: 'var(--accent-color)' }}>用户管理</Link>,
        });
      }
      
      items.push({
        key: 'logout',
        label: (
          <a onClick={handleLogout} style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>
            退出登录
          </a>
        ),
        danger: true,
      });
      
      return (
        <Dropdown
          menu={{ items }}
          placement="bottomRight"
          trigger={['click']}
        >
          <div style={{ cursor: 'pointer' }}>
            <Avatar icon={<UserOutlined />} />
            <span style={{ marginLeft: 8, color: '#fff' }}>{username}</span>
          </div>
        </Dropdown>
      );
    }
    
    // 未登录状态
    return (
      <div style={{ color: '#fff' }}>
        <a 
          style={{ 
            color: '#fff',
            transition: 'opacity 0.3s'
          }} 
          onClick={() => setShowLoginModal(true)}
          className="header-link"
          onMouseEnter={(e) => e.target.style.opacity = '0.8'}
          onMouseLeave={(e) => e.target.style.opacity = '1'}
        >
          登录
        </a>
        <Divider type="vertical" style={{ backgroundColor: '#fff' }} />
        <a 
          style={{ 
            color: '#fff',
            transition: 'opacity 0.3s'
          }} 
          onClick={openRegisterModal}
          className="header-link"
          onMouseEnter={(e) => e.target.style.opacity = '0.8'}
          onMouseLeave={(e) => e.target.style.opacity = '1'}
        >
          注册
        </a>
      </div>
    );
  };

  return (
    <>
      {/* 根据设备类型渲染不同的界面 */}
      {isMobile ? renderMobileView() : renderDesktopView()}

      {/* 登录对话框 */}
      <Modal
        title="登录"
        open={showLoginModal}
        onCancel={() => setShowLoginModal(false)}
        onOk={handleLoginSubmit}
        okText="登录"
        cancelText="取消"
        maskClosable={false}
      >
        <Form
          form={loginForm}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 注册对话框 */}
      <Modal
        title="注册"
        open={showRegisterModal}
        onOk={handleRegister}
        onCancel={() => setShowRegisterModal(false)}
        okText="注册"
        cancelText="取消"
        maskClosable={false}
      >
        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          您的密码将使用哈希加密存储，维护者也无法查看密码。
        </Typography.Text>
        <Form form={registerForm} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' },
              { max: 20, message: '用户名最多20个字符' },
            ]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>

          <Form.Item
            name="confirm"
            label="确认密码"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入密码" />
          </Form.Item>
          
          <Form.Item
            name="bilibili_uid"
            label="B站UID（选填）"
          >
            <Input placeholder="请输入你的B站UID" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default AdminAuth;
