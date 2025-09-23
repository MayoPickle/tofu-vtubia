import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dropdown, Modal, Form, Input, message, Avatar, Typography, Divider, Button, Space } from 'antd';
import { UserOutlined, LogoutOutlined, LoginOutlined, UserAddOutlined, SettingOutlined, DownOutlined } from '@ant-design/icons';
import axios from 'axios';
import MD5 from 'crypto-js/md5';
import { useDeviceDetect } from '../utils/deviceDetector';

const { Text } = Typography;

function AdminAuth() {
  const navigate = useNavigate();
  const { isMobile } = useDeviceDetect();

  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm] = Form.useForm();

  // 注册表单
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerForm] = Form.useForm();
  // 忘记密码表单
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotForm] = Form.useForm();

  // 注册礼物验证弹窗与轮询
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifySecondsLeft, setVerifySecondsLeft] = useState(120);
  const [verifyPolling, setVerifyPolling] = useState(false);
  const [verifyVerified, setVerifyVerified] = useState(false);
  const [verifyError, setVerifyError] = useState(null);
  const verifyIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const pendingRegisterRef = useRef(null); // { action: 'register'|'reset', uid, displayName?, hashedPassword }

  const clearVerifyTimers = useCallback(() => {
    if (verifyIntervalRef.current) {
      clearInterval(verifyIntervalRef.current);
      verifyIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const closeVerifyModal = useCallback(() => {
    clearVerifyTimers();
    setShowVerifyModal(false);
    setVerifyPolling(false);
    setVerifyVerified(false);
    setVerifyError(null);
    setVerifySecondsLeft(120);
    pendingRegisterRef.current = null;
  }, [clearVerifyTimers]);

  const pollVerifyOnce = useCallback(async (uid) => {
    try {
      const resp = await axios.post('/api/register/verify_gift', { uid });
      if (resp.data && resp.data.verified) {
        setVerifyVerified(true);
        return true;
      }
      return false;
    } catch (e) {
      setVerifyError(e.response?.data?.message || '验证请求失败');
      return false;
    }
  }, []);

  const startVerifyFlow = useCallback(async (uid) => {
    setShowVerifyModal(true);
    setVerifyPolling(true);
    setVerifyVerified(false);
    setVerifyError(null);
    setVerifySecondsLeft(120);

    // 先立即尝试一次
    const first = await pollVerifyOnce(uid);
    if (first) {
      if (pendingRegisterRef.current) {
        const { action, uid: pUid, displayName, hashedPassword } = pendingRegisterRef.current;
        try {
          if (action === 'reset') {
            const res = await axios.post('/api/forgot_password/reset', {
              uid: pUid,
              password: hashedPassword
            });
            if (res.status === 200) {
              message.success('重置成功，已自动登录');
              setIsAdmin(!!res.data?.is_admin);
              setUsername(res.data?.username || '用户');
              closeVerifyModal();
              try { await checkAuth(); } catch {}
            }
          } else {
            const res = await axios.post('/api/register', {
              uid: pUid,
              username: displayName || undefined,
              password: hashedPassword,
              password_confirm: hashedPassword,
              agree: true
            });
            if (res.status === 201) {
              message.success('注册成功，已自动登录');
              setIsAdmin(!!res.data?.is_admin);
              setUsername(res.data?.username || '用户');
              setShowRegisterModal(false);
              closeVerifyModal();
              try { await checkAuth(); } catch {}
            }
          }
        } catch (err) {
          message.error(err.response?.data?.message || (action === 'reset' ? '重置失败' : '注册失败'));
          closeVerifyModal();
        }
      } else {
        closeVerifyModal();
      }
      return;
    }

    // 每3秒轮询一次
    verifyIntervalRef.current = setInterval(async () => {
      const ok = await pollVerifyOnce(uid);
      if (ok) {
        if (pendingRegisterRef.current) {
          const { action, uid: pUid, displayName, hashedPassword } = pendingRegisterRef.current;
          try {
            if (action === 'reset') {
              const res = await axios.post('/api/forgot_password/reset', {
                uid: pUid,
                password: hashedPassword
              });
              if (res.status === 200) {
                message.success('重置成功，已自动登录');
                setIsAdmin(!!res.data?.is_admin);
                setUsername(res.data?.username || '用户');
                closeVerifyModal();
                try { await checkAuth(); } catch {}
              }
            } else {
              const res = await axios.post('/api/register', {
                uid: pUid,
                username: displayName || undefined,
                password: hashedPassword,
                password_confirm: hashedPassword,
                agree: true
              });
              if (res.status === 201) {
                message.success('注册成功，已自动登录');
                setIsAdmin(!!res.data?.is_admin);
                setUsername(res.data?.username || '用户');
                setShowRegisterModal(false);
                closeVerifyModal();
                try { await checkAuth(); } catch {}
              }
            }
          } catch (err) {
            message.error(err.response?.data?.message || (action === 'reset' ? '重置失败' : '注册失败'));
            closeVerifyModal();
          }
        } else {
          closeVerifyModal();
        }
      }
    }, 3000);

    // 倒计时
    countdownIntervalRef.current = setInterval(() => {
      setVerifySecondsLeft(prev => {
        if (prev <= 1) {
          clearVerifyTimers();
          setVerifyPolling(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [pollVerifyOnce, closeVerifyModal, clearVerifyTimers]);

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
        setAvatarUrl(null);
      }
    } catch (err) {
      setIsAdmin(false);
      setUsername(null);
      setAvatarUrl(null);
    }
  };

  // 提交登录
  const handleLoginSubmit = async () => {
    try {
      const values = await loginForm.validateFields();
      const hashedPassword = MD5(values.password).toString();
  
      const res = await axios.post('/api/login', {
        uid: values.uid,
        password: hashedPassword
      });
  
      if (res.status === 200) {
        message.success('登录成功');
        setIsAdmin(res.data.is_admin);
        setUsername(res.data.username || '用户');
        setShowLoginModal(false);
        
        const currentPath = window.location.pathname;
        
        if (currentPath === '/cotton-candy' && res.data.is_admin) {
          window.location.href = '/admin/cotton-candy';
        } else if (currentPath === '/admin/cotton-candy' && !res.data.is_admin) {
          window.location.href = '/cotton-candy';
        } else {
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
      const hashedPassword = MD5(values.password).toString();

      // 暂存注册参数，开启验证弹窗与轮询
      pendingRegisterRef.current = {
        uid: values.uid,
        displayName: values.display_name || undefined,
        hashedPassword
      };
      await startVerifyFlow(values.uid);
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
              onError={() => { setAvatarUrl(null); return false; }}
            />
            <Text strong>{username}</Text>
            {isAdmin && <Text type="success">(管理员)</Text>}
          </div>
          
          <Space>
            <Button 
              size="small"
              onClick={() => navigate('/profile')}
            >
              个人中心
            </Button>
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
                  onError={() => { setAvatarUrl(null); return false; }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Text strong style={{ fontSize: '15px', margin: 0 }}>{username}</Text>
                  {isAdmin && (
                    <span style={{ color: '#52c41a', fontSize: 12, whiteSpace: 'nowrap' }}>• 管理员</span>
                  )}
                </div>
              </div>
            </div>
          ),
          disabled: true,
        },
        { type: 'divider', style: { margin: '6px 0' } },
        {
          type: 'group',
          label: '账户',
          children: [
            {
              key: 'profile',
              label: (
                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <UserOutlined />
                  <span>个人中心</span>
                </Link>
              ),
            },
          ],
        },
        ...(isAdmin ? [
          {
            type: 'group',
            label: '管理',
            children: [
              {
                key: 'admin',
                label: (
                  <Link to="/admin/users" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <SettingOutlined />
                    <span>用户管理</span>
                  </Link>
                ),
              },
            ],
          },
        ] : []),
        { type: 'divider', style: { margin: '6px 0' } },
        {
          key: 'logout',
          danger: true,
          label: (
            <button type="button" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer' }}>
              <LogoutOutlined />
              <span>退出登录</span>
            </button>
          ),
        },
      ];
      
      return (
        <Dropdown
          menu={{ 
            items,
            style: { 
              width: 200,
              padding: '8px 8px',
            } 
          }}
          placement="bottomRight"
          trigger={['click']}
          arrow
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
              onError={() => { setAvatarUrl(null); return false; }}
            />
            <span style={{ color: '#fff', fontSize: '14px' }}>{username}</span>
            <DownOutlined style={{ color: '#fff', fontSize: 10 }} />
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
        <button 
          type="button"
          style={{ 
            color: '#fff',
            transition: 'opacity 0.3s',
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer'
          }} 
          onClick={() => setShowLoginModal(true)}
          className="header-link"
          onMouseEnter={(e) => e.target.style.opacity = '0.8'}
          onMouseLeave={(e) => e.target.style.opacity = '1'}
        >
          登录
        </button>
        <Divider type="vertical" style={{ backgroundColor: '#fff' }} />
        <button 
          type="button"
          style={{ 
            color: '#fff',
            transition: 'opacity 0.3s',
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer'
          }} 
          onClick={openRegisterModal}
          className="header-link"
          onMouseEnter={(e) => e.target.style.opacity = '0.8'}
          onMouseLeave={(e) => e.target.style.opacity = '1'}
        >
          注册
        </button>
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
            name="uid"
            label="UID"
            rules={[{ required: true, message: '请输入B站UID' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="请输入B站UID"
              inputMode="numeric"
              pattern="[0-9]*"
              allowClear
              onChange={(e) => {
                const v = (e.target.value || '').replace(/\D/g, '');
                loginForm.setFieldsValue({ uid: v });
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <div style={{ textAlign: 'right', marginTop: 4 }}>
            <button
              type="button"
              onClick={() => {
                setShowLoginModal(false);
                forgotForm.resetFields();
                setShowForgotModal(true);
              }}
              style={{ background: 'transparent', border: 'none', padding: 0, color: '#FF85A2', cursor: 'pointer' }}
            >
              忘记密码？
            </button>
          </div>
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

        <Form form={registerForm} layout="vertical">
          <Form.Item
            name="agree"
            valuePropName="checked"
            rules={[{
              validator: (_, value) => value ? Promise.resolve() : Promise.reject(new Error('请先阅读并同意用户协议与隐私政策'))
            }]}
          >
            <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.7)' }}>
              <label style={{ cursor: 'pointer' }}>
                <input type="checkbox" style={{ marginRight: 6 }} />
                我已阅读并同意
                <a href="/terms" target="_blank" rel="noreferrer" style={{ margin: '0 4px' }}>《用户协议》</a>
                和
                <a href="/privacy" target="_blank" rel="noreferrer" style={{ margin: '0 4px' }}>《隐私政策》</a>
              </label>
            </div>
          </Form.Item>
          <Form.Item
            name="uid"
            label="B站UID"
            rules={[{ required: true, message: '请输入B站UID' }]}
          >
            <Input 
              placeholder="请输入你的B站UID" 
              inputMode="numeric"
              pattern="[0-9]*"
              allowClear
              onChange={(e) => {
                const v = (e.target.value || '').replace(/\D/g, '');
                registerForm.setFieldsValue({ uid: v });
              }}
            />
          </Form.Item>

          <Form.Item
            name="display_name"
            label="展示昵称（选填）"
          >
            <Input placeholder="用于展示的昵称，可不填，默认使用UID" />
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
        </Form>
      </Modal>

      {/* 注册验证弹窗 */}
      <Modal
        title="验证账号归属权 ✨"
        open={showVerifyModal}
        onCancel={closeVerifyModal}
        footer={null}
        maskClosable={false}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Text>请在 2 分钟内到直播间投喂一份带「灯牌」的礼物呀～✨ 帮我确认这是你的账号哦！</Text>
          <a href={`https://live.bilibili.com/1883353860`} target="_blank" rel="noreferrer" style={{ fontSize: 14 }}>
            去直播间 ➜
          </a>
          <Text type={verifyVerified ? 'success' : verifySecondsLeft === 0 ? 'danger' : 'secondary'} style={{ fontSize: 20, fontWeight: 700 }}>
            小闹钟：{verifySecondsLeft}s ⏳
          </Text>
          {verifyError && <Text type="danger">{verifyError}</Text>}
          {verifyVerified ? (
            <Text type="success">捕捉到你的「灯牌」啦！正在为你完成登记喔～ ✅</Text>
          ) : verifySecondsLeft === 0 ? (
            <Text type="danger">还没等到「灯牌」…可以稍作休息后再试一次呢～</Text>
          ) : (
            <Text>我会每 3 秒偷偷看一眼，有礼物就第一时间告诉你～(ง •̀_•́)ง</Text>
          )}
          {/* 按钮去除，保持自动轮询与倒计时 */}
        </div>
      </Modal>

      {/* 忘记密码弹窗 */}
      <Modal
        title="忘记密码"
        open={showForgotModal}
        onCancel={() => setShowForgotModal(false)}
        onOk={async () => {
          try {
            const values = await forgotForm.validateFields();
            const hashedPassword = MD5(values.password).toString();
            // 开启验证流程
            pendingRegisterRef.current = {
              action: 'reset',
              uid: values.uid,
              hashedPassword
            };
            setShowForgotModal(false);
            await startVerifyFlow(values.uid);
          } catch (e) {}
        }}
        okText="开始验证"
        cancelText="取消"
        maskClosable={false}
      >
        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          请输入你的 UID 与新密码。随后将提示你在2分钟内投喂「灯牌」完成验证。
        </Typography.Text>
        <Form form={forgotForm} layout="vertical">
          <Form.Item name="uid" label="B站UID" rules={[{ required: true, message: '请输入B站UID' }]}>
            <Input 
              placeholder="请输入你的B站UID" 
              inputMode="numeric"
              pattern="[0-9]*"
              allowClear
              onChange={(e) => {
                const v = (e.target.value || '').replace(/\D/g, '');
                forgotForm.setFieldsValue({ uid: v });
              }}
            />
          </Form.Item>
          <Form.Item name="password" label="新密码" rules={[{ required: true, message: '请输入新密码' }, { min: 6, message: '密码至少6个字符' }]}>
            <Input.Password placeholder="请输入新的登录密码" />
          </Form.Item>
          <Form.Item name="confirm" label="确认新密码" dependencies={["password"]} rules={[{ required: true, message: '请确认新密码' }, ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('两次输入的密码不一致'));
            },
          })]}>
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default AdminAuth;
