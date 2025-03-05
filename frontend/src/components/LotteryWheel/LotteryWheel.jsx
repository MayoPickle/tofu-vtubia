// LotteryWheel.jsx
import React, { useState, useEffect } from 'react';
import { Button, Space, message, Typography, Divider } from 'antd';
import { defaultPrizes } from './constants';
import PrizesTable from './PrizesTable';
import SpinWheel from './SpinWheel';
import LotteryResult from './LotteryResult';
import { useDeviceDetect } from '../../utils/deviceDetector';

const { Title } = Typography;

function LotteryWheel({ isLoggedIn }) {
  const { isMobile } = useDeviceDetect();
  
  // ============================
  // 1) 管理奖品列表
  // ============================
  const [prizes, setPrizes] = useState(defaultPrizes);

  useEffect(() => {
    if (isLoggedIn) {
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
  }, [isLoggedIn]);

  // 手动保存到后端
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

  // ============================
  // 2) 增加新奖品
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

  // ============================
  // 3) 存放抽奖结果
  // ============================
  const [result, setResult] = useState({ name: '', image: '' });

  // ============================
  // 4) 页面渲染
  // ============================
  return (
    <div style={{ 
      padding: isMobile ? '16px 12px' : '24px',
      maxWidth: '1200px',
      margin: '0 auto',
      backgroundColor: '#f9f9f9',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
    }}>
      <Title level={isMobile ? 3 : 2} style={{ 
        marginBottom: isMobile ? 16 : 24, 
        textAlign: 'center',
        color: '#333',
        fontWeight: 600
      }}>
        幸运抽奖转盘
      </Title>

      {/* 桌面端布局 */}
      {!isMobile && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 上部分：奖品编辑区域 */}
          <div style={{ 
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <Button 
                type="primary" 
                onClick={handleAddPrize}
                style={{ backgroundColor: '#ff85c0', borderColor: '#ff85c0' }}
              >
                添加奖品
              </Button>
              {isLoggedIn && (
                <Button
                  onClick={handleSavePrizes}
                  type="default"
                  style={{ borderColor: '#ff85c0', color: '#ff85c0' }}
                >
                  保存奖品
                </Button>
              )}
            </div>
            <PrizesTable prizes={prizes} setPrizes={setPrizes} />
          </div>
          
          {/* 下部分：转盘和结果区域（左右布局） */}
          <div style={{ 
            display: 'flex',
            gap: '30px'
          }}>
            {/* 左边：转盘 */}
            <div style={{ 
              width: '60%',
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <SpinWheel prizes={prizes} result={result} setResult={setResult} />
            </div>
            
            {/* 右边：结果展示 */}
            <div style={{ 
              width: '40%',
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center'
            }}>
              <LotteryResult result={result} prizes={prizes} />
            </div>
          </div>
        </div>
      )}

      {/* 移动端布局：垂直排列所有元素 */}
      {isMobile && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* 奖品编辑区域 */}
          <div style={{ 
            backgroundColor: '#fff',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <Space style={{ 
              marginBottom: '16px',
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between'
            }}>
              <Button 
                type="primary" 
                onClick={handleAddPrize}
                block
                style={{ flex: 1, backgroundColor: '#ff85c0', borderColor: '#ff85c0' }}
              >
                添加奖品
              </Button>
              {isLoggedIn && (
                <Button
                  onClick={handleSavePrizes}
                  style={{ flex: 1, borderColor: '#ff85c0', color: '#ff85c0' }}
                  block
                >
                  保存奖品
                </Button>
              )}
            </Space>
            <PrizesTable prizes={prizes} setPrizes={setPrizes} />
          </div>
          
          {/* 转盘 */}
          <div style={{ 
            backgroundColor: '#fff',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <SpinWheel prizes={prizes} result={result} setResult={setResult} />
          </div>
          
          {/* 结果展示 */}
          <div style={{ 
            backgroundColor: '#fff',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <LotteryResult result={result} prizes={prizes} />
          </div>
        </div>
      )}
    </div>
  );
}

export default LotteryWheel;
