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
  const [bilibiliUid, setBilibiliUid] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarFallbackTried, setAvatarFallbackTried] = useState(false);

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
      const res = await axios.get('/api/me', { withCredentials: true });
      if (res.data && res.data.authenticated) {
        setIsAdmin(!!res.data.is_admin);
        setUsername(res.data.username || null);
        setBilibiliUid(res.data.bilibili_uid || null);
        // 统一使用舰长头像
        if (res.data.bilibili_uid) {
          try {
            const resp = await fetch('/api/guards');
            if (resp.ok) {
              const data = await resp.json();
              const list = data.guards || [];
              const match = list.find(g => String(g.uid) === String(res.data.bilibili_uid));
              if (match && match.face) {
                setAvatarUrl(`/api/proxy/image?url=${encodeURIComponent(match.face)}`);
              } else {
                setAvatarUrl(null);
              }
            } else {
              setAvatarUrl(null);
            }
          } catch {
            setAvatarUrl(null);
          }
        } else {
          setAvatarUrl(null);
        }
      } else {
        setIsAdmin(false);
        setUsername(null);
        setBilibiliUid(null);
        setAvatarUrl(null);
        setAvatarFallbackTried(false);
      }
    } catch (err) {
      setIsAdmin(false);
      setUsername(null);
      setBilibiliUid(null);
      setAvatarUrl(null);
      setAvatarFallbackTried(false);
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
        
        // 获取当前路径
        const currentPath = window.location.pathname;
        
        // 如果当前在棉花糖页面，根据管理员状态重定向
        if (currentPath === '/cotton-candy' && res.data.is_admin) {
          window.location.href = '/admin/cotton-candy';
        } else if (currentPath === '/admin/cotton-candy' && !res.data.is_admin) {
          window.location.href = '/cotton-candy';
        } else {
          // 其他页面只需刷新即可
          window.location.reload();
        }
      }
    } catch (err) {
      message.error(err.response?.data?.message || '登录失败');
    }
  };
  

  // 处理登出
  const handleLogout = async () => {
    try {
      await axios.post('/api/logout', null, { withCredentials: true });
      
      // 获取当前路径
      const currentPath = window.location.pathname;
      
      setIsAdmin(false);
      setUsername(null);
      message.success('已登出');
      
      // 如果当前在管理员棉花糖页面，重定向到普通棉花糖页面
      if (currentPath === '/admin/cotton-candy') {
        window.location.href = '/cotton-candy';
      } else {
        // 其他页面导航到首页
        navigate('/intro');
      }
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
        password_confirm: hashedPassword,
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
            <Avatar 
              src={avatarUrl || undefined}
              icon={<UserOutlined />}
              onError={() => { setAvatarUrl(null); setAvatarFallbackTried(true); return false; }}
            />
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
            <div style={{ padding: '4px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Avatar 
                  src={avatarUrl || undefined}
                  icon={<UserOutlined />} 
                  style={{ flexShrink: 0 }}
                  onError={() => { setAvatarUrl(null); setAvatarFallbackTried(true); return false; }}
                />
                <Text strong style={{ fontSize: '15px', margin: 0 }}>{username}</Text>
              </div>
            </div>
          ),
          disabled: true,
        },
        {
          type: 'divider',
          style: { margin: '4px 0' }
        }
      ];
      
      if (isAdmin) {
        items.push({
          key: 'admin-status',
          label: (
            <div style={{ padding: '4px 0', display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                backgroundColor: '#52c41a', 
                marginRight: '8px',
                flexShrink: 0
              }}></div>
              <Text style={{ color: '#52c41a', margin: 0 }}>管理员</Text>
            </div>
          ),
          disabled: true,
        });
        
        items.push({
          key: 'admin',
          label: (
            <div style={{ padding: '4px 0' }}>
              <Link to="/admin/users" style={{ 
                color: 'var(--accent-color)', 
                display: 'block', 
                whiteSpace: 'nowrap',
                fontSize: '14px'
              }}>用户管理</Link>
            </div>
          ),
        });
        
        items.push({
          type: 'divider',
          style: { margin: '4px 0' }
        });
      }
      
      items.push({
        key: 'profile',
        label: (
          <div style={{ padding: '4px 0' }}>
            <Link to="/profile" style={{ 
              color: 'var(--accent-color)', 
              display: 'block', 
              whiteSpace: 'nowrap',
              fontSize: '14px'
            }}>个人中心</Link>
          </div>
        ),
      });

      items.push({
        type: 'divider',
        style: { margin: '4px 0' }
      });

      items.push({
        key: 'logout',
        label: (
          <div style={{ padding: '4px 0' }}>
            <a onClick={handleLogout} style={{ 
              color: '#ff4d4f', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontSize: '14px'
            }}>
              <LogoutOutlined style={{ fontSize: '14px' }} />
              <span>退出登录</span>
            </a>
          </div>
        ),
      });
      
      return (
        <Dropdown
          menu={{ 
            items,
            style: { 
              width: '140px', // 设置固定宽度
              padding: '8px 4px',
            } 
          }}
          placement="bottomRight"
          trigger={['click']}
        >
          <div style={{ 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            padding: '3px 8px', 
            borderRadius: '4px',
            transition: 'background 0.3s',
          }} 
          className="user-dropdown-trigger"
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Avatar 
              size="small" 
              src={avatarUrl || undefined} 
              icon={<UserOutlined />} 
              style={{ flexShrink: 0 }}
              onError={() => { setAvatarUrl(null); setAvatarFallbackTried(true); return false; }}
            />
            <span style={{ color: '#fff', fontSize: '14px' }}>{username}</span>
            {isAdmin && (
              <div style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                backgroundColor: '#52c41a', 
                marginLeft: '-4px',
                marginTop: '-10px',
                flexShrink: 0
              }}></div>
            )}
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
