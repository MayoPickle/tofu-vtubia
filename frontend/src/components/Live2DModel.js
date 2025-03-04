import React, { useEffect } from 'react';
import { loadLive2DScripts, initLive2DModel } from './live2dLoader';
import { useDeviceDetect } from '../utils/deviceDetector';

const Live2DModel = () => {
  const { isMobile } = useDeviceDetect();

  useEffect(() => {
    loadLive2DScripts().then(() => initLive2DModel());
  }, []);

  const containerStyle = {
    position: 'fixed',
    right: 0,
    bottom: 0,
    width: isMobile ? '50%' : '25%',  // 在移动设备上使用更大的宽度
    height: isMobile ? '50%' : '25%',  // 在移动设备上使用更大的高度
    zIndex: 1000,
    pointerEvents: 'none'
  };

  return <div id="live2d-container" style={containerStyle} />;
};

export default Live2DModel;
