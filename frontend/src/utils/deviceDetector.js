import { useEffect, useState } from 'react';

// 判断设备类型的工具函数
export const isMobile = () => {
  return window.innerWidth <= 768;
};

// 自定义Hook，用于在组件中获取设备类型与屏幕尺寸变化
export const useDeviceDetect = () => {
  const [deviceType, setDeviceType] = useState({
    isMobile: isMobile(),
    width: window.innerWidth,
  });

  useEffect(() => {
    const handleResize = () => {
      setDeviceType({
        isMobile: isMobile(),
        width: window.innerWidth,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceType;
}; 