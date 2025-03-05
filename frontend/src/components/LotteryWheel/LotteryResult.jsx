// LotteryResult.jsx
import React, { useRef } from 'react';
import { Empty, Card, Carousel, Button } from 'antd';
import { TrophyOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';

function LotteryResult({ result, prizes = [] }) {
  const hasResult = result && result.name;
  // 使用useRef而不是useState来存储Carousel引用，避免无限渲染循环
  const carouselRef = useRef(null);

  // 处理前一张/后一张
  const handlePrev = () => carouselRef.current && carouselRef.current.prev();
  const handleNext = () => carouselRef.current && carouselRef.current.next();

  return (
    <div style={{ 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      textAlign: 'center'
    }}>
      <h3 style={{ 
        fontSize: '18px', 
        color: '#333',
        textAlign: 'center',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}>
        <TrophyOutlined style={{ color: '#ff85c0' }} />
        {hasResult ? '中奖结果' : '奖品展示'}
      </h3>

      {hasResult ? (
        <Card 
          style={{ 
            textAlign: 'center',
            width: '100%',
            border: result.name === '未中奖' ? '1px solid #f0f0f0' : '1px solid #ff85c0',
            backgroundColor: result.name === '未中奖' ? '#fafafa' : '#fff0f6',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
        >
          <h4 style={{ 
            fontSize: '20px', 
            color: result.name === '未中奖' ? '#999' : '#ff85c0',
            margin: '0 0 16px 0',
            textAlign: 'center'
          }}>
            {result.name}
          </h4>
          
          {result.image ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img
                src={result.image}
                alt={result.name}
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '200px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
            </div>
          ) : (
            <div style={{ color: '#999', padding: '20px 0', textAlign: 'center' }}>暂无奖品图片</div>
          )}
        </Card>
      ) : prizes && prizes.length > 0 ? (
        <div style={{ width: '100%' }}>
          <div style={{ position: 'relative' }}>
            <Carousel 
              ref={carouselRef}
              dots={true}
              dotPosition="bottom"
              autoplay
              autoplaySpeed={3000}
            >
              {prizes.map((prize, index) => (
                <div key={index}>
                  <Card 
                    style={{ 
                      margin: '0 auto',
                      maxWidth: '90%',
                      border: '1px solid #ff85c0',
                      backgroundColor: '#fff',
                      height: '280px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}
                  >
                    <h4 style={{ 
                      fontSize: '18px', 
                      color: '#ff85c0',
                      margin: '0 0 16px 0',
                      textAlign: 'center'
                    }}>
                      {prize.name || '未命名奖品'}
                    </h4>
                    
                    {prize.image ? (
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '180px'
                      }}>
                        <img
                          src={prize.image}
                          alt={prize.name}
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '180px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                        />
                      </div>
                    ) : (
                      <div style={{ 
                        color: '#999', 
                        padding: '20px 0', 
                        textAlign: 'center',
                        height: '180px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        暂无奖品图片
                      </div>
                    )}
                    
                    <div style={{ 
                      marginTop: '10px',
                      textAlign: 'center',
                      fontSize: '14px',
                      color: '#666'
                    }}>
                      概率: {Math.round(prize.probability * 100)}%
                    </div>
                  </Card>
                </div>
              ))}
            </Carousel>
            
            {/* 左右翻页按钮 */}
            <Button 
              icon={<LeftOutlined />} 
              style={{
                position: 'absolute',
                top: '50%',
                left: '0',
                transform: 'translateY(-50%)',
                zIndex: 2,
                opacity: 0.7,
                color: '#ff85c0',
                borderColor: '#ff85c0'
              }}
              type="default"
              shape="circle"
              size="small"
              onClick={handlePrev}
            />
            
            <Button 
              icon={<RightOutlined />} 
              style={{
                position: 'absolute',
                top: '50%',
                right: '0',
                transform: 'translateY(-50%)',
                zIndex: 2,
                opacity: 0.7,
                color: '#ff85c0',
                borderColor: '#ff85c0'
              }}
              type="default"
              shape="circle"
              size="small"
              onClick={handleNext}
            />
          </div>
        </div>
      ) : (
        <Empty 
          description="暂无奖品" 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
          style={{ margin: '20px 0' }}
        />
      )}
    </div>
  );
}

export default LotteryResult;
