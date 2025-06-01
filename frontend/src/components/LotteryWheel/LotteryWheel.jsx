// LotteryWheel.jsx
import React, { useState, useEffect } from 'react';
import { Button, Space, message, Typography, Divider, Segmented, Card } from 'antd';
import { GiftOutlined, SaveOutlined, PlusOutlined, HeartOutlined, StarOutlined, UserOutlined, SettingOutlined, ImportOutlined, TeamOutlined } from '@ant-design/icons';
import { defaultPrizes, defaultMembers, defaultGift, LOTTERY_MODES } from './constants';
import PrizesTable from './PrizesTable';
import MembersTable from './MembersTable';
import GiftSetting from './GiftSetting';
import SpinWheel from './SpinWheel';
import LotteryResultModal from './LotteryResult';
import { useDeviceDetect } from '../../utils/deviceDetector';

const { Title } = Typography;

// 主题颜色和渐变定义
const themeColor = '#FF85A2';
const themeGradient = 'linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%)';
const secondaryColor = '#FF69B4';

function LotteryWheel({ isLoggedIn }) {
  const { isMobile } = useDeviceDetect();
  
  // ============================
  // 1) 模式管理
  // ============================
  const [mode, setMode] = useState(LOTTERY_MODES.PRIZE_MODE);

  // ============================
  // 2) 管理奖品列表（奖品模式）
  // ============================
  const [prizes, setPrizes] = useState(defaultPrizes);

  // ============================
  // 3) 管理人员列表（礼物抽人模式）
  // ============================
  const [members, setMembers] = useState(defaultMembers);

  // ============================
  // 4) 管理礼品设置（礼物抽人模式）
  // ============================
  const [gift, setGift] = useState(defaultGift);

  // ============================
  // 5) 舰长数据管理
  // ============================
  const [guards, setGuards] = useState([]);
  const [loadingGuards, setLoadingGuards] = useState(false);

  // ============================
  // 6) 存放抽奖结果和弹窗状态
  // ============================
  const [result, setResult] = useState({ name: '', image: '' });
  const [showResultModal, setShowResultModal] = useState(false);

  // ============================
  // 6) 自动保存到localStorage
  // ============================
  useEffect(() => {
    // 当人员数据变化时自动保存（避免初始化时保存）
    if (members.length > 0 && members !== defaultMembers) {
      localStorage.setItem('lottery_members', JSON.stringify(members));
    }
  }, [members]);

  useEffect(() => {
    // 当礼品设置变化时自动保存
    if (gift.name && gift !== defaultGift) {
      localStorage.setItem('lottery_gift', JSON.stringify(gift));
    }
  }, [gift]);

  // 监听抽奖结果，显示弹窗
  useEffect(() => {
    if (result && result.name && result.name !== '') {
      setShowResultModal(true);
    }
  }, [result]);

  useEffect(() => {
    if (isLoggedIn) {
      // 加载奖品数据（后端支持）
      fetch('/api/user/prizes', {
        method: 'GET',
        credentials: 'include',
      })
        .then((res) => {
          if (!res.ok) throw new Error('无法获取用户奖品数据');
          return res.json();
        })
        .then((data) => {
          setPrizes(data);
        })
        .catch((err) => {
          console.error('拉取奖品失败:', err);
          message.error('拉取用户奖品信息失败，使用默认奖品');
          setPrizes(defaultPrizes);
        });
    } else {
      // 未登录直接使用默认
      setPrizes(defaultPrizes);
    }

    // 人员数据和礼品设置使用localStorage（无需后端支持）
    try {
      const savedMembers = localStorage.getItem('lottery_members');
      if (savedMembers) {
        setMembers(JSON.parse(savedMembers));
      } else {
        setMembers(defaultMembers);
      }
    } catch (error) {
      console.error('加载人员数据失败:', error);
      setMembers(defaultMembers);
    }

    try {
      const savedGift = localStorage.getItem('lottery_gift');
      if (savedGift) {
        setGift(JSON.parse(savedGift));
      } else {
        setGift(defaultGift);
      }
    } catch (error) {
      console.error('加载礼品设置失败:', error);
      setGift(defaultGift);
    }
  }, [isLoggedIn]);

  // 获取舰长数据
  const fetchGuardsData = async () => {
    setLoadingGuards(true);
    try {
      const response = await fetch('/api/guards');
      if (!response.ok) {
        throw new Error('获取舰长数据失败');
      }
      const data = await response.json();
      const guardsArray = data.guards || [];
      
      // 调试：打印舰长数据结构
      console.log('获取到的舰长数据:', data);
      if (guardsArray.length > 0) {
        console.log('第一个舰长数据样例:', guardsArray[0]);
        console.log('所有可能的头像字段:', {
          avatar: guardsArray[0].avatar,
          face: guardsArray[0].face,
          head_url: guardsArray[0].head_url,
          face_url: guardsArray[0].face_url,
          uface: guardsArray[0].uface,
          user_face: guardsArray[0].user?.face,
          user_avatar: guardsArray[0].user?.avatar
        });
      }
      
      setGuards(guardsArray);
      return guardsArray;
    } catch (error) {
      console.error('获取舰长数据错误:', error);
      message.error('获取舰长数据失败');
      return [];
    } finally {
      setLoadingGuards(false);
    }
  };

  // 导入舰长数据为人员
  const importGuardsAsMembers = async () => {
    let guardsData = guards;
    
    // 如果还没有舰长数据，先获取
    if (!guardsData || guardsData.length === 0) {
      guardsData = await fetchGuardsData();
    }
    
    if (guardsData.length === 0) {
      message.warning('暂无舰长数据可导入');
      return;
    }

    // 将舰长数据转换为人员格式
    const importedMembers = guardsData.map(guard => {
      // 获取原始头像URL
      const originalAvatarUrl = guard.face || 
                               guard.avatar || 
                               guard.head_url || 
                               guard.face_url ||
                               guard.uface ||
                               (guard.user && guard.user.face) ||
                               (guard.user && guard.user.avatar) ||
                               '';
      
      // 使用代理API来获取头像，避免403错误（与Intro.js保持一致）
      let proxyAvatarUrl = '';
      if (originalAvatarUrl) {
        proxyAvatarUrl = `/api/proxy/image?url=${encodeURIComponent(originalAvatarUrl)}`;
      }

      const memberName = guard.username || 
                        guard.name || 
                        guard.uname ||
                        (guard.user && guard.user.name) ||
                        (guard.user && guard.user.uname) ||
                        '未知用户';

      console.log('导入舰长数据:', {
        用户名: memberName,
        原始头像URL: originalAvatarUrl,
        代理头像URL: proxyAvatarUrl
      });

      return {
        name: memberName,
        probability: 1, // 默认权重为1，所有人权重相等
        image: proxyAvatarUrl,
        // 保留原始舰长信息
        originalGuard: {
          uid: guard.uid,
          level: guard.guard_level || guard.level,
          price: guard.price,
          原始头像URL: originalAvatarUrl
        }
      };
    });

    setMembers(importedMembers);
    
    // 统计有头像的人数
    const withAvatarCount = importedMembers.filter(m => m.image).length;
    message.success(`成功导入 ${importedMembers.length} 位舰长数据！其中 ${withAvatarCount} 位有头像`);
    
    // 如果有头像缺失，给出提示
    if (withAvatarCount < importedMembers.length) {
      message.info(`${importedMembers.length - withAvatarCount} 位舰长暂无头像，将显示默认图标`);
    }
  };

  // 手动保存奖品到后端
  const handleSavePrizes = () => {
    if (!isLoggedIn) {
      message.warning('请先登录后再保存奖品');
      return;
    }
    fetch('/api/user/prizes', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prizes }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('保存奖品信息失败');
        return res.json();
      })
      .then(() => {
        message.success('奖品信息已成功保存到后端');
      })
      .catch((err) => {
        console.error(err);
        message.error('保存奖品信息出错');
      });
  };

  // 保存人员数据
  const handleSaveMembers = () => {
    try {
      localStorage.setItem('lottery_members', JSON.stringify(members));
      message.success('人员信息已成功保存');
    } catch (error) {
      console.error('保存人员信息失败:', error);
      message.error('保存人员信息出错');
    }
  };

  // 保存礼品设置
  const handleSaveGift = () => {
    try {
      localStorage.setItem('lottery_gift', JSON.stringify(gift));
      message.success('礼品设置已成功保存');
    } catch (error) {
      console.error('保存礼品设置失败:', error);
      message.error('保存礼品设置出错');
    }
  };

  // ============================
  // 4) 增加新奖品
  // ============================
  const handleAddPrize = () => {
    setPrizes((prev) => [
      ...prev,
      {
        name: '新奖品',
        probability: 0.0,
        image: '',
      },
    ]);
  };

  // 增加新人员
  const handleAddMember = () => {
    setMembers((prev) => [
      ...prev,
      {
        name: '新成员',
        probability: 1,
        image: '',
      },
    ]);
  };

  // ============================
  // 6) 模式切换选项
  // ============================
  const modeOptions = [
    {
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <GiftOutlined />
          礼物盲盒
        </div>
      ),
      value: LOTTERY_MODES.PRIZE_MODE,
    },
    {
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <UserOutlined />
          幸运星
        </div>
      ),
      value: LOTTERY_MODES.GIFT_MEMBER_MODE,
    },
  ];

  // ============================
  // 7) 渲染管理区域
  // ============================
  const renderManagementArea = () => {
    if (mode === LOTTERY_MODES.GIFT_MEMBER_MODE) {
      // 礼物抽人模式：显示人员管理和礼品设置（上下布局）
      return (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* 人员管理 - 占据整行 */}
          <div style={{ 
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(255, 133, 162, 0.15)',
            border: '1px solid rgba(255, 192, 203, 0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              marginBottom: '20px',
              gap: isMobile ? '12px' : '8px'
            }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                gap: '8px'
              }}>
                <Button 
                  type="primary" 
                  onClick={handleAddMember}
                  icon={<PlusOutlined />}
                  style={{ 
                    background: themeGradient,
                    border: 'none',
                    borderRadius: '12px',
                    height: '40px',
                    boxShadow: '0 4px 12px rgba(255, 133, 162, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  添加人员
                </Button>
                
                <Button 
                  onClick={importGuardsAsMembers}
                  loading={loadingGuards}
                  icon={<TeamOutlined />}
                  style={{ 
                    borderColor: themeColor,
                    color: themeColor,
                    borderRadius: '12px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <ImportOutlined />
                  导入舰长数据
                </Button>
              </div>
              
              <Button
                onClick={handleSaveMembers}
                icon={<SaveOutlined />}
                style={{ 
                  borderColor: themeColor,
                  color: themeColor,
                  borderRadius: '12px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                title="保存到本地浏览器"
              >
                本地保存
              </Button>
            </div>
            <MembersTable members={members} setMembers={setMembers} />
          </div>

          {/* 礼品设置 - 单独一行 */}
          <div style={{ 
            width: '100%'
          }}>
            <GiftSetting gift={gift} setGift={setGift} onSave={handleSaveGift} />
          </div>
        </div>
      );
    } else {
      // 奖品模式：显示奖品管理
      return (
        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '24px',
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(255, 133, 162, 0.15)',
          border: '1px solid rgba(255, 192, 203, 0.3)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <Button 
              type="primary" 
              onClick={handleAddPrize}
              icon={<PlusOutlined />}
              style={{ 
                background: themeGradient,
                border: 'none',
                borderRadius: '12px',
                height: '40px',
                boxShadow: '0 4px 12px rgba(255, 133, 162, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              添加奖品
            </Button>
            {isLoggedIn && (
              <Button
                onClick={handleSavePrizes}
                icon={<SaveOutlined />}
                style={{ 
                  borderColor: themeColor,
                  color: themeColor,
                  borderRadius: '12px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                保存奖品
              </Button>
            )}
          </div>
          <PrizesTable prizes={prizes} setPrizes={setPrizes} />
        </div>
      );
    }
  };

  // ============================
  // 8) 页面渲染
  // ============================
  return (
    <div style={{ 
      padding: isMobile ? '16px 12px' : '24px',
      maxWidth: '1200px',
      margin: '0 auto',
      position: 'relative',
      background: 'linear-gradient(135deg, rgba(255, 182, 193, 0.15) 0%, rgba(255, 105, 180, 0.12) 50%, rgba(255, 240, 245, 0.2) 100%)',
      borderRadius: '20px',
      boxShadow: '0 10px 25px rgba(255, 133, 162, 0.2)',
      overflow: 'hidden',
      minHeight: '600px'
    }}>
      {/* 装饰性背景元素 - 更可爱的设计 */}
      {/* 浮动的爱心 */}
      <div style={{
        position: 'absolute',
        width: '30px',
        height: '30px',
        top: '15%',
        right: '10%',
        zIndex: 0,
        fontSize: '30px',
        color: 'rgba(255, 105, 180, 0.3)',
        animation: 'floatHeart 4s ease-in-out infinite',
        animationDelay: '0s'
      }}>💖</div>
      
      <div style={{
        position: 'absolute',
        width: '25px',
        height: '25px',
        top: '40%',
        left: '8%',
        zIndex: 0,
        fontSize: '25px',
        color: 'rgba(255, 182, 193, 0.4)',
        animation: 'floatHeart 5s ease-in-out infinite',
        animationDelay: '1s'
      }}>💕</div>

      <div style={{
        position: 'absolute',
        width: '20px',
        height: '20px',
        bottom: '20%',
        right: '15%',
        zIndex: 0,
        fontSize: '20px',
        color: 'rgba(255, 192, 203, 0.5)',
        animation: 'floatHeart 3.5s ease-in-out infinite',
        animationDelay: '2s'
      }}>💝</div>

      {/* 浮动的星星 */}
      <div style={{
        position: 'absolute',
        width: '35px',
        height: '35px',
        top: '25%',
        left: '12%',
        zIndex: 0,
        fontSize: '35px',
        color: 'rgba(255, 215, 0, 0.4)',
        animation: 'twinkle 3s ease-in-out infinite',
        animationDelay: '0.5s'
      }}>⭐</div>

      <div style={{
        position: 'absolute',
        width: '28px',
        height: '28px',
        top: '60%',
        right: '20%',
        zIndex: 0,
        fontSize: '28px',
        color: 'rgba(255, 215, 0, 0.3)',
        animation: 'twinkle 4s ease-in-out infinite',
        animationDelay: '1.5s'
      }}>✨</div>

      <div style={{
        position: 'absolute',
        width: '22px',
        height: '22px',
        bottom: '30%',
        left: '15%',
        zIndex: 0,
        fontSize: '22px',
        color: 'rgba(255, 215, 0, 0.4)',
        animation: 'twinkle 2.5s ease-in-out infinite',
        animationDelay: '2.5s'
      }}>🌟</div>

      {/* 彩虹装饰 */}
      <div style={{
        position: 'absolute',
        width: '120px',
        height: '60px',
        top: '10%',
        left: '5%',
        zIndex: 0,
        fontSize: '60px',
        color: 'rgba(255, 105, 180, 0.2)',
        animation: 'gentle-sway 6s ease-in-out infinite',
        transform: 'rotate(-15deg)'
      }}>🌈</div>

      {/* 可爱的花朵 */}
      <div style={{
        position: 'absolute',
        width: '40px',
        height: '40px',
        bottom: '15%',
        right: '8%',
        zIndex: 0,
        fontSize: '40px',
        color: 'rgba(255, 182, 193, 0.3)',
        animation: 'bloom 4s ease-in-out infinite',
        animationDelay: '1s'
      }}>🌸</div>

      <div style={{
        position: 'absolute',
        width: '35px',
        height: '35px',
        top: '50%',
        right: '5%',
        zIndex: 0,
        fontSize: '35px',
        color: 'rgba(255, 192, 203, 0.4)',
        animation: 'bloom 5s ease-in-out infinite',
        animationDelay: '2.5s'
      }}>🌺</div>

      {/* 梦幻泡泡效果 */}
      <div style={{
        position: 'absolute',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,192,203,0.15) 0%, rgba(255,192,203,0.05) 50%, rgba(255,192,203,0) 70%)',
        top: '20%',
        right: '25%',
        zIndex: 0,
        animation: 'bubble-float 7s ease-in-out infinite',
        animationDelay: '0s'
      }} />
      
      <div style={{
        position: 'absolute',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,105,180,0.12) 0%, rgba(255,105,180,0.04) 50%, rgba(255,105,180,0) 70%)',
        bottom: '25%',
        left: '20%',
        zIndex: 0,
        animation: 'bubble-float 5s ease-in-out infinite',
        animationDelay: '2s'
      }} />

      <div style={{
        position: 'absolute',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,240,245,0.2) 0%, rgba(255,240,245,0.1) 50%, rgba(255,240,245,0) 70%)',
        top: '70%',
        right: '12%',
        zIndex: 0,
        animation: 'bubble-float 8s ease-in-out infinite',
        animationDelay: '3s'
      }} />

      {/* 可爱的小装饰 */}
      <div style={{
        position: 'absolute',
        width: '25px',
        height: '25px',
        top: '35%',
        right: '30%',
        zIndex: 0,
        fontSize: '25px',
        color: 'rgba(255, 182, 193, 0.4)',
        animation: 'gentle-sway 4s ease-in-out infinite',
        animationDelay: '1.5s'
      }}>🎀</div>

      <div style={{
        position: 'absolute',
        width: '30px',
        height: '30px',
        bottom: '40%',
        left: '25%',
        zIndex: 0,
        fontSize: '30px',
        color: 'rgba(255, 105, 180, 0.3)',
        animation: 'gentle-sway 5s ease-in-out infinite',
        animationDelay: '2s'
      }}>🎈</div>

      <Title level={isMobile ? 3 : 2} style={{ 
        margin: '16px 0 24px',
        textAlign: 'center',
        background: themeGradient,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        position: 'relative',
        zIndex: 1
      }}>
        🎰
        扭蛋抽奖机
        🎰
      </Title>

      {/* 模式切换 */}
      <div style={{ 
        textAlign: 'center',
        marginBottom: '24px',
        position: 'relative',
        zIndex: 1
      }}>
        <Segmented 
          options={modeOptions}
          value={mode}
          onChange={setMode}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '16px',
            padding: '4px',
            boxShadow: '0 4px 12px rgba(255, 133, 162, 0.2)'
          }}
        />
      </div>

      {/* 桌面端布局 */}
      {!isMobile && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '24px',
          position: 'relative',
          zIndex: 1
        }}>
          {/* 顶部：扭蛋抽奖机区域（居中布局） */}
          <div style={{ 
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '24px'
          }}>
            {/* 扭蛋抽奖机 */}
            <div style={{ 
              width: '1000px',
              maxWidth: '100%', // 移动端响应式
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 8px 24px rgba(255, 133, 162, 0.15)',
              border: '1px solid rgba(255, 192, 203, 0.3)',
              backdropFilter: 'blur(10px)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}>
              <SpinWheel 
                prizes={prizes} 
                result={result} 
                setResult={setResult}
                mode={mode}
                members={members}
                gift={gift}
              />
            </div>
          </div>
          
          {/* 下部分：管理区域 */}
          {renderManagementArea()}
        </div>
      )}

      {/* 移动端布局：垂直排列所有元素 */}
      {isMobile && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '20px',
          position: 'relative',
          zIndex: 1
        }}>
          {/* 扭蛋抽奖机 - 放在最顶部 */}
          <div style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '20px',
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(255, 133, 162, 0.15)',
            border: '1px solid rgba(255, 192, 203, 0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <SpinWheel 
              prizes={prizes} 
              result={result} 
              setResult={setResult}
              mode={mode}
              members={members}
              gift={gift}
            />
          </div>
          
          {/* 管理区域 */}
          {renderManagementArea()}
        </div>
      )}

      {/* 全屏结果弹窗 */}
      <LotteryResultModal 
        visible={showResultModal}
        result={result}
        onClose={() => {
          setShowResultModal(false);
          // 可选：清空结果
          // setResult({ name: '', image: '' });
        }}
      />

      {/* 全局CSS动画定义 */}
      <style jsx="true">{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }

        @keyframes floatHeart {
          0% {
            transform: translateY(0px) scale(1);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-15px) scale(1.1);
            opacity: 1;
          }
          100% {
            transform: translateY(0px) scale(1);
            opacity: 0.8;
          }
        }

        @keyframes twinkle {
          0% {
            transform: scale(1) rotate(0deg);
            opacity: 0.6;
          }
          25% {
            transform: scale(1.2) rotate(90deg);
            opacity: 1;
          }
          50% {
            transform: scale(0.8) rotate(180deg);
            opacity: 0.8;
          }
          75% {
            transform: scale(1.1) rotate(270deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(360deg);
            opacity: 0.6;
          }
        }

        @keyframes gentle-sway {
          0% {
            transform: translateX(0px) rotate(0deg);
          }
          25% {
            transform: translateX(8px) rotate(5deg);
          }
          50% {
            transform: translateX(0px) rotate(0deg);
          }
          75% {
            transform: translateX(-8px) rotate(-5deg);
          }
          100% {
            transform: translateX(0px) rotate(0deg);
          }
        }

        @keyframes bloom {
          0% {
            transform: scale(1) rotate(0deg);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.3) rotate(180deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(360deg);
            opacity: 0.7;
          }
        }

        @keyframes bubble-float {
          0% {
            transform: translateY(0px) scale(1);
            opacity: 0.6;
          }
          33% {
            transform: translateY(-20px) scale(1.1);
            opacity: 0.8;
          }
          66% {
            transform: translateY(-10px) scale(0.9);
            opacity: 1;
          }
          100% {
            transform: translateY(0px) scale(1);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}

export default LotteryWheel;
