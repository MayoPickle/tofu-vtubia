import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Drawer, Button, Badge, Avatar } from 'antd';
import { MenuOutlined, HeartOutlined, CustomerServiceOutlined, GiftOutlined, RocketOutlined, CoffeeOutlined } from '@ant-design/icons';
import Intro from './components/Intro';
import axios from 'axios';
import SongList from './components/SongList';
import AdminAuth from './components/AdminAuth';
import AdminUserList from './components/AdminUserList';
import Observatory from './components/Observatory';
import LotteryWheel from './components/LotteryWheel';
import Live2DModel from './components/Live2DModel';
import CherryBlossom from './components/CherryBlossom';
import CottonCandy from './components/CottonCandy';
import CottonCandyAdmin from './components/CottonCandyAdmin';
import { useDeviceDetect } from './utils/deviceDetector';
import MobileNavGesture from './components/MobileNavGesture';


const { Header, Content, Footer } = Layout;

// 粉色主题色常量
const themeColor = '#FF85A2';
const themeGradient = 'linear-gradient(135deg, #FF85A2 0%, #FF1493 100%)';
const headerGradient = 'linear-gradient(to right, rgba(255, 133, 162, 0.95), rgba(255, 20, 147, 0.95))';

function App() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const navParam = params.get('nav');
  const showIntro = navParam !== 'hideIntro';
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { isMobile } = useDeviceDetect();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [unreadCandyCount, setUnreadCandyCount] = useState(0);

  // ✅ 动态确定当前路由对应的选中菜单项
  const getSelectedMenuKey = () => {
    if (location.pathname.startsWith('/intro')) return 'intro';
    if (location.pathname.startsWith('/songs')) return 'songs';
    if (location.pathname.startsWith('/lottery')) return 'lottery';
    if (location.pathname.startsWith('/observatory')) return 'observatory';
    if (location.pathname.startsWith('/cotton-candy')) return 'cotton-candy';
    if (location.pathname.startsWith('/admin/cotton-candy')) return 'cotton-candy';
    return 'intro'; // 默认高亮
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    // 管理员获取未读棉花糖数量
    if (isAdmin) {
      fetchUnreadCandyCount();
    }
    
    // 当登录状态变化时，重定向到正确的页面
    const handleLoginStateChange = () => {
      const currentPath = window.location.pathname;
      
      // 棉花糖页面重定向
      if (currentPath === '/cotton-candy' && isAdmin) {
        window.location.replace('/admin/cotton-candy');
        return;
      } 
      
      if (currentPath === '/admin/cotton-candy' && !isAdmin) {
        window.location.replace('/cotton-candy');
        return;
      }
    };
    
    // 使用setTimeout确保状态已完全更新
    const timer = setTimeout(handleLoginStateChange, 100);
    return () => clearTimeout(timer);
  }, [isAdmin, isLoggedIn, location.pathname]);

  const checkAuth = async () => {
    try {
      const res = await axios.get('/api/check_auth', {
        withCredentials: true
      });
  
      setIsAdmin(res.data.is_admin);
      setIsLoggedIn(!!res.data.username);
    } catch (error) {
      setIsAdmin(false);
      setIsLoggedIn(false);
    }
  };
  
  const fetchUnreadCandyCount = async () => {
    try {
      const res = await axios.get('/api/cotton_candy/unread_count');
      setUnreadCandyCount(res.data.unread_count);
    } catch (error) {
      console.error('获取未读棉花糖数量失败', error);
    }
  };

  // 菜单项配置
  const menuItems = [
    ...(showIntro ? [{ 
      key: 'intro', 
      label: <Link to="/intro">介绍</Link>, 
      icon: <HeartOutlined style={{ fontSize: '16px' }} /> 
    }] : []),
    { 
      key: 'songs', 
      label: <Link to="/songs">音乐小馆</Link>, 
      icon: <CustomerServiceOutlined style={{ fontSize: '16px' }} /> 
    },
    { 
      key: 'lottery', 
      label: <Link to="/lottery">抽奖</Link>, 
      icon: <GiftOutlined style={{ fontSize: '16px' }} /> 
    },
    { 
      key: 'observatory', 
      label: <Link to="/observatory">观测站</Link>, 
      icon: <RocketOutlined style={{ fontSize: '16px' }} /> 
    },
    { 
      key: 'cotton-candy', 
      label: <Link to={isAdmin ? "/admin/cotton-candy" : "/cotton-candy"}>棉花糖</Link>, 
      icon: <CoffeeOutlined style={{ fontSize: '16px' }} />,
      ...(isAdmin && unreadCandyCount > 0 && { 
        badge: {
          count: unreadCandyCount,
          style: { backgroundColor: '#FF1493' }
        }
      })
    }
  ];
  
  // 移动端布局
  if (isMobile) {
    return (
      <Layout style={{ 
        minHeight: '100vh',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden',
        position: 'relative'
      }}>
        <CherryBlossom />
        <Header style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0 16px',
          background: headerGradient,
          borderRadius: '0 0 20px 20px',
          boxShadow: '0 4px 15px rgba(255, 133, 162, 0.3)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          height: '60px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ 
            color: '#fff', 
            fontSize: '18px', 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Avatar 
              size={36} 
              icon={<HeartOutlined />} 
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            />
            <span style={{ 
              textShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
              letterSpacing: '1px',
            }}>9672星球</span>
          </div>
          
          <Button
            type="text"
            size="large"
            icon={<MenuOutlined style={{ color: '#fff', fontSize: '20px' }} />}
            onClick={() => setDrawerVisible(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: 'none',
            }}
          />
        </Header>

        <Drawer
          title={
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              color: themeColor,
              fontSize: '18px',
              fontWeight: 'bold',
            }}>
              <Avatar 
                size={36} 
                icon={<HeartOutlined />} 
                style={{ 
                  background: themeGradient,
                  boxShadow: '0 2px 8px rgba(255, 133, 162, 0.3)'
                }}
              />
              <span>9672星球</span>
            </div>
          }
          placement="right"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          width={280}
          styles={{
            body: { padding: '12px' },
            header: { 
              padding: '16px 24px', 
              borderBottom: '1px solid rgba(255, 133, 162, 0.2)',
            },
            mask: { backdropFilter: 'blur(5px)' },
            content: { 
              borderRadius: '16px 0 0 16px',
              overflow: 'hidden',
            }
          }}
          closeIcon={
            <Button 
              type="text" 
              shape="circle" 
              size="small"
              icon={<MenuOutlined />}
              style={{ color: themeColor }}
            />
          }
        >
          <Menu 
            mode="vertical" 
            selectedKeys={[getSelectedMenuKey()]}
            onClick={() => setDrawerVisible(false)}
            items={menuItems}
            style={{ 
              borderRadius: '12px', 
              marginBottom: '20px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
              border: '1px solid rgba(255, 133, 162, 0.1)',
            }}
            styles={{
              item: {
                borderRadius: '8px',
                margin: '4px 0',
                fontWeight: 500,
              }
            }}
          />
          <div style={{ 
            padding: '16px',
            background: 'rgba(255, 245, 250, 0.5)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 133, 162, 0.1)',
          }}>
            <AdminAuth />
          </div>
        </Drawer>

        <Content style={{ 
          padding: '16px', 
          marginBottom: '70px',
          marginTop: '8px',
          width: '100%',
          maxWidth: '100%',
          overflowX: 'hidden',
          boxSizing: 'border-box'
        }} className="mobile-content">
          <Routes>
            <Route path="/intro" element={<Intro />} />
            <Route path="/songs" element={<SongList />} />
            <Route path="/" element={<Navigate to="/intro" />} />
            <Route path="/admin/users" element={<AdminUserList />} />
            <Route path="/lottery" element={<LotteryWheel isLoggedIn={isLoggedIn} />} />
            
            <Route path="/observatory" element={<Observatory isLoggedIn={isLoggedIn} isAdmin={isAdmin} />} />
            
            <Route 
              path="/cotton-candy" 
              element={isAdmin ? <Navigate to="/admin/cotton-candy" /> : <CottonCandy />} 
            />
            <Route 
              path="/admin/cotton-candy" 
              element={isAdmin ? <CottonCandyAdmin isAdmin={isAdmin} /> : <Navigate to="/cotton-candy" />} 
            />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>

          <MobileNavGesture />
        </Content>

        <Footer style={{ 
          textAlign: 'center', 
          color: '#fff',
          position: 'fixed',
          bottom: 0,
          width: '100%',
          padding: '12px 16px',
          background: headerGradient,
          zIndex: 1000,
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -4px 15px rgba(255, 133, 162, 0.3)',
          backdropFilter: 'blur(10px)',
          fontSize: '13px',
          fontWeight: '500',
          letterSpacing: '0.5px',
          boxSizing: 'border-box',
          left: 0,
          lineHeight: '1.4'
        }}>
          <div style={{ marginBottom: '4px' }}>
            © 2025 豆腐观测站 <HeartOutlined style={{ margin: '0 4px' }} />
          </div>
          <div style={{ 
            fontSize: '11px', 
            opacity: '0.9',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <span>support@xiaotudd.com</span>
            {process.env.REACT_APP_ICP_FILING_NUMBER && (
              <>
                <span style={{ opacity: '0.6' }}>|</span>
                <span style={{ opacity: '0.8' }}>
                  {process.env.REACT_APP_ICP_FILING_NUMBER}
                </span>
              </>
            )}
          </div>
        </Footer>
        
        <Live2DModel />
      </Layout>
    );
  }
  
  // PC端布局
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <CherryBlossom />
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0 30px',
        background: headerGradient,
        borderRadius: '0 0 20px 20px',
        boxShadow: '0 4px 15px rgba(255, 133, 162, 0.3)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        height: '64px',
      }}>
        {/* 左侧：标题 + 菜单 */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '30px',
          flex: '1'
        }}>
          <div style={{ 
            color: '#fff', 
            fontSize: '20px', 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            whiteSpace: 'nowrap'
          }}>
            <Avatar 
              size={40} 
              icon={<HeartOutlined />} 
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            />
            <span style={{ 
              textShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
              letterSpacing: '1px',
            }}>9672星球</span>
          </div>

          <Menu 
            theme="dark" 
            mode="horizontal" 
            selectedKeys={[getSelectedMenuKey()]} 
            items={menuItems}
            style={{
              flex: '1',
              minWidth: '500px',
              background: 'transparent',
              borderBottom: 'none',
            }}
            styles={{
              item: {
                margin: '0 5px',
                borderRadius: '8px',
                color: 'rgba(255, 255, 255, 0.85) !important',
                transition: 'all 0.3s',
              },
              itemSelected: {
                background: 'rgba(255, 255, 255, 0.15) !important',
                borderBottom: 'none !important',
                fontWeight: 'bold',
              },
              itemHover: {
                background: 'rgba(255, 255, 255, 0.1) !important',
                borderBottom: 'none !important',
              },
            }}
          />
        </div>

        {/* 右侧：管理员登录/登出组件 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          padding: '4px 12px',
          backdropFilter: 'blur(5px)',
        }}>
          <AdminAuth />
        </div>
      </Header>

      <Content style={{ 
        padding: '30px',
        marginTop: '0',
      }}>
        <Routes>
          <Route path="/intro" element={<Intro />} />
          <Route path="/songs" element={<SongList />} />
          <Route path="/" element={<Navigate to="/intro" />} />
          <Route path="/admin/users" element={<AdminUserList />} />
          <Route path="/lottery" element={<LotteryWheel isLoggedIn={isLoggedIn} />} />
          
          <Route path="/observatory" element={<Observatory isLoggedIn={isLoggedIn} isAdmin={isAdmin} />} />
          
          <Route 
            path="/cotton-candy" 
            element={isAdmin ? <Navigate to="/admin/cotton-candy" /> : <CottonCandy />} 
          />
          <Route 
            path="/admin/cotton-candy" 
            element={isAdmin ? <CottonCandyAdmin isAdmin={isAdmin} /> : <Navigate to="/cotton-candy" />} 
          />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Content>

      {/* 全局 Footer */}
      <Footer style={{ 
        textAlign: 'center', 
        color: '#fff',
        background: headerGradient,
        borderRadius: '20px 20px 0 0',
        boxShadow: '0 -4px 15px rgba(255, 133, 162, 0.3)',
        marginTop: '16px',
        padding: '16px 30px',
        fontSize: '14px',
        fontWeight: '500',
        letterSpacing: '0.5px',
        lineHeight: '1.5'
      }}>
        <div style={{ marginBottom: '6px' }}>
          © 2025 豆腐观测站 <HeartOutlined style={{ margin: '0 4px' }} />
        </div>
        <div style={{ 
          fontSize: '12px', 
          opacity: '0.9',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <span>支援邮箱: support@xiaotudd.com</span>
          // {process.env.REACT_APP_ICP_FILING_NUMBER && (
          //   <>
          //     <span style={{ opacity: '0.6' }}>•</span>
          //     <span style={{ opacity: '0.8' }}>
          //       {process.env.REACT_APP_ICP_FILING_NUMBER}
          //     </span>
          //   </>
          // )}
          <span style={{ opacity: '0.6' }}>•</span>
          <span style={{ opacity: '0.8' }}>
            湘ICP 备2025124288号-1
          </span>
        </div>
      </Footer>
      
      <Live2DModel />
    </Layout>
  );
}

export default App;
