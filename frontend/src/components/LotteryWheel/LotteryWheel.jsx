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
      body: JSON.stringify(prizes),
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
      padding: isMobile ? '12px 8px' : '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <Title level={isMobile ? 3 : 2} style={{ marginBottom: isMobile ? 12 : 20, textAlign: 'center' }}>
        抽奖转盘
      </Title>

      <Space style={{ 
        marginBottom: isMobile ? 8 : 10,
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        width: isMobile ? '100%' : 'auto'
      }}>
        <Button 
          type="primary" 
          onClick={handleAddPrize}
          style={{ width: isMobile ? '100%' : 'auto' }}
        >
          添加奖品
        </Button>
        {isLoggedIn && (
          <Button
            onClick={handleSavePrizes}
            style={{ width: isMobile ? '100%' : 'auto' }}
          >
            保存奖品
          </Button>
        )}
      </Space>

      {/* 奖品表格 */}
      <PrizesTable prizes={prizes} setPrizes={setPrizes} />

      {/* 转盘 + 抽奖结果 - 移动端垂直排列，桌面端水平排列 */}
      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        gap: isMobile ? 16 : 40, 
        marginTop: isMobile ? 12 : 20,
        alignItems: 'center'
      }}>
        <SpinWheel prizes={prizes} result={result} setResult={setResult} />
        
        {isMobile && <Divider style={{ margin: '12px 0' }} />}
        
        <LotteryResult result={result} />
      </div>
    </div>
  );
}

export default LotteryWheel;
