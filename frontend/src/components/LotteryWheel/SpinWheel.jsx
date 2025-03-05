// SpinWheel.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Button, message } from 'antd';
import { useDeviceDetect } from '../../utils/deviceDetector';

function SpinWheel({ prizes, result, setResult }) {
  const canvasRef = useRef(null);
  const isSpinningRef = useRef(false);
  const animationIdRef = useRef(null);
  const { isMobile } = useDeviceDetect();

  // 当前转盘角度
  const [rotationAngle, setRotationAngle] = useState(0);

  // ===========================
  // 1) 绘制转盘
  // ===========================
  useEffect(() => {
    drawWheel(rotationAngle);
  }, [prizes, rotationAngle]);

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
    const radius = Math.min(centerX, centerY) - 10;

    ctx.clearRect(0, 0, width, height);

    const segments = calcSegments(prizes);

    segments.forEach((seg, i) => {
      const startAngle = seg.startAngle + angle;
      const endAngle = seg.endAngle + angle;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.fillStyle = randomColor(i);
      ctx.fill();

      // 扇区文字
      const mid = (startAngle + endAngle) / 2;
      const textX = centerX + Math.cos(mid) * radius * 0.65;
      const textY = centerY + Math.sin(mid) * radius * 0.65;
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '14px sans-serif';
      ctx.fillText(seg.name, textX, textY);
    });

    // 指针
    ctx.save();
    ctx.fillStyle = '#ff85c0';
    ctx.beginPath();
    ctx.moveTo(centerX - 10, centerY - radius - 10);
    ctx.lineTo(centerX + 10, centerY - radius - 10);
    ctx.lineTo(centerX, centerY - radius + 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function calcSegments(prizeList) {
    const total = prizeList.reduce((acc, p) => acc + p.probability, 0);
    const loseProb = total < 1 ? 1 - total : 0;
    let arr = [...prizeList];
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
    const chosen = getRandomPrize();
    const finalAngle = calcTargetAngle(chosen);

    // 清空上一次结果
    setResult({ name: '', image: '' });
    isSpinningRef.current = true;

    animateSpinTo(finalAngle, () => {
      isSpinningRef.current = false;
      setResult(chosen);
      if (chosen.name === '未中奖') {
        message.info('很遗憾，未中奖~');
      } else {
        message.success(`恭喜中到：${chosen.name}`);
      }
    });
  };

  function getRandomPrize() {
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

  function calcTargetAngle(chosenPrize) {
    const segs = calcSegments(prizes);
    const seg = segs.find((s) => s.name === chosenPrize.name);
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

  // ===========================
  // 3) 渲染
  // ===========================
  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%'
    }}>
      <Button 
        type="primary" 
        onClick={handleSpin} 
        style={{ 
          marginBottom: isMobile ? 20 : 24,
          width: isMobile ? '100%' : '180px',
          height: isMobile ? '44px' : '40px',
          fontSize: isMobile ? '16px' : '15px',
          borderRadius: '20px',
          background: '#ff85c0',
          borderColor: '#ff85c0',
          boxShadow: '0 4px 10px rgba(255, 133, 192, 0.3)'
        }}
        size="large"
        disabled={isSpinningRef.current}
      >
        {isSpinningRef.current ? '抽奖中...' : '开始抽奖'}
      </Button>
      
      <div style={{
        position: 'relative',
        width: 'fit-content',
        margin: '0 auto'
      }}>
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          style={{ 
            borderRadius: '50%',
            maxWidth: '100%',
            height: 'auto',
            boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
            transition: 'transform 0.3s ease',
            transform: isSpinningRef.current ? 'scale(1.02)' : 'scale(1)'
          }}
        />
        
        {/* 转盘中心装饰 */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          backgroundColor: '#fff',
          border: '3px solid #ff85c0',
          boxShadow: '0 0 0 3px rgba(255, 133, 192, 0.2)',
          zIndex: 2
        }} />
      </div>
    </div>
  );
}

export default SpinWheel;
