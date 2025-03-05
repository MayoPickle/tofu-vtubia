import React, { useEffect, useState } from 'react';
import { loadLive2DScripts, initLive2DModel, destroyLive2DModel } from './live2dLoader';
import { useDeviceDetect } from '../utils/deviceDetector';

// 用于控制Live2D模型是否显示的本地存储键名
const LIVE2D_ENABLED_KEY = 'live2d_enabled';

const Live2DModel = () => {
  const { isMobile } = useDeviceDetect();
  // 从localStorage读取用户偏好设置，默认所有设备都启用
  const [isEnabled, setIsEnabled] = useState(() => {
    const savedPreference = localStorage.getItem(LIVE2D_ENABLED_KEY);
    // 如果有保存的偏好设置，使用保存的值；否则默认为true（启用）
    return savedPreference !== null 
      ? savedPreference === 'true' 
      : true; // 修改：默认所有设备都启用
  });

  // 切换Live2D模型的显示状态
  const toggleLive2D = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    localStorage.setItem(LIVE2D_ENABLED_KEY, newState.toString());
    
    if (newState) {
      // 启用时加载模型
      loadModel();
    } else {
      // 禁用时销毁模型
      destroyLive2DModel();
    }
  };

  // 加载Live2D模型的函数
  const loadModel = () => {
    loadLive2DScripts().then(() => {
      initLive2DModel();
    }).catch(error => {
      console.error('加载Live2D模型失败:', error);
    });
  };

  useEffect(() => {
    // 性能优化：只在启用状态下加载模型
    if (isEnabled) {
      loadModel();
    }
    
    // 添加按键快捷方式来切换Live2D模型
    const handleKeyDown = (e) => {
      // Alt+L 组合键切换Live2D模型
      if (e.altKey && e.key === 'l') {
        toggleLive2D();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    // 清理函数
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      destroyLive2DModel();
    };
  }, [isEnabled]);

  const containerStyle = {
    position: 'fixed',
    right: 0,
    bottom: 0,
    width: isMobile ? '50%' : '25%',
    height: isMobile ? '50%' : '25%',
    zIndex: 1000,
    pointerEvents: 'none',
    // 当禁用时隐藏容器
    display: isEnabled ? 'block' : 'none'
  };

  // 添加一个开关按钮
  const toggleButtonStyle = {
    position: 'fixed',
    right: '10px',
    bottom: '10px',
    zIndex: 1001,
    background: isEnabled ? 'rgba(255, 133, 162, 0.7)' : 'rgba(200, 200, 200, 0.7)',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
    pointerEvents: 'auto'
  };

  return (
    <>
      <div id="live2d-container" style={containerStyle} />
      <button 
        onClick={toggleLive2D} 
        style={toggleButtonStyle}
        title={isEnabled ? '点击关闭Live2D模型 (Alt+L)' : '点击显示Live2D模型 (Alt+L)'}
      >
        {isEnabled ? '😊' : '😴'}
      </button>
    </>
  );
};

export default Live2DModel;
