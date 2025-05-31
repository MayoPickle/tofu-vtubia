// SpinWheel.jsx - 抽奖机版本
import React, { useState, useEffect, useRef } from 'react';
import { Button, message } from 'antd';
import { GiftOutlined, UserOutlined } from '@ant-design/icons';
import { useDeviceDetect } from '../../utils/deviceDetector';
import { LOTTERY_MODES } from './constants';

// 主题颜色和渐变定义
const themeColor = '#FF85A2';
const themeGradient = 'linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%)';

// 调色板 - 可爱的粉色系
const palette = [
  '#FFB6C1', // Light Pink
  '#FFD1DC', // Pastel Pink
  '#FFC0CB', // Pink
  '#FF69B4', // Hot Pink
  '#FFB7C5', // Cherry Blossom Pink
  '#FFA5B3', // Flamingo Pink
  '#FF85A2', // Rose Pink
  '#FFB3BA', // Baby Pink
];

function SpinWheel({ prizes, result, setResult, mode = LOTTERY_MODES.PRIZE_MODE, members = [], gift = null }) {
  const containerRef = useRef(null);
  const outletRef = useRef(null);
  const animationIdRef = useRef(null);
  const participantsRef = useRef([]);
  const isRunningRef = useRef(false);
  const { isMobile } = useDeviceDetect();
  
  // 预加载的头像图片缓存
  const [loadedImages, setLoadedImages] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [outletOpen, setOutletOpen] = useState(false);
  const [winnerAtOutlet, setWinnerAtOutlet] = useState(null);

  // 根据模式决定使用什么数据
  const wheelData = mode === LOTTERY_MODES.GIFT_MEMBER_MODE ? members : prizes;

  // 预加载头像图片
  useEffect(() => {
    if (mode === LOTTERY_MODES.GIFT_MEMBER_MODE && members.length > 0) {
      const imageCache = {};
      members.forEach((member, index) => {
        if (member.image) {
          const img = new Image();
          
          img.onload = () => {
            console.log(`头像加载成功: ${member.name}`);
            imageCache[index] = img;
            setLoadedImages(prev => ({ ...prev, [index]: img }));
          };
          
          img.onerror = (error) => {
            console.warn(`头像加载失败: ${member.name} - ${member.image}`, error);
          };
          
          console.log(`开始加载头像: ${member.name} - ${member.image}`);
          img.src = member.image;
        }
      });
    }
  }, [mode, members]);

  // 初始化参与者位置和速度
  useEffect(() => {
    if (wheelData.length > 0) {
      initializeParticipants();
    }
  }, [wheelData, loadedImages]);

  // 初始化参与者
  const initializeParticipants = () => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    
    // 计算头像大小范围
    const minAvatarSize = isMobile ? 50 : 60; // 最小头像尺寸
    const maxAvatarSize = isMobile ? 90 : 110; // 最大头像尺寸
    
    // 找到最大和最小的中奖倍率
    const probabilities = wheelData.map(item => item.probability || 1);
    const minProb = Math.min(...probabilities);
    const maxProb = Math.max(...probabilities);
    const probRange = maxProb - minProb || 1; // 避免除以0
    
    participantsRef.current = wheelData.map((item, index) => {
      // 根据中奖倍率计算头像大小
      const itemProb = item.probability || 1;
      const probRatio = probRange > 0 ? (itemProb - minProb) / probRange : 0.5; // 0-1之间的比例
      const avatarSize = minAvatarSize + (maxAvatarSize - minAvatarSize) * probRatio;
      
      return {
        id: index,
        name: item.name,
        image: item.image,
        hasAvatar: loadedImages[index],
        x: Math.random() * (containerRect.width - avatarSize),
        y: Math.random() * (containerRect.height - avatarSize - 50), // 为出奖口留出空间
        vx: (Math.random() - 0.5) * 2, // 初始速度较慢
        vy: (Math.random() - 0.5) * 2,
        size: avatarSize,
        originalSize: avatarSize, // 保存原始大小，用于重置
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 5,
        probability: itemProb // 保存倍率信息
      };
    });

    // 开始缓慢动画
    startSlowAnimation();
  };

  // 缓慢动画（平时状态）
  const startSlowAnimation = () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }

    const animate = () => {
      if (isRunningRef.current) return; // 如果正在抽奖则不执行缓慢动画
      
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      
      participantsRef.current.forEach(participant => {
        // 更新位置
        participant.x += participant.vx * 0.5; // 缓慢移动
        participant.y += participant.vy * 0.5;
        participant.rotation += participant.rotationSpeed * 0.3;

        // 边界碰撞检测（注意底部为出奖口区域）
        if (participant.x <= 0 || participant.x >= containerRect.width - participant.size) {
          participant.vx *= -1;
          participant.x = Math.max(0, Math.min(participant.x, containerRect.width - participant.size));
        }
        if (participant.y <= 0 || participant.y >= containerRect.height - participant.size - 50) {
          participant.vy *= -1;
          participant.y = Math.max(0, Math.min(participant.y, containerRect.height - participant.size - 50));
        }
      });

      // 重新渲染
      renderParticipants();
      
      if (!isRunningRef.current) {
        animationIdRef.current = requestAnimationFrame(animate);
      }
    };

    animate();
  };

  // 渲染参与者
  const renderParticipants = () => {
    const container = containerRef.current;
    if (!container) return;

    // 清空容器
    container.innerHTML = '';

    participantsRef.current.forEach(participant => {
      const element = document.createElement('div');
      element.style.position = 'absolute';
      element.style.left = `${participant.x}px`;
      element.style.top = `${participant.y}px`;
      element.style.width = `${participant.size}px`;
      element.style.height = `${participant.size}px`;
      element.style.borderRadius = '50%';
      
      // 根据倍率设置不同的边框效果
      const probability = participant.probability || 1;
      if (probability >= 3) {
        // 高倍率：金色边框 + 发光
        element.style.border = '4px solid #FFD700';
        element.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.6), 0 4px 12px rgba(255, 133, 162, 0.3)';
      } else if (probability >= 2) {
        // 中倍率：银色边框 + 淡发光
        element.style.border = '3px solid #C0C0C0';
        element.style.boxShadow = '0 0 10px rgba(192, 192, 192, 0.5), 0 4px 12px rgba(255, 133, 162, 0.3)';
      } else {
        // 普通倍率：白色边框
        element.style.border = '3px solid #fff';
        element.style.boxShadow = '0 4px 12px rgba(255, 133, 162, 0.3)';
      }
      
      element.style.transform = `rotate(${participant.rotation}deg)`;
      element.style.transition = isAnimating ? 'none' : 'transform 0.3s ease';
      element.style.cursor = 'pointer';
      element.style.zIndex = selectedWinner?.id === participant.id ? '10' : '1';

      if (participant.hasAvatar && participant.image) {
        // 显示头像
        element.style.backgroundImage = `url(${participant.image})`;
        element.style.backgroundSize = 'cover';
        element.style.backgroundPosition = 'center';
        element.style.backgroundColor = '#f0f0f0';
      } else {
        // 显示默认图标
        element.style.backgroundColor = themeColor;
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.fontSize = `${participant.size * 0.4}px`;
        element.innerHTML = '👤';
      }

      container.appendChild(element);
    });
  };

  // 开始抽奖动画
  const startLotteryAnimation = (callback) => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }

    setIsAnimating(true);
    isRunningRef.current = true;
    
    const duration = 4000; // 4秒动画
    const startTime = performance.now();
    
    // 增加速度进行剧烈跳动
    participantsRef.current.forEach(participant => {
      participant.vx = (Math.random() - 0.5) * 15;
      participant.vy = (Math.random() - 0.5) * 15;
      participant.rotationSpeed = (Math.random() - 0.5) * 20;
    });

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = elapsed / duration;
      
      if (progress >= 1) {
        // 动画结束
        setIsAnimating(false);
        isRunningRef.current = false;
        callback();
        return;
      }

      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      
      // 随着时间推移减速
      const speedMultiplier = 1 - (progress * 0.7); // 保留30%的速度到最后
      
      participantsRef.current.forEach(participant => {
        // 随机添加一些额外的震动
        const shake = (Math.random() - 0.5) * 3 * speedMultiplier;
        
        // 更新位置
        participant.x += (participant.vx + shake) * speedMultiplier;
        participant.y += (participant.vy + shake) * speedMultiplier;
        participant.rotation += participant.rotationSpeed * speedMultiplier;

        // 边界碰撞检测（注意底部为出奖口区域）
        if (participant.x <= 0 || participant.x >= containerRect.width - participant.size) {
          participant.vx *= -0.8; // 减少一些能量
          participant.x = Math.max(0, Math.min(participant.x, containerRect.width - participant.size));
        }
        if (participant.y <= 0 || participant.y >= containerRect.height - participant.size - 50) {
          participant.vy *= -0.8;
          participant.y = Math.max(0, Math.min(participant.y, containerRect.height - participant.size - 50));
        }

        // 随机改变方向
        if (Math.random() < 0.02 * speedMultiplier) {
          participant.vx += (Math.random() - 0.5) * 5;
          participant.vy += (Math.random() - 0.5) * 5;
        }
      });

      // 重新渲染
      renderParticipants();
      
      animationIdRef.current = requestAnimationFrame(animate);
    };

    animationIdRef.current = requestAnimationFrame(animate);
  };

  // 选择获奖者
  const selectWinner = () => {
    const chosen = getRandomItem();
    const winner = participantsRef.current.find(p => p.name === chosen.name);
    
    if (winner) {
      setSelectedWinner(winner);
      
      // 获奖者移动到出奖口
      setTimeout(() => {
        moveWinnerToOutlet(winner, chosen);
      }, 500);
    }
  };

  // 将获奖者移动到出奖口
  const moveWinnerToOutlet = (winner, chosen) => {
    const container = containerRef.current;
    if (!container) return;

    // 停止所有动画
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }

    // 淡化其他参与者
    participantsRef.current.forEach(participant => {
      if (participant.id !== winner.id) {
        participant.size = participant.originalSize * 0.6; // 按比例缩小其他人
      }
    });

    // 获奖者移动到出奖口位置（底部中央）
    const containerRect = container.getBoundingClientRect();
    const outletX = (containerRect.width - winner.size) / 2;
    const outletY = containerRect.height - winner.size - 25; // 在出奖口位置

    // 创建移动动画
    const startX = winner.x;
    const startY = winner.y;
    const startSize = winner.size;
    const targetSize = isMobile ? 100 : 120; // 增大获奖者尺寸
    
    let animProgress = 0;
    const moveAnimation = () => {
      animProgress += 0.03;
      
      if (animProgress >= 1) {
        // 移动完成，打开出奖口
        winner.x = outletX;
        winner.y = outletY;
        winner.size = targetSize;
        
        renderParticipants();
        openOutletAndDropWinner(winner, chosen);
      return;
    }

      // 缓动函数
      const easeProgress = 1 - Math.pow(1 - animProgress, 3);
      
      winner.x = startX + (outletX - startX) * easeProgress;
      winner.y = startY + (outletY - startY) * easeProgress;
      winner.size = startSize + (targetSize - startSize) * easeProgress;

      renderParticipants();
      
      // 添加发光效果
      const winnerElement = container.children[winner.id];
      if (winnerElement) {
        winnerElement.style.boxShadow = `0 0 ${20 + animProgress * 20}px #FFD700, 0 0 ${40 + animProgress * 40}px #FFA500`;
        winnerElement.style.border = '4px solid #FFD700';
      }

      requestAnimationFrame(moveAnimation);
    };

    moveAnimation();
  };

  // 打开出奖口并让获奖者掉落
  const openOutletAndDropWinner = (winner, chosen) => {
    // 打开出奖口
    setOutletOpen(true);
    
    setTimeout(() => {
      // 创建掉落的获奖者副本
      const winnerData = {
        ...chosen,
        hasAvatar: winner.hasAvatar,
        size: winner.size
      };
      setWinnerAtOutlet(winnerData);
      
      // 从容器中移除获奖者
      participantsRef.current = participantsRef.current.filter(p => p.id !== winner.id);
      renderParticipants();
      
      // 显示结果信息
      setTimeout(() => {
      setResult({ ...chosen, mode: mode, gift: gift });
      
      if (mode === LOTTERY_MODES.GIFT_MEMBER_MODE) {
        message.success(`🎉 ${chosen.name} 获得了 ${gift?.name || '礼品'}！`);
      } else {
        if (chosen.name === '未中奖') {
          message.info('很遗憾，未中奖~');
        } else {
          message.success(`恭喜中到：${chosen.name}`);
        }
      }
        
        // 重置状态
        setTimeout(() => {
          setSelectedWinner(null);
          setOutletOpen(false);
          setWinnerAtOutlet(null);
          initializeParticipants(); // 重新初始化所有参与者
        }, 4000);
      }, 1000);
    }, 800); // 出奖口打开后等待一下再掉落
  };

  // 获取随机项目
  function getRandomItem() {
    if (mode === LOTTERY_MODES.GIFT_MEMBER_MODE) {
      // 人员模式：按权重随机选择
      const total = members.reduce((acc, p) => acc + (p.probability || 1), 0);
      const rand = Math.random() * total;
      let sum = 0;
      for (const p of members) {
        sum += (p.probability || 1);
        if (rand <= sum) return p;
      }
      return members[0]; // 兜底
    } else {
      // 奖品模式：原有逻辑
      const total = prizes.reduce((acc, p) => acc + p.probability, 0);
      const rand = Math.random();
      let sum = 0;
      for (const p of prizes) {
        sum += p.probability;
        if (rand < sum) return p;
      }
      // 没命中 => 未中奖
      return { name: '未中奖', probability: 0, image: '' };
    }
  }

  // 开始抽奖
  const handleSpin = () => {
    if (isRunningRef.current) {
      message.warning('正在抽奖，请勿重复点击');
      return;
    }

    // 检查数据是否为空
    if (!wheelData || wheelData.length === 0) {
      message.warning(mode === LOTTERY_MODES.GIFT_MEMBER_MODE ? '请先添加参与人员' : '请先添加奖品');
      return;
    }

    // 清空上一次结果
    setResult({ name: '', image: '', mode: mode, gift: gift });
    setSelectedWinner(null);
    setOutletOpen(false);
    setWinnerAtOutlet(null);

    // 开始抽奖动画
    startLotteryAnimation(() => {
      selectWinner();
    });
  };

  // 获取按钮文字和图标
  const getButtonContent = () => {
    if (mode === LOTTERY_MODES.GIFT_MEMBER_MODE) {
      return {
        icon: <UserOutlined />,
        text: isRunningRef.current ? '抽选中...' : `抽选${gift?.name || '礼品'}获得者`
      };
    } else {
      return {
        icon: <GiftOutlined />,
        text: isRunningRef.current ? '抽奖中...' : '开始抽奖'
      };
    }
  };

  const buttonContent = getButtonContent();

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  return (
    <div style={{ 
      textAlign: 'center',
      padding: isMobile ? '20px' : '30px',
      maxWidth: isMobile ? '500px' : '900px',
      margin: '0 auto',
      background: `
        linear-gradient(145deg, rgba(255, 240, 245, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%),
        radial-gradient(circle at top left, rgba(255, 182, 193, 0.1) 0%, transparent 50%),
        radial-gradient(circle at bottom right, rgba(255, 105, 180, 0.1) 0%, transparent 50%)
      `,
      borderRadius: '24px', // 增大圆角
      boxShadow: '0 12px 40px rgba(255, 133, 162, 0.25), 0 0 20px rgba(255, 182, 193, 0.3)', // 增强阴影
      border: '3px solid rgba(255, 192, 203, 0.4)', // 稍微增强边框
      backdropFilter: 'blur(15px)', // 增强模糊效果
      minHeight: isMobile ? '600px' : '800px', // 设置最小高度
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 容器装饰元素 */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '20px',
        fontSize: '20px',
        color: 'rgba(255, 105, 180, 0.4)',
        animation: 'gentle-float 3s ease-in-out infinite',
        animationDelay: '0s',
        zIndex: 0,
        pointerEvents: 'none'
      }}>🎀</div>
      
      <div style={{
        position: 'absolute',
        bottom: '15px',
        left: '25px',
        fontSize: '18px',
        color: 'rgba(255, 182, 193, 0.5)',
        animation: 'gentle-float 4s ease-in-out infinite',
        animationDelay: '1.5s',
        zIndex: 0,
        pointerEvents: 'none'
      }}>🎈</div>

      <div style={{
        position: 'absolute',
        top: '50px',
        left: '15px',
        fontSize: '16px',
        color: 'rgba(255, 215, 0, 0.5)',
        animation: 'twinkle-small 2.5s ease-in-out infinite',
        animationDelay: '0.5s',
        zIndex: 0,
        pointerEvents: 'none'
      }}>⭐</div>

      <div style={{
        position: 'absolute',
        bottom: '40px',
        right: '15px',
        fontSize: '14px',
        color: 'rgba(255, 192, 203, 0.6)',
        animation: 'gentle-float 3.5s ease-in-out infinite',
        animationDelay: '2s',
        zIndex: 0,
        pointerEvents: 'none'
      }}>🌸</div>

      {/* 抽奖机标题 */}
      <div style={{
        fontSize: isMobile ? '28px' : '36px', // 增大标题字体
        fontWeight: 'bold',
        background: themeGradient,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textAlign: 'center',
        marginBottom: '15px', // 增加底部间距
        position: 'relative',
        zIndex: 1
      }}>
        🎰 扭蛋抽奖机 🎰
      </div>

      {/* 主要内容区域 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '30px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* 抽奖机容器 */}
        <div style={{ position: 'relative' }}>
          <div 
            ref={containerRef}
            style={{ 
              width: isMobile ? '450px' : '800px', // 进一步增大容器尺寸
              height: isMobile ? '350px' : '550px', // 进一步增大容器高度
              border: '8px solid #FFB6C1',
              borderRadius: '20px 20px 10px 10px', // 底部圆角小一点，为出奖口让路
              position: 'relative',
              background: `
                radial-gradient(circle at 20% 20%, rgba(255, 240, 245, 0.8) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(255, 182, 193, 0.6) 0%, transparent 50%),
                radial-gradient(circle at 40% 60%, rgba(255, 192, 203, 0.4) 0%, transparent 50%),
                linear-gradient(45deg, rgba(255, 182, 193, 0.15), rgba(255, 105, 180, 0.15))
              `,
              overflow: 'hidden',
              boxShadow: 'inset 0 0 30px rgba(255, 133, 162, 0.3), 0 0 20px rgba(255, 182, 193, 0.4)'
            }}
          >
            {/* 内部装饰性元素 */}
            {/* 浮动的小星星 */}
            <div style={{
              position: 'absolute',
              top: '10%',
              left: '15%',
              fontSize: '16px',
              color: 'rgba(255, 215, 0, 0.6)',
              animation: 'twinkle-small 2s ease-in-out infinite',
              animationDelay: '0s',
              zIndex: 0,
              pointerEvents: 'none'
            }}>✨</div>
            
            <div style={{
              position: 'absolute',
              top: '20%',
              right: '10%',
              fontSize: '14px',
              color: 'rgba(255, 215, 0, 0.5)',
              animation: 'twinkle-small 2.5s ease-in-out infinite',
              animationDelay: '0.8s',
              zIndex: 0,
              pointerEvents: 'none'
            }}>⭐</div>
            
            <div style={{
              position: 'absolute',
              bottom: '25%',
              left: '10%',
              fontSize: '12px',
              color: 'rgba(255, 215, 0, 0.7)',
              animation: 'twinkle-small 1.8s ease-in-out infinite',
              animationDelay: '1.5s',
              zIndex: 0,
              pointerEvents: 'none'
            }}>🌟</div>
            
            <div style={{
              position: 'absolute',
              bottom: '15%',
              right: '15%',
              fontSize: '18px',
              color: 'rgba(255, 215, 0, 0.4)',
              animation: 'twinkle-small 3s ease-in-out infinite',
              animationDelay: '2s',
              zIndex: 0,
              pointerEvents: 'none'
            }}>✨</div>

            {/* 浮动的小爱心 */}
            <div style={{
              position: 'absolute',
              top: '30%',
              left: '8%',
              fontSize: '12px',
              color: 'rgba(255, 105, 180, 0.5)',
              animation: 'gentle-float 4s ease-in-out infinite',
              animationDelay: '1s',
              zIndex: 0,
              pointerEvents: 'none'
            }}>💕</div>
            
            <div style={{
              position: 'absolute',
              top: '50%',
              right: '12%',
              fontSize: '10px',
              color: 'rgba(255, 182, 193, 0.6)',
              animation: 'gentle-float 3.5s ease-in-out infinite',
              animationDelay: '2.5s',
              zIndex: 0,
              pointerEvents: 'none'
            }}>💖</div>

            {/* 装饰性光圈 */}
            <div style={{
              position: 'absolute',
              top: '25%',
              right: '20%',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 192, 203, 0.3) 0%, transparent 70%)',
              animation: 'gentle-pulse 5s ease-in-out infinite',
              animationDelay: '0s',
              zIndex: 0,
              pointerEvents: 'none'
            }} />
            
            <div style={{
              position: 'absolute',
              bottom: '30%',
              left: '25%',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 105, 180, 0.25) 0%, transparent 70%)',
              animation: 'gentle-pulse 4s ease-in-out infinite',
              animationDelay: '2s',
              zIndex: 0,
              pointerEvents: 'none'
            }} />
          </div>
          
          {/* 出奖口 */}
          <div style={{
            position: 'absolute',
            bottom: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: isMobile ? '160px' : '220px', // 相应增大出奖口尺寸
            height: '45px', // 稍微增加出奖口高度
            background: '#FFB6C1',
            border: '8px solid #FFB6C1',
            borderTop: 'none',
            borderRadius: '0 0 20px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: 'inset 0 5px 15px rgba(255, 133, 162, 0.4)'
          }}>
            {/* 出奖口门 */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(180deg, #FF69B4, #FFB6C1)',
              borderRadius: '0 0 12px 12px',
              transform: outletOpen ? 'translateY(100%)' : 'translateY(0%)',
              transition: 'transform 0.8s ease-in-out',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#fff',
                fontSize: '13px', // 稍微增大字体
                fontWeight: 'bold'
              }}>
                出奖口
              </div>
            </div>
            
            {/* 出奖口内部指示 */}
          </div>
        </div>

        {/* 掉落的获奖者 */}
        {winnerAtOutlet && (
          <div style={{
            position: 'relative',
            marginTop: '10px',
            animation: 'dropAndBounce 2s ease-out'
          }}>
            <div style={{
              width: winnerAtOutlet.size || (isMobile ? '100px' : '120px'), // 增大掉落获奖者尺寸
              height: winnerAtOutlet.size || (isMobile ? '100px' : '120px'), // 增大掉落获奖者尺寸
              borderRadius: '50%',
              border: '5px solid #FFD700',
              boxShadow: '0 0 30px #FFD700, 0 0 60px #FFA500',
              backgroundImage: winnerAtOutlet.hasAvatar && winnerAtOutlet.image ? `url(${winnerAtOutlet.image})` : 'none',
              backgroundColor: winnerAtOutlet.hasAvatar ? '#f0f0f0' : themeColor,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: winnerAtOutlet.hasAvatar ? '0' : `${(winnerAtOutlet.size || 100) * 0.4}px`, // 更新字体尺寸计算
              animation: 'pulse 1s ease-in-out infinite'
            }}>
              {!winnerAtOutlet.hasAvatar && '👤'}
            </div>
          </div>
        )}

        {/* 开始按钮 */}
        <Button 
          type="primary" 
          size="large"
          onClick={handleSpin} 
          loading={isRunningRef.current}
          disabled={!wheelData || wheelData.length === 0}
          icon={buttonContent.icon}
          style={{ 
            height: isMobile ? '55px' : '70px', // 增大按钮高度
            fontSize: isMobile ? '18px' : '24px', // 增大字体
            fontWeight: 'bold',
            borderRadius: '35px', // 增大圆角
            background: themeGradient,
            border: 'none',
            minWidth: isMobile ? '240px' : '320px', // 增大最小宽度
            boxShadow: '0 10px 25px rgba(255, 133, 162, 0.4)', // 增强阴影
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px' // 增大图标与文字间距
          }}
        >
          {buttonContent.text}
        </Button>
        
        {/* 参与人数显示 */}
        <div style={{
          fontSize: isMobile ? '18px' : '20px', // 增大主要文字
          color: themeColor,
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          {mode === LOTTERY_MODES.GIFT_MEMBER_MODE 
            ? `参与人数: ${members.length}` 
            : `奖品数量: ${prizes.length}`
          }
          <br />
          <span style={{ fontSize: isMobile ? '15px' : '16px', color: '#666', fontWeight: 'normal' }}> {/* 增大说明文字 */}
            💫 头像大小 = 中奖倍率 | 🥇 ≥3倍 🥈 ≥2倍 🤍 普通
          </span>
        </div>
      </div>

      {/* 全局样式 */}
      <style jsx="true">{`
        @keyframes pulse {
          0% {
            transform: scale(1) rotate(0deg);
            box-shadow: 0 0 30px #FFD700, 0 0 60px #FFA500;
          }
          50% {
            transform: scale(1.1) rotate(180deg);
            box-shadow: 0 0 50px #FFD700, 0 0 100px #FFA500;
          }
          100% {
            transform: scale(1) rotate(360deg);
            box-shadow: 0 0 30px #FFD700, 0 0 60px #FFA500;
          }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
        
        @keyframes dropAndBounce {
          0% {
            transform: translateY(-100px);
            opacity: 0;
          }
          60% {
            transform: translateY(0px);
            opacity: 1;
          }
          75% {
            transform: translateY(-20px);
          }
          85% {
            transform: translateY(0px);
          }
          95% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
            opacity: 1;
          }
        }
        
        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0.5);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes twinkle-small {
          0% {
            transform: scale(1) rotate(0deg);
            opacity: 0.4;
          }
          25% {
            transform: scale(1.3) rotate(90deg);
            opacity: 0.8;
          }
          50% {
            transform: scale(0.8) rotate(180deg);
            opacity: 0.6;
          }
          75% {
            transform: scale(1.2) rotate(270deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(360deg);
            opacity: 0.4;
          }
        }

        @keyframes gentle-float {
          0% {
            transform: translateY(0px) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-8px) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translateY(0px) scale(1);
            opacity: 0.6;
          }
        }

        @keyframes gentle-pulse {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.6;
          }
          100% {
            transform: scale(1);
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}

export default SpinWheel;
