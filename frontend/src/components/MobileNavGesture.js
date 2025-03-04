import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 移动端触摸滑动手势组件
const MobileNavGesture = () => {
  const navigate = useNavigate();
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // 最小滑动距离，单位为像素
  const minSwipeDistance = 50;

  // 处理触摸开始事件
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  // 处理触摸移动事件
  const onTouchMove = (e) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  // 处理触摸结束事件
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);
    
    if (isHorizontalSwipe && Math.abs(distanceX) > minSwipeDistance) {
      if (distanceX > 0) {
        // 从右向左滑 - 前进
        handleNavigateNext();
      } else {
        // 从左向右滑 - 后退
        handleNavigateBack();
      }
    }
  };

  // 页面路由列表，按导航顺序排列
  const routes = ['/intro', '/songs', '/lottery', '/observatory'];
  
  // 处理向前导航
  const handleNavigateNext = () => {
    const currentPath = window.location.pathname;
    const currentIndex = routes.indexOf(currentPath);
    if (currentIndex !== -1 && currentIndex < routes.length - 1) {
      navigate(routes[currentIndex + 1]);
    }
  };

  // 处理向后导航
  const handleNavigateBack = () => {
    const currentPath = window.location.pathname;
    const currentIndex = routes.indexOf(currentPath);
    if (currentIndex > 0) {
      navigate(routes[currentIndex - 1]);
    }
  };

  // 添加触摸事件监听器
  useEffect(() => {
    const content = document.querySelector('main') || document.body;
    content.addEventListener('touchstart', onTouchStart);
    content.addEventListener('touchmove', onTouchMove);
    content.addEventListener('touchend', onTouchEnd);

    return () => {
      content.removeEventListener('touchstart', onTouchStart);
      content.removeEventListener('touchmove', onTouchMove);
      content.removeEventListener('touchend', onTouchEnd);
    };
  }, [touchStart, touchEnd]);

  // 此组件不渲染任何UI元素
  return null;
};

export default MobileNavGesture; 