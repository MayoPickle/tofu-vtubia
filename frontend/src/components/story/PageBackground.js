import React from 'react';

// 装饰性背景元素组件
const PageBackground = ({ isMobile }) => {
  return (
    <>
      <div style={{
        position: 'absolute',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,192,203,0.15) 0%, rgba(255,192,203,0) 70%)',
        top: '10%',
        right: isMobile ? '0' : '-50px',
        zIndex: -1,
        pointerEvents: 'none',
        overflow: 'hidden'
      }} />
      
      <div style={{
        position: 'absolute',
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,105,180,0.1) 0%, rgba(255,105,180,0) 70%)',
        bottom: '10%',
        left: isMobile ? '0' : '-30px',
        zIndex: -1,
        pointerEvents: 'none',
        overflow: 'hidden'
      }} />
    </>
  );
};

export default PageBackground; 