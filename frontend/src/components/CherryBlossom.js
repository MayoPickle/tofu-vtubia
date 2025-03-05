import React, { useEffect, useRef } from 'react';
import '../styles/CherryBlossom.css';

function CherryBlossom() {
  const containerRef = useRef(null);
  
  useEffect(() => {
    const container = containerRef.current;
    const maxPetals = 10; // 将最大数量从20减少到10
    const petalsArray = [];
    
    // 创建樱花花瓣
    const createPetal = () => {
      const petal = document.createElement('div');
      petal.className = 'petal';
      
      // 随机样式
      const size = 6 + Math.random() * 6; // 进一步减小尺寸范围
      const rotation = Math.random() * 360;
      const xPos = Math.random() * 100; // 横向位置百分比
      const fallDuration = 12 + Math.random() * 15; // 增加下落时间，使其更慢
      const swayDuration = 4 + Math.random() * 5; // 增加摇摆时间
      const delay = Math.random() * 8; // 增加延迟随机性
      
      // 风向随机性
      const windDirection = Math.random() > 0.5 ? 1 : -1;
      
      // 设置花瓣样式
      petal.style.width = `${size}px`;
      petal.style.height = `${size}px`;
      petal.style.transform = `rotate(${rotation}deg)`;
      petal.style.left = `${xPos}%`;
      petal.style.animationDuration = `${fallDuration}s, ${swayDuration}s`;
      petal.style.animationDelay = `${delay}s`;
      petal.style.setProperty('--wind-direction', windDirection);
      
      // 随机选择花瓣类型
      const petalType = Math.floor(Math.random() * 3) + 1;
      petal.classList.add(`petal-type-${petalType}`);
      
      // 添加轻微的缩放变化
      const scale = 0.6 + Math.random() * 0.3; // 整体缩小
      petal.style.transform += ` scale(${scale})`;
      
      container.appendChild(petal);
      petalsArray.push(petal);
      
      // 花瓣飘过后移除
      setTimeout(() => {
        if (petal.parentElement === container) {
          container.removeChild(petal);
          const index = petalsArray.indexOf(petal);
          if (index !== -1) {
            petalsArray.splice(index, 1);
          }
        }
      }, (fallDuration + delay) * 1000);
    };
    
    // 初始创建一批花瓣，减少初始数量
    for (let i = 0; i < maxPetals / 5; i++) { // 从maxPetals/4减少到maxPetals/5
      setTimeout(createPetal, i * 500); // 增加间隔时间从300到500
    }
    
    // 定期创建新的花瓣，降低创建频率
    const intervalId = setInterval(() => {
      if (petalsArray.length < maxPetals) {
        createPetal();
      }
    }, 2000); // 从1000毫秒增加到2000毫秒
    
    // 当窗口滚动时添加花瓣的概率降低
    const handleScroll = () => {
      // 只有30%的几率在滚动时创建花瓣
      if (petalsArray.length < maxPetals && Math.random() < 0.3) {
        createPetal();
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('scroll', handleScroll);
      petalsArray.forEach(petal => {
        if (petal.parentElement === container) {
          container.removeChild(petal);
        }
      });
    };
  }, []);
  
  return (
    <div ref={containerRef} className="cherry-blossom-container" />
  );
}

export default CherryBlossom; 