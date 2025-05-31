// SpinWheel.jsx
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
  const canvasRef = useRef(null);
  const isSpinningRef = useRef(false);
  const animationIdRef = useRef(null);
  const { isMobile } = useDeviceDetect();

  // 当前转盘角度
  const [rotationAngle, setRotationAngle] = useState(0);
  
  // 预加载的头像图片缓存
  const [loadedImages, setLoadedImages] = useState({});

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
          
          // 直接使用代理URL，无需额外处理
          console.log(`开始加载头像: ${member.name} - ${member.image}`);
          img.src = member.image;
        }
      });
    }
  }, [mode, members]);

  // 截断长名字
  const truncateName = (name, maxLength = 6) => {
    if (!name) return '未知';
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 1) + '...';
  };

  // ===========================
  // 1) 绘制转盘
  // ===========================
  useEffect(() => {
    drawWheel(rotationAngle);
  }, [wheelData, rotationAngle, mode, loadedImages]);

  // 组件卸载时，如果有动画要清理
  useEffect(() => {
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  function drawWheel(angle) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 30; // 增大边距

    ctx.clearRect(0, 0, width, height);

    // 绘制外圈装饰
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 15, 0, Math.PI * 2);
    ctx.strokeStyle = themeColor;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // 绘制装饰性圆点
    for (let i = 0; i < 32; i++) { // 增加圆点数量
      const dotAngle = (i * Math.PI * 2) / 32;
      const dotX = centerX + (radius + 22) * Math.cos(dotAngle);
      const dotY = centerY + (radius + 22) * Math.sin(dotAngle);
      
      ctx.beginPath();
      ctx.arc(dotX, dotY, 4, 0, Math.PI * 2); // 增大圆点尺寸
      ctx.fillStyle = themeColor;
      ctx.fill();
    }
    ctx.restore();

    const segments = calcSegments(wheelData);

    // 绘制扇形和内容
    segments.forEach((seg, i) => {
      const startAngle = seg.startAngle + angle;
      const endAngle = seg.endAngle + angle;
      const midAngle = (startAngle + endAngle) / 2;

      // 绘制扇形
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.fillStyle = palette[i % palette.length];
      ctx.fill();
      
      // 添加扇形边框
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      // 人员模式：优先显示头像
      if (mode === LOTTERY_MODES.GIFT_MEMBER_MODE) {
        const memberIndex = members.findIndex(m => m.name === seg.name);
        const hasAvatar = seg.image && loadedImages[memberIndex];
        
        if (hasAvatar) {
          // 显示头像
          ctx.save();
          const avatarRadius = 35; // 增大头像尺寸
          const avatarX = centerX + Math.cos(midAngle) * (radius * 0.5);
          const avatarY = centerY + Math.sin(midAngle) * (radius * 0.5);
          
          // 绘制圆形头像
          ctx.beginPath();
          ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
          ctx.clip();
          
          // 绘制头像图片
          ctx.drawImage(
            loadedImages[memberIndex], 
            avatarX - avatarRadius, 
            avatarY - avatarRadius, 
            avatarRadius * 2, 
            avatarRadius * 2
          );
          ctx.restore();
          
          // 头像边框
          ctx.save();
          ctx.beginPath();
          ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 4;
          ctx.stroke();
          ctx.restore();

          // 在头像下方显示缩短的名字
          ctx.save();
          const textRadius = radius * 0.8;
          const textX = centerX + Math.cos(midAngle) * textRadius;
          const textY = centerY + Math.sin(midAngle) * textRadius;
          
          ctx.translate(textX, textY);
          ctx.rotate(midAngle + Math.PI / 2);
          
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 16px sans-serif'; // 增大字体
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = 3;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          
          const shortName = truncateName(seg.name, 4);
          ctx.fillText(shortName, 0, 0);
          ctx.restore();
        } else {
          // 没有头像时显示用户图标和名字
          ctx.save();
          
          // 绘制用户图标背景
          const iconRadius = 28; // 增大图标尺寸
          const iconX = centerX + Math.cos(midAngle) * (radius * 0.5);
          const iconY = centerY + Math.sin(midAngle) * (radius * 0.5);
          
          ctx.beginPath();
          ctx.arc(iconX, iconY, iconRadius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fill();
          ctx.strokeStyle = themeColor;
          ctx.lineWidth = 3;
          ctx.stroke();
          
          // 绘制用户图标
          ctx.fillStyle = themeColor;
          ctx.font = 'bold 22px sans-serif'; // 增大图标字体
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('👤', iconX, iconY);
          ctx.restore();

          // 显示名字
          ctx.save();
          const textRadius = radius * 0.75;
          const textX = centerX + Math.cos(midAngle) * textRadius;
          const textY = centerY + Math.sin(midAngle) * textRadius;
          
          ctx.translate(textX, textY);
          ctx.rotate(midAngle + Math.PI / 2);
          
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 18px sans-serif'; // 增大字体
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          
          const shortName = truncateName(seg.name, 5);
          ctx.fillText(shortName, 0, 0);
          ctx.restore();
        }
      } else {
        // 奖品模式：显示奖品名字
        ctx.save();
        const textRadius = radius * 0.65;
        const textX = centerX + Math.cos(midAngle) * textRadius;
        const textY = centerY + Math.sin(midAngle) * textRadius;
        
        ctx.translate(textX, textY);
        ctx.rotate(midAngle + Math.PI / 2);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px sans-serif'; // 增大字体
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillText(seg.name, 0, 0);
        ctx.restore();
      }
    });

    // 绘制中心装饰
    ctx.save();
    // 外圈
    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, Math.PI * 2); // 增大中心圆
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = themeColor;
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // 内圈
    ctx.beginPath();
    ctx.arc(centerX, centerY, 28, 0, Math.PI * 2); // 增大内圆
    ctx.fillStyle = themeColor;
    ctx.fill();
    
    // 中心图标
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px sans-serif'; // 增大中心图标字体
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (mode === LOTTERY_MODES.GIFT_MEMBER_MODE) {
      ctx.fillText('👤', centerX, centerY);
    } else {
      ctx.fillText('🎁', centerX, centerY);
    }
    ctx.restore();

    // 指针
    ctx.save();
    ctx.fillStyle = themeColor;
    ctx.beginPath();
    ctx.moveTo(centerX - 20, centerY - radius - 20); // 增大指针尺寸
    ctx.lineTo(centerX + 20, centerY - radius - 20);
    ctx.lineTo(centerX, centerY - radius + 8);
    ctx.closePath();
    ctx.fill();
    
    // 指针阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    
    ctx.restore();
  }

  function calcSegments(dataList) {
    // 对于人员模式，所有人员权重相等；对于奖品模式，使用原有的概率逻辑
    if (mode === LOTTERY_MODES.GIFT_MEMBER_MODE) {
      // 人员模式：使用权重
      const total = dataList.reduce((acc, p) => acc + (p.probability || 1), 0);
      let start = 0;
      return dataList.map((item) => {
        const size = ((item.probability || 1) / total) * 2 * Math.PI;
        const seg = {
          ...item,
          startAngle: start,
          endAngle: start + size,
        };
        start += size;
        return seg;
      });
    } else {
      // 奖品模式：原有逻辑
      const total = dataList.reduce((acc, p) => acc + p.probability, 0);
      const loseProb = total < 1 ? 1 - total : 0;
      let arr = [...dataList];
      if (loseProb > 0) {
        arr.push({ name: '未中奖', probability: loseProb, image: '' });
      }

      let start = 0;
      return arr.map((item) => {
        const size = item.probability * 2 * Math.PI;
        const seg = {
          ...item,
          startAngle: start,
          endAngle: start + size,
        };
        start += size;
        return seg;
      });
    }
  }

  function randomColor(i) {
    const palette = [
      '#FFD54F', '#4FC3F7', '#AED581',
      '#BA68C8', '#FF8A65', '#90A4AE',
      '#F06292', '#FFF176',
    ];
    return palette[i % palette.length];
  }

  // ===========================
  // 2) 开始抽奖
  // ===========================
  const handleSpin = () => {
    if (isSpinningRef.current) {
      message.warning('正在抽奖，请勿重复点击');
      return;
    }

    // 检查数据是否为空
    if (!wheelData || wheelData.length === 0) {
      message.warning(mode === LOTTERY_MODES.GIFT_MEMBER_MODE ? '请先添加参与人员' : '请先添加奖品');
      return;
    }

    const chosen = getRandomItem();
    const finalAngle = calcTargetAngle(chosen);

    // 清空上一次结果
    setResult({ name: '', image: '', mode: mode, gift: gift });
    isSpinningRef.current = true;

    animateSpinTo(finalAngle, () => {
      isSpinningRef.current = false;
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
    });
  };

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

  function calcTargetAngle(chosenItem) {
    const segs = calcSegments(wheelData);
    const seg = segs.find((s) => s.name === chosenItem.name);
    if (!seg) return rotationAngle;

    const midAngle = (seg.startAngle + seg.endAngle) / 2;
    const current = rotationAngle % (2 * Math.PI);

    // 至少转2圈 => 4π
    const revolve = 4 * Math.PI;
    let finalWanted = -Math.PI / 2 - midAngle;

    let neededDelta = finalWanted - current;
    // 保证结果在 0~2π 范围内
    neededDelta = ((neededDelta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    return rotationAngle + revolve + neededDelta;
  }

  function animateSpinTo(target, onFinish) {
    const startAngle = rotationAngle;
    const startTime = performance.now();
    const duration = 4000;

    function tick(now) {
      const elapsed = now - startTime;
      const progress = elapsed / duration;
      if (progress >= 1) {
        setRotationAngle(target);
        onFinish && onFinish();
      } else {
        const eased = easeOutCubic(progress);
        const current = startAngle + (target - startAngle) * eased;
        setRotationAngle(current);
        animationIdRef.current = requestAnimationFrame(tick);
      }
    }
    animationIdRef.current = requestAnimationFrame(tick);
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  // 获取按钮文字和图标
  const getButtonContent = () => {
    if (mode === LOTTERY_MODES.GIFT_MEMBER_MODE) {
      return {
        icon: <UserOutlined />,
        text: isSpinningRef.current ? '抽选中...' : `抽选${gift?.name || '礼品'}获得者`
      };
    } else {
      return {
        icon: <GiftOutlined />,
        text: isSpinningRef.current ? '抽奖中...' : '开始抽奖'
      };
    }
  };

  const buttonContent = getButtonContent();

  // ===========================
  // 3) 渲染
  // ===========================
  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      position: 'relative'
    }}>
      <Button 
        type="primary" 
        onClick={handleSpin} 
        icon={buttonContent.icon}
        style={{ 
          marginBottom: isMobile ? 20 : 24,
          width: isMobile ? '100%' : 'auto',
          minWidth: '200px',
          height: isMobile ? '44px' : '40px',
          fontSize: isMobile ? '16px' : '15px',
          borderRadius: '20px',
          background: themeGradient,
          border: 'none',
          boxShadow: '0 4px 15px rgba(255, 133, 192, 0.3)',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transform: isSpinningRef.current ? 'scale(0.98)' : 'scale(1)',
          opacity: isSpinningRef.current ? 0.8 : 1
        }}
        size="large"
        disabled={isSpinningRef.current}
      >
        {buttonContent.text}
      </Button>
      
      <div style={{
        position: 'relative',
        width: 'fit-content',
        margin: '0 auto'
      }}>
        <canvas
          ref={canvasRef}
          width={700}
          height={700}
          style={{ 
            borderRadius: '50%',
            maxWidth: '100%',
            height: 'auto',
            boxShadow: '0 8px 24px rgba(255, 133, 162, 0.2)',
            transition: 'all 0.3s ease',
            transform: isSpinningRef.current ? 'scale(1.02)' : 'scale(1)',
            animation: isSpinningRef.current ? 'glow 1.5s ease-in-out infinite alternate' : 'none'
          }}
        />
      </div>

      {/* 添加CSS动画 */}
      <style jsx="true">{`
        @keyframes glow {
          from {
            box-shadow: 0 8px 24px rgba(255, 133, 162, 0.2);
          }
          to {
            box-shadow: 0 8px 36px rgba(255, 133, 162, 0.4);
          }
        }
      `}</style>
    </div>
  );
}

export default SpinWheel;
