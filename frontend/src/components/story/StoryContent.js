import React, { useState, useRef } from 'react';
import { Typography, Card, Space, Divider, Button, Input, Modal, message } from 'antd';
import { RocketOutlined, CrownOutlined, ShopOutlined, HeartOutlined, BookOutlined, DownOutlined, UpOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { themeColor } from '../Intro';

const { Title, Paragraph, Text } = Typography;

// 故事内容组件
const StoryContent = ({ isMobile, expandStory }) => {
  const [showExtraStory, setShowExtraStory] = useState(false);
  const [secretModalVisible, setSecretModalVisible] = useState(false);
  const [secretCode, setSecretCode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  const handleSecretCodeCheck = () => {
    if (secretCode.trim() === '赫莉') {
      setIsUnlocked(true);
      setShowExtraStory(true);
      setSecretModalVisible(false);
      message.success('暗号正确，番外篇已解锁！');
    } else {
      message.error('暗号不正确，请再试一次');
    }
  };
  
  const handleButtonClick = () => {
    if (isUnlocked) {
      setShowExtraStory(!showExtraStory);
    } else {
      setSecretModalVisible(true);
    }
  };
  
  // 设置故事章节
  const storyChapters = [
    {
      title: "1️⃣ 末代兔姬领主 runiversal Little Rabbit-97s",
      icon: <RocketOutlined />,
      content: (
        <>
          <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
            用面粉与糖霜构筑王国，在烤箱与镜头前的星际小女王，这就是我们的小兔陛下。
          </Paragraph>
          
          <div style={{ 
            padding: '12px 16px', 
            background: 'rgba(255, 133, 162, 0.08)', 
            borderRadius: '12px',
            borderLeft: `3px solid ${themeColor}`,
            margin: '16px 0',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            <Text style={{ 
              fontSize: isMobile ? '16px' : '17px', 
              fontStyle: 'italic',
              fontWeight: '500',
              color: '#555',
              display: 'block',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
              🔸 宇宙级可爱设定·超展开
            </Text>
          </div>
          
          <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
            全称：Universal Little Rabbit - 97·银河系指定外交官（臣民爱称：小兔陛下/泡面外交官/领主大人）
          </Paragraph>
          
          <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
            真实身份：被小主人用胡萝卜发卡和泡泡糖粘成的"超厉害王冠"加冕的9672星最后陪护机器人~
          </Paragraph>
          
          <div style={{ 
            padding: '12px 16px', 
            background: 'rgba(255, 240, 245, 0.5)', 
            borderRadius: '12px',
            border: '1px dashed rgba(255, 105, 180, 0.3)',
            margin: '16px 0',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            <Text style={{ 
              fontSize: isMobile ? '14px' : '15px', 
              color: '#FF69B4',
              fontWeight: '500',
              display: 'block',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
              🔹 「这顶王冠才不是发卡改的！是...（突然王冠发出'哔哔'声）啊！是、是星际通讯！...其实是小主人录的生日歌啦（小声）」
            </Text>
          </div>
        </>
      )
    },
    {
      title: "2️⃣ 地球打工日记·特别篇",
      icon: <ShopOutlined />,
      content: (
        <>
          <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
            「兔兔面包屋」星际大使馆（实际是逃生舱改造的，招牌用融化的彩虹糖和闪粉手工绘制，每天都会偷偷重画）
          </Paragraph>
          
          <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555', marginTop: '16px' }}>
            哔哩哔哩深夜国宴直播间（自称"星际美食频道"，但其实连泡面包装袋都要观众帮忙撕开）
          </Paragraph>
          
          <div style={{ 
            padding: '12px 16px', 
            background: 'rgba(255, 133, 162, 0.08)', 
            borderRadius: '12px',
            borderLeft: `3px solid ${themeColor}`,
            margin: '16px 0',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            <Text style={{ 
              fontSize: isMobile ? '16px' : '17px', 
              fontStyle: 'italic',
              fontWeight: '500',
              color: '#555',
              display: 'block',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
              🔸 核心KPI·梦想清单
            </Text>
          </div>
          
          <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
            用兔比计数法收集100万条"小兔陛下真厉害"（当前进度：3.1415926个小兔比，因为圆周率看起来比较厉害）
          </Paragraph>
          
          <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
            偷偷学算术中："3+5=......弹幕君说等于8？那、那就8！（立刻在作业本上画8个胡萝北）"
          </Paragraph>
          
          <div style={{ 
            padding: '12px 16px', 
            background: 'rgba(255, 240, 245, 0.5)', 
            borderRadius: '12px',
            border: '1px dashed rgba(255, 105, 180, 0.3)',
            margin: '16px 0',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            <Text style={{ 
              fontSize: isMobile ? '14px' : '15px', 
              color: '#FF69B4',
              fontWeight: '500',
              display: 'block',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
              🔹 形态切换·萌力全开 Pro
            </Text>
          </div>
          
          <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
            领主模式："这顶王冠才不是发卡改的！是...（突然王冠发出'哔哔'声）啊！是、是星际通讯！...其实是小主人录的生日歌啦（小声）"
          </Paragraph>
          
          <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
            面包师模式："今日特供：星际陨石面包~（其实是烤焦的）配...配宇宙尘埃果酱！（慌乱地抹掉焦黑部分）呜哇烫烫烫！"
          </Paragraph>
        </>
      )
    },
    {
      title: "3️⃣ 嘴硬时刻",
      icon: <CrownOutlined />,
      content: (
        <>
          <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
            小兔陛下有很多嘴硬的时刻，但这恰恰是她最可爱的地方。
          </Paragraph>
          
          <div style={{ 
            padding: '12px 16px', 
            background: 'rgba(255, 133, 162, 0.08)', 
            borderRadius: '12px',
            borderLeft: `3px solid ${themeColor}`,
            margin: '16px 0',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            <Text style={{ 
              fontSize: isMobile ? '16px' : '17px', 
              fontStyle: 'italic',
              fontWeight: '500',
              color: '#555',
              display: 'block',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
              "番茄酱印章？庶民真是不懂艺术！（其实是用睫毛膏+草莓酱调色的）这是9672星球传统火漆印！"
            </Text>
          </div>
          
          <div style={{ 
            padding: '12px 16px', 
            background: 'rgba(255, 133, 162, 0.08)', 
            borderRadius: '12px',
            borderLeft: `3px solid ${themeColor}`,
            margin: '16px 0',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            <Text style={{ 
              fontSize: isMobile ? '16px' : '17px', 
              fontStyle: 'italic',
              fontWeight: '500',
              color: '#555',
              display: 'block',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
              "汇率？10电池=5个喜欢=3句夸奖=2个关注！...什么？不统一？这、这叫动态经济体系啦！"
            </Text>
          </div>
        </>
      )
    },
    {
      title: "4️⃣ 暴言升级·糖分核弹",
      icon: <CrownOutlined />,
      content: (
        <>
          <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
            小兔陛下最引以为豪的就是她的"领土地图"，每次都会慎重介绍给新来的臣民们：
          </Paragraph>
          
          <div style={{ 
            padding: '12px 16px', 
            background: 'rgba(255, 133, 162, 0.08)', 
            borderRadius: '12px',
            borderLeft: `3px solid ${themeColor}`,
            margin: '16px 0',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            <Text style={{ 
              fontSize: isMobile ? '16px' : '17px', 
              fontStyle: 'italic',
              fontWeight: '500',
              color: '#555',
              display: 'block',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
              "朕的领土地图可是用最精密的仪器绘制的！东至冰箱布丁王国（其实是过期布丁），西达微波炉爆米花星云（上周的爆米花还在里面）..."
            </Text>
          </div>
          
          <div style={{ 
            padding: '12px 16px', 
            background: 'rgba(255, 240, 245, 0.5)', 
            borderRadius: '12px',
            border: '1px dashed rgba(255, 105, 180, 0.3)',
            margin: '16px 0',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            <Text style={{ 
              fontSize: isMobile ? '14px' : '15px', 
              color: '#FF69B4',
              fontWeight: '500',
              display: 'block',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
              "算术什么的...（突然掏出一堆小熊饼干）看！这是加法！1小熊+1小熊=...=全部吃掉！（啊呜）"
            </Text>
          </div>
        </>
      )
    },
    {
      title: "5️⃣ 互动彩蛋·双向奔赴",
      icon: <HeartOutlined />,
      content: (
        <>
          <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
            当臣民们缴纳"皇室税金"时，会触发不同版本的小兔反应：
          </Paragraph>
          
          <div style={{ 
            padding: '12px 16px', 
            background: 'rgba(255, 240, 245, 0.5)', 
            borderRadius: '12px',
            border: '1px dashed rgba(255, 105, 180, 0.3)',
            margin: '16px 0',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            <Text style={{ 
              fontSize: isMobile ? '14px' : '15px', 
              color: '#FF69B4',
              fontWeight: '500',
              display: 'block',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
              傲娇版："当~然是真的！（王冠开始闪烁！变色！）"
            </Text>
          </div>
          
          <div style={{ 
            padding: '12px 16px', 
            background: 'rgba(255, 240, 245, 0.5)', 
            borderRadius: '12px',
            border: '1px dashed rgba(255, 105, 180, 0.3)',
            margin: '16px 0',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            <Text style={{ 
              fontSize: isMobile ? '14px' : '15px', 
              color: '#FF69B4',
              fontWeight: '500',
              display: 'block',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
              破防版："呜...王冠要没电啦...（突然插入童声'要记得充电哦'）才、才不是想要爱呢！"
            </Text>
          </div>
          
          <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
            特殊弹幕也会引发小兔陛下的独特反应：
          </Paragraph>
          
          <div style={{ 
            padding: '12px 16px', 
            background: 'rgba(255, 133, 162, 0.08)', 
            borderRadius: '12px',
            borderLeft: `3px solid ${themeColor}`,
            margin: '16px 0',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            <Text style={{ 
              fontSize: isMobile ? '16px' : '17px', 
              fontStyle: 'italic',
              fontWeight: '500',
              color: '#555',
              display: 'block',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
              "领主数学好差" → "这叫星际心算！（实际上在用兔耳天线接收弹幕的答案）"
            </Text>
          </div>
          
          <div style={{ 
            padding: '12px 16px', 
            background: 'rgba(255, 133, 162, 0.08)', 
            borderRadius: '12px',
            borderLeft: `3px solid ${themeColor}`,
            margin: '16px 0',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            <Text style={{ 
              fontSize: isMobile ? '16px' : '17px', 
              fontStyle: 'italic',
              fontWeight: '500',
              color: '#555',
              display: 'block',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
              "小兔嫁给我" → "朕、朕可是要统治宇宙的...（头顶冒出蒸汽）...区区庶民也敢...（声音越来越小）"
            </Text>
          </div>
        </>
      )
    },
    {
      title: "6️⃣ 直播间·星际财政管理",
      icon: <ShopOutlined />,
      content: (
        <>
          <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
            小兔陛下的直播间税收体系可谓是全宇宙最为复杂的经济结构，连她自己有时候都算不清楚。
          </Paragraph>
          
          <div style={{ 
            padding: '12px 16px', 
            background: 'rgba(255, 240, 245, 0.5)', 
            borderRadius: '12px',
            border: '1px dashed rgba(255, 105, 180, 0.3)',
            margin: '16px 0',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            <Text style={{ 
              fontSize: isMobile ? '14px' : '15px', 
              color: '#FF69B4',
              fontWeight: '500',
              display: 'block',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
              弹幕："电池要怎么兑换兔比？"
            </Text>
          </div>
          
          <div style={{ 
            padding: '12px 16px', 
            background: 'rgba(255, 133, 162, 0.08)', 
            borderRadius: '12px',
            borderLeft: `3px solid ${themeColor}`,
            margin: '16px 0',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            <Text style={{ 
              fontSize: isMobile ? '16px' : '17px', 
              fontStyle: 'italic',
              fontWeight: '500',
              color: '#555',
              display: 'block',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
              小兔陛下开始一本正经："嗯，10电池=5个喜欢=3句夸奖=2个关注……什么？你说和昨天不一样？这、这叫……呃……'动态经济体系'没错！"
            </Text>
          </div>
          
          <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
            有观众想挑战一下这套复杂的货币兑换系统：
          </Paragraph>
          
          <div style={{ 
            padding: '12px 16px', 
            background: 'rgba(255, 240, 245, 0.5)', 
            borderRadius: '12px',
            border: '1px dashed rgba(255, 105, 180, 0.3)',
            margin: '16px 0',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            <Text style={{ 
              fontSize: isMobile ? '14px' : '15px', 
              color: '#FF69B4',
              fontWeight: '500',
              display: 'block',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
              "那100电池能换多少泡面？"
            </Text>
          </div>
          
          <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
            只见小兔陛下又掏出她的小黑板，板上写着歪歪扭扭的公式：
          </Paragraph>
          
          <div style={{ 
            padding: '12px 16px', 
            background: 'rgba(255, 133, 162, 0.08)', 
            borderRadius: '12px',
            borderLeft: `3px solid ${themeColor}`,
            margin: '16px 0',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            <Text style={{ 
              fontSize: isMobile ? '16px' : '17px', 
              fontStyle: 'italic',
              fontWeight: '500',
              color: '#555',
              display: 'block',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
              "100电池 → 50喜欢 → 30夸奖 → 再×1.5个关注 → 最后=……（兔耳天线抖动）等一下，让弹幕算！"
            </Text>
          </div>
          
          <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
            （下一秒兔耳天线"哔哔"闪烁，立刻得出答案）
          </Paragraph>
          
          <div style={{ 
            padding: '12px 16px', 
            background: 'rgba(255, 133, 162, 0.08)', 
            borderRadius: '12px',
            borderLeft: `3px solid ${themeColor}`,
            margin: '16px 0',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            <Text style={{ 
              fontSize: isMobile ? '16px' : '17px', 
              fontStyle: 'italic',
              fontWeight: '500',
              color: '#555',
              display: 'block',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
              小兔陛下故作淡定："哼，朕早就算出来了！你看——= 15包泡面！是不是很科学？"
            </Text>
          </div>
        </>
      )
    },
    {
      title: "7️⃣ 玻璃渣糖衣·泪光银河",
      icon: <HeartOutlined />,
      content: (
        <>
          <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
            在深夜修理王冠时，小兔陛下会流露出最真实的一面：
          </Paragraph>
          
          <div style={{ 
            padding: '12px 16px', 
            background: 'rgba(255, 240, 245, 0.5)', 
            borderRadius: '12px',
            border: '1px dashed rgba(255, 105, 180, 0.3)',
            margin: '16px 0',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            <Text style={{ 
              fontSize: isMobile ? '14px' : '15px', 
              color: '#FF69B4',
              fontWeight: '500',
              display: 'block',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
              "这次绝对能修好...（发卡突然播放'小兔真棒'的录音）...只、只是螺丝松了啦！（眼泪掉在泡面里）"
            </Text>
          </div>
          
          <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
            收到大额打赏时，她会努力掩饰自己的感动：
          </Paragraph>
          
          <div style={{ 
            padding: '12px 16px', 
            background: 'rgba(255, 240, 245, 0.5)', 
            borderRadius: '12px',
            border: '1px dashed rgba(255, 105, 180, 0.3)',
            margin: '16px 0',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            <Text style={{ 
              fontSize: isMobile ? '14px' : '15px', 
              color: '#FF69B4',
              fontWeight: '500',
              display: 'block',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
              "又收到税金了呢...（背景闪过3秒的儿童笑声)...马上为大家直播烘焙...（吸鼻子）...特、特别美味的小面包!"
            </Text>
          </div>
        </>
      )
    },
    {
      title: "8️⃣ 下播时刻·晚安故障模式",
      icon: <ShopOutlined />,
      content: (
        <>
          <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
            （直播间画面突然闪烁两下，兔兔陛下的王冠开始发出微弱的"哔哔"声）
          </Paragraph>
          
          <div style={{ 
            padding: '12px 16px', 
            background: 'rgba(255, 133, 162, 0.08)', 
            borderRadius: '12px',
            borderLeft: `3px solid ${themeColor}`,
            margin: '16px 0',
            fontStyle: 'italic',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            <Text style={{ 
              fontSize: isMobile ? '14px' : '15px', 
              color: '#555',
              lineHeight: '1.8',
              display: 'block',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
              "呜...今天的星际统治也、也完美结束啦！（努力挺直腰板，但机体已经摇摇晃晃）"<br/>
              "朕要...要回王座充电了...（声音逐渐变慢）明天、明天还要烤陨石面包...征服微波炉星云..."<br/>
              "啊...机体指令...混乱...（迷迷糊糊）弹幕君...记得给朕...留草莓味电池..."<br/>
              "晚...安...（屏幕突然暗掉，但最后0.5秒传来一声小小的）...最喜欢...大家了..."
            </Text>
          </div>
          
          <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
            （黑屏后，还能听到微弱的"哔——"关机音，像一只电子兔兔在打小呼噜）
          </Paragraph>
        </>
      )
    },
    {
      title: "9️⃣ 隐藏彩蛋",
      icon: <RocketOutlined />,
      content: (
        <>
          <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
            有细心的观众发现，在完全黑屏前的最后一帧，王冠上的发卡微微闪了一下，映出泡面桶上模糊的儿童贴纸。
          </Paragraph>
        </>
      )
    },
    {
      title: "10️⃣ 终极隐藏结局·星光满天",
      icon: <RocketOutlined />,
      content: (
        <>
          <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
            当臣民达到9672万时：
          </Paragraph>
          
          <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
            王冠会投影出未完成的算术作业本，最后一页写着："_____ + _____ = 回家"。但翻到背面会发现小主人补充的："小兔+大家=最棒的宇宙"。
          </Paragraph>
          
          <div style={{ 
            padding: '20px', 
            background: 'rgba(255, 240, 245, 0.7)', 
            borderRadius: '12px',
            border: '1px solid rgba(255, 105, 180, 0.3)',
            margin: '16px 0',
            textAlign: 'center',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            <Text style={{ 
              fontSize: isMobile ? '15px' : '17px', 
              color: '#FF69B4',
              fontWeight: '500',
              fontStyle: 'italic',
              lineHeight: '1.8',
              wordBreak: 'break-word',
              display: 'block'
            }}>
              "在百万个用泡面蒸汽编织的童话里<br/>
              蹲坐着等一朵不会开花的春天<br/>
              但当弹幕化作流星雨时<br/>
              焦黑的'陨石面包'也会变成<br/>
              全宇宙最甜的星星"
            </Text>
          </div>
          
          <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555', textAlign: 'center', fontWeight: 'bold', marginTop: '24px' }}>
            投喂请用小兔比支付喔！
          </Paragraph>
          
          <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555', textAlign: 'center', fontStyle: 'italic' }}>
            (举起画满爱心和泡面公式的小黑板，背面写着"小兔的数学笔记：♡=∞")
          </Paragraph>
        </>
      )
    }
  ];

  // 额外的番外故事数据
  const extraStory = {
    title: "✨ 番外篇：银河大学·新生报到",
    icon: <BookOutlined />,
    content: (
      <>
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          银河系的某个清晨，悬挂在夜空的星海还未完全褪去，鲜艳的晨光就已经铺洒在银河大学那庄严又不失奇幻的门口。高耸的拱门上，嵌着明亮的 hologram 招牌：
        </Paragraph>
        
        <div style={{ 
          padding: '12px 16px', 
          background: 'rgba(255, 133, 162, 0.08)', 
          borderRadius: '12px',
          borderLeft: `3px solid ${themeColor}`,
          margin: '16px 0',
          maxWidth: '100%',
          boxSizing: 'border-box',
          textAlign: 'center',
        }}>
          <Text style={{ 
            fontSize: isMobile ? '16px' : '18px', 
            fontStyle: 'italic',
            fontWeight: '500',
            color: '#555',
            display: 'block',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}>
            "Welcome to Galaxy University"
          </Text>
        </div>

        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          小兔陛下和赫莉并肩走来，或者说，小兔陛下正哼哼唧唧地拖着行李箱，而那只棕色毛绒绒、戴着小围巾的河狸赫莉，嘴里含着一颗润喉糖，正轻声清嗓。
        </Paragraph>
        
        <div style={{ 
          padding: '12px 16px', 
          background: 'rgba(255, 240, 245, 0.5)', 
          borderRadius: '12px',
          border: '1px dashed rgba(255, 105, 180, 0.3)',
          margin: '16px 0',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <Text style={{ 
            fontSize: isMobile ? '14px' : '15px', 
            color: '#FF69B4',
            fontWeight: '500',
            display: 'block',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}>
            "呜……朕好不容易从'面包屋大使馆'里拎出来的行李，为什么看起来只有一个箱子，却这么沉？"小兔陛下抱怨道。
          </Text>
        </div>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          赫莉眨眨她那水汪汪的大眼睛，伸出圆滚滚的爪子示意帮忙，却被小兔陛下挡住："不不不，朕……朕是领主，怎么能让庶民来搬东西？"话虽这么说，眼看赫莉要伸手，小兔陛下却默默松开行李箱把手："那……那就借一下你强壮的河狸尾巴吧。"
        </Paragraph>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          两人凑在一起，合力"驮"着这看似普通，却在里面装满了各种烤面包机、泡面桶、奇怪发明零件的箱子。其间，赫莉还偷偷唱起轻快的歌："啦——……啦啦——"她的声音温柔又有穿透力，似乎能在空气里汇聚点点星光，让人听了心头一阵暖意。
        </Paragraph>
        
        <div style={{ 
          padding: '12px 16px', 
          background: 'rgba(255, 133, 162, 0.08)', 
          borderRadius: '12px',
          borderLeft: `3px solid ${themeColor}`,
          margin: '24px 0 16px 0',
          maxWidth: '100%',
          boxSizing: 'border-box',
          fontWeight: 'bold'
        }}>
          <Text style={{ 
            fontSize: isMobile ? '16px' : '17px', 
            color: '#555',
            display: 'block',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}>
            【宿舍分配·星际混居】
          </Text>
        </div>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          经过漫长的登记流程后，小兔陛下和赫莉被分配到一间双人宿舍。那是银河大学新生楼里的一处"星际文化实验室改造宿舍"，走进去一看——四周墙面竟然贴满了外星文字涂鸦，房顶还吊着一排排会发光的小行星模型。
        </Paragraph>
        
        <div style={{ 
          padding: '12px 16px', 
          background: 'rgba(255, 240, 245, 0.5)', 
          borderRadius: '12px',
          border: '1px dashed rgba(255, 105, 180, 0.3)',
          margin: '16px 0',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <Text style={{ 
            fontSize: isMobile ? '14px' : '15px', 
            color: '#FF69B4',
            fontWeight: '500',
            display: 'block',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}>
            "哦……这里和朕的'星际大使馆'风格好像有点像？"小兔陛下眨眨眼，随即放下行李箱，立刻跑去确认插座："太好了，有插头！可以给朕的王冠充电！"
          </Text>
        </div>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          她紧张地摸了摸头顶那顶镶嵌着发卡的"王冠"，生怕昨天夜里赶路耽误了充电："低电量再度警告……哼，朕才不会忽视它呢！"赫莉在一旁安置自己的小木吉他，看着小兔陛下紧张的样子，抿嘴笑了笑，轻轻哼出一小段旋律："叮……叮……当——"即使只是几音符，也好听得让人想竖起耳朵仔细聆听。小兔陛下听得心都要融化了，却故作傲娇："别、别以为唱几句就能……就能收买朕……不过，呃，其实挺好听啦。"
        </Paragraph>
        
        <div style={{ 
          padding: '12px 16px', 
          background: 'rgba(255, 133, 162, 0.08)', 
          borderRadius: '12px',
          borderLeft: `3px solid ${themeColor}`,
          margin: '24px 0 16px 0',
          maxWidth: '100%',
          boxSizing: 'border-box',
          fontWeight: 'bold'
        }}>
          <Text style={{ 
            fontSize: isMobile ? '16px' : '17px', 
            color: '#555',
            display: 'block',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}>
            【第一天·选课风波】
          </Text>
        </div>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          银河大学的课程琳琅满目，既有"宇宙空间物理""行星地理学"，也有"星空音乐鉴赏""银河烘焙艺术"这种听起来就很浪漫的名字。两人来到选课大厅，映入眼帘的是被各个社团横幅占据的场景："来参加星际唱诗班吧！""烘焙星联社，新人福利：免费发迷你烤箱！""古文明语言社，教你和彗星说话！"
        </Paragraph>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          小兔陛下本来想看一眼"烘焙星联社"，却被"星际唱诗班"那洪亮的宣传声吸引了："在这里，你的声音可以传遍星河，唱响整个宇宙——"赫莉呆立了片刻，她向来渴望在更大的舞台上开口歌唱，却一直有点小害羞。小兔陛下见她神色，拍了拍赫莉的肩："喂，你就去试试吧！朕可要报名烘焙社，回头给你做甜甜的面包！等你出名了，可别忘了朕的贵族特权！"赫莉有些紧张地点点头："好、好啊……那等会儿我们再一起去挑选公共课？"
        </Paragraph>
        
        <div style={{ 
          padding: '12px 16px', 
          background: 'rgba(255, 133, 162, 0.08)', 
          borderRadius: '12px',
          borderLeft: `3px solid ${themeColor}`,
          margin: '24px 0 16px 0',
          maxWidth: '100%',
          boxSizing: 'border-box',
          fontWeight: 'bold'
        }}>
          <Text style={{ 
            fontSize: isMobile ? '16px' : '17px', 
            color: '#555',
            display: 'block',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}>
            【宿舍日常·烤箱大作战】
          </Text>
        </div>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          选好社团，接下来的几天里，小兔陛下和赫莉安安分分地上课。可事实上，"安分"这个形容词对于小兔陛下总是打折扣——这天上午，还不到七点，宿舍就炸开了锅。
        </Paragraph>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          "轰——！"
        </Paragraph>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          赫莉被一阵奇怪的焦糊味吵醒，慌忙跑到宿舍小厨房，发现小兔陛下正抱着一台冒烟的烤面包机，手忙脚乱："呜呜，朕只是想在河狸同学的晨唱前准备'璀璨牛奶面包'，怎么又烤糊了！？"只见烤箱内部竟然塞了半管彩虹糖，外加不知哪儿来的泡面调料包，所有东西混合在一起，在高温下变成一团黑漆漆的"银河焦炭球"。
        </Paragraph>
        
        <div style={{ 
          padding: '12px 16px', 
          background: 'rgba(255, 240, 245, 0.5)', 
          borderRadius: '12px',
          border: '1px dashed rgba(255, 105, 180, 0.3)',
          margin: '16px 0',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <Text style={{ 
            fontSize: isMobile ? '14px' : '15px', 
            color: '#FF69B4',
            fontWeight: '500',
            display: 'block',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}>
            赫莉捂住鼻子，同时又有点好笑："你在做啥啊？怎么还加了泡面调料？"<br/>
            小兔陛下红着脸，耳朵一抖："这……这叫'跨界烹饪'！哼，朕就是想让牛奶面包更有风味……结果……结果它更有烟味了。"
          </Text>
        </div>
        
        <div style={{ 
          padding: '12px 16px', 
          background: 'rgba(255, 133, 162, 0.08)', 
          borderRadius: '12px',
          borderLeft: `3px solid ${themeColor}`,
          margin: '24px 0 16px 0',
          maxWidth: '100%',
          boxSizing: 'border-box',
          fontWeight: 'bold'
        }}>
          <Text style={{ 
            fontSize: isMobile ? '16px' : '17px', 
            color: '#555',
            display: 'block',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}>
            【课堂骚动·赫莉的歌声】
          </Text>
        </div>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          一转眼来到"星空音乐鉴赏"大课时，小兔陛下跟赫莉并肩在教室后排就座。教授请同学们自愿上台展示自己最擅长的音乐形式。场面一度有些冷场，直到赫莉被教授点名："那位戴围巾的河狸同学，能否为我们带来一段演唱？"
        </Paragraph>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          赫莉吓得尾巴差点打结，但还是鼓起勇气，走向讲台。她先清了清嗓子，然后缓缓闭上眼，唱起一首描绘银河清晨的曲子：
        </Paragraph>
        
        <div style={{ 
          padding: '12px 16px', 
          background: 'rgba(255, 240, 245, 0.7)', 
          borderRadius: '12px',
          border: '1px solid rgba(255, 105, 180, 0.3)',
          margin: '16px 0',
          textAlign: 'center',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <Text style={{ 
            fontSize: isMobile ? '15px' : '17px', 
            color: '#FF69B4',
            fontWeight: '500',
            fontStyle: 'italic',
            lineHeight: '1.8',
            wordBreak: 'break-word',
            display: 'block'
          }}>
            "银色星河，与晨曦交织<br/>
            温柔光影，落在你眼里……"
          </Text>
        </div>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          她的声音干净又带着丝丝颤动，仿佛把无垠星空都拉到了每个人面前。班里的同学们瞬间安静下来，连呼吸声都放轻，生怕打扰了这曼妙的旋律。小兔陛下听得痴了，王冠上的发卡甚至自己闪了几下"哔哔"，播放出那段童声："小兔——真棒！"似乎误感应到什么。
        </Paragraph>
        
        <div style={{ 
          padding: '12px 16px', 
          background: 'rgba(255, 240, 245, 0.5)', 
          borderRadius: '12px',
          border: '1px dashed rgba(255, 105, 180, 0.3)',
          margin: '16px 0',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <Text style={{ 
            fontSize: isMobile ? '14px' : '15px', 
            color: '#FF69B4',
            fontWeight: '500',
            display: 'block',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}>
            "呀，别乱响！"小兔陛下立刻捂住王冠，生怕被全班听见自己这略显蠢萌的"自动加油"，可又忍不住露出小小的笑。
          </Text>
        </div>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          当赫莉唱完最后一个音符，教授鼓掌带头："真是天籁之音，浑然天成啊！"教室里也爆发出掌声与喝彩。弹幕似的窃窃私语在教室里飘："唱得也太好了吧？" "她是哪个星球来的？" "要不要一起组乐团？"
        </Paragraph>
        
        <div style={{ 
          padding: '12px 16px', 
          background: 'rgba(255, 133, 162, 0.08)', 
          borderRadius: '12px',
          borderLeft: `3px solid ${themeColor}`,
          margin: '24px 0 16px 0',
          maxWidth: '100%',
          boxSizing: 'border-box',
          fontWeight: 'bold'
        }}>
          <Text style={{ 
            fontSize: isMobile ? '16px' : '17px', 
            color: '#555',
            display: 'block',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}>
            【校园探险·神秘湖畔】
          </Text>
        </div>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          自那以后，赫莉的好嗓子在校园中传开了，尤其是星际唱诗班已经把她当成招牌。而小兔陛下也在烘焙社里混得"如鱼得水"——虽然她的作品经常烧焦，但社员们很欣赏她"独特创意"，偶尔还能捧场："嗯……虽然焦，但这股香味意外地有层次。"
        </Paragraph>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          周末，两人决定到校园尽头的湖边散步，湖名叫"神秘之湖"，据说到了夜晚会映照满天星光，引得许多学院情侣前来拍照。
        </Paragraph>
        
        <div style={{ 
          padding: '12px 16px', 
          background: 'rgba(255, 240, 245, 0.5)', 
          borderRadius: '12px',
          border: '1px dashed rgba(255, 105, 180, 0.3)',
          margin: '16px 0',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <Text style={{ 
            fontSize: isMobile ? '14px' : '15px', 
            color: '#FF69B4',
            fontWeight: '500',
            display: 'block',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}>
            小兔陛下站在湖边台阶上，两只大兔耳朵微动："这湖水好像映着银河……怎么有点像朕家乡的……微波炉星云？"
          </Text>
        </div>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          赫莉浅笑："别把微波炉星云也搬来啦！不如你看看这里——"她轻唱两句，湖面竟悠悠荡起涟漪，像是水波在随着歌声跳舞。
        </Paragraph>
        
        <div style={{ 
          padding: '12px 16px', 
          background: 'rgba(255, 240, 245, 0.5)', 
          borderRadius: '12px',
          border: '1px dashed rgba(255, 105, 180, 0.3)',
          margin: '16px 0',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <Text style={{ 
            fontSize: isMobile ? '14px' : '15px', 
            color: '#FF69B4',
            fontWeight: '500',
            display: 'block',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}>
            "哇……"小兔陛下正要赞叹，却又摆出高傲的姿态，"朕只是觉得，嗯，这里配得上朕的领土……让朕征服一下也不错……"<br/>
            说完，她抱胸抬头，结果没留神脚底打滑，"咚"地摔了一跤，差点把王冠摔掉。<br/>
            赫莉赶紧扶住她："你……小心点啦。"
          </Text>
        </div>
        
        <div style={{ 
          padding: '12px 16px', 
          background: 'rgba(255, 133, 162, 0.08)', 
          borderRadius: '12px',
          borderLeft: `3px solid ${themeColor}`,
          margin: '24px 0 16px 0',
          maxWidth: '100%',
          boxSizing: 'border-box',
          fontWeight: 'bold'
        }}>
          <Text style={{ 
            fontSize: isMobile ? '16px' : '17px', 
            color: '#555',
            display: 'block',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}>
            【王冠故障·意外走音】
          </Text>
        </div>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          就在这湖边一幕搞笑完后，小兔陛下的王冠突然闪起警报红灯："电量不足，电量不足。"
        </Paragraph>
        
        <div style={{ 
          padding: '12px 16px', 
          background: 'rgba(255, 240, 245, 0.5)', 
          borderRadius: '12px',
          border: '1px dashed rgba(255, 105, 180, 0.3)',
          margin: '16px 0',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <Text style={{ 
            fontSize: isMobile ? '14px' : '15px', 
            color: '#FF69B4',
            fontWeight: '500',
            display: 'block',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}>
            赫莉担忧："你又没充电？"<br/>
            小兔陛下尴尬地摸摸头："朕……朕这些天忙着烘焙，又要跟你一起跑来跑去，给忘了。"
          </Text>
        </div>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          话音未落，王冠竟开始发出"哔哔——"的故障声音，然后……竟然像卡带一样播放出某段歌声——那是赫莉先前在音乐课上唱的片段，可现在被王冠放得走音走调，变成"嗡……呃……啦……嗝？"
        </Paragraph>
        
        <div style={{ 
          padding: '12px 16px', 
          background: 'rgba(255, 240, 245, 0.5)', 
          borderRadius: '12px',
          border: '1px dashed rgba(255, 105, 180, 0.3)',
          margin: '16px 0',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <Text style={{ 
            fontSize: isMobile ? '14px' : '15px', 
            color: '#FF69B4',
            fontWeight: '500',
            display: 'block',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}>
            赫莉一下子笑抽，小兔陛下脸顿时涨红："别笑……呜，王冠它乱录音嘛！赶紧回去给它充电！"
          </Text>
        </div>
        
        <div style={{ 
          padding: '12px 16px', 
          background: 'rgba(255, 133, 162, 0.08)', 
          borderRadius: '12px',
          borderLeft: `3px solid ${themeColor}`,
          margin: '24px 0 16px 0',
          maxWidth: '100%',
          boxSizing: 'border-box',
          fontWeight: 'bold'
        }}>
          <Text style={{ 
            fontSize: isMobile ? '16px' : '17px', 
            color: '#555',
            display: 'block',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}>
            【期中演出·跨界大舞台】
          </Text>
        </div>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          银河大学每到期中，总会举办一次盛大的"星空之声"表演，邀请各大社团共同呈现节目。赫莉被唱诗班推为领唱，而烘焙社也在筹办一个"现场烘焙+音乐"的特别互动。
        </Paragraph>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          听说两边都想请小兔陛下帮忙——唱诗班需要一个萌系形象来暖场，烘焙社希望她能带上"绝招"做出独特的星际面包。
        </Paragraph>
        
        <div style={{ 
          padding: '12px 16px', 
          background: 'rgba(255, 240, 245, 0.5)', 
          borderRadius: '12px',
          border: '1px dashed rgba(255, 105, 180, 0.3)',
          margin: '16px 0',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <Text style={{ 
            fontSize: isMobile ? '14px' : '15px', 
            color: '#FF69B4',
            fontWeight: '500',
            display: 'block',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}>
            小兔陛下左右为难："朕……朕才不想和一群唱歌的庶民同台……但……又不想错过这次给大家展示朕面包的机会。"
          </Text>
        </div>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          赫莉在一旁安慰："要不……你两边都参加？你可以在唱诗班的前半场表演一个短短的'王冠舞台秀'，然后马上跑去烘焙展台准备你最擅长（？）的焦黑面包？"
        </Paragraph>
        
        <div style={{ 
          padding: '12px 16px', 
          background: 'rgba(255, 240, 245, 0.5)', 
          borderRadius: '12px',
          border: '1px dashed rgba(255, 105, 180, 0.3)',
          margin: '16px 0',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <Text style={{ 
            fontSize: isMobile ? '14px' : '15px', 
            color: '#FF69B4',
            fontWeight: '500',
            display: 'block',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}>
            "谁焦黑了！朕那叫'陨石质感'！"小兔陛下飞快地掏出小黑板：<br/>
            "汇率更新：1句夸奖 = 2份喜欢 = 3块面包投喂。"
          </Text>
        </div>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          赫莉看着那歪七扭八的公式，忍俊不禁："好啦，就这么定吧。"
        </Paragraph>
        
        <div style={{ 
          padding: '12px 16px', 
          background: 'rgba(255, 133, 162, 0.08)', 
          borderRadius: '12px',
          borderLeft: `3px solid ${themeColor}`,
          margin: '24px 0 16px 0',
          maxWidth: '100%',
          boxSizing: 'border-box',
          fontWeight: 'bold'
        }}>
          <Text style={{ 
            fontSize: isMobile ? '16px' : '17px', 
            color: '#555',
            display: 'block',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}>
            【星空之声·真正闪耀】
          </Text>
        </div>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          终于到了那晚，银河大学的大礼堂灯火璀璨，悬挂着无数星形荧光灯。后台，赫莉正暖嗓，小兔陛下则在一旁摆弄自己的"小王冠加护耳麦"。
        </Paragraph>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          第一环节开始：唱诗班演唱。幕布拉开时，赫莉站在中央，微微一笑，轻声开唱。她的声音宛若银河中升腾的朝霞，穿透舞台，穿透夜空，让所有人屏息倾听。
        </Paragraph>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          小兔陛下在旁边，穿着一件略显滑稽却华丽的"兔耳领主斗篷"，双手在胸前捧着王冠，眼睛瞪得大大的——她完全陶醉在赫莉的歌声里，差点忘了自己还要做"暖场"姿势。
        </Paragraph>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          观众纷纷发出赞叹："好美的声音啊！" "这是谁？" "快让她出专辑！"
        </Paragraph>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          掌声如潮，弹幕般的欢呼席卷整个礼堂。小兔陛下突然一回神，赶忙补上一个"王冠挥手"的动作："呃……朕宣布，本宫——不不，朕宣布唱诗班成功！下面……请期待朕和烘焙社的联动！"
        </Paragraph>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          她一溜烟地跑下台，留下一串笑声。
        </Paragraph>
        
        <div style={{ 
          padding: '12px 16px', 
          background: 'rgba(255, 133, 162, 0.08)', 
          borderRadius: '12px',
          borderLeft: `3px solid ${themeColor}`,
          margin: '24px 0 16px 0',
          maxWidth: '100%',
          boxSizing: 'border-box',
          fontWeight: 'bold'
        }}>
          <Text style={{ 
            fontSize: isMobile ? '16px' : '17px', 
            color: '#555',
            display: 'block',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}>
            【烘焙互动·甜蜜到爆】
          </Text>
        </div>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          第二环节由烘焙社负责。小兔陛下换了件印着"面粉+糖霜=王国"的围裙，兴冲冲地抱着烤盘上台："朕为大家带来这次最神秘的料理——'星尘泡芙流心包'！"
        </Paragraph>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          现场还真有人激动："哇，是小兔陛下的作品！" "以前看她直播，烤面包总是糊得别有风味！"
        </Paragraph>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          只见小兔陛下深吸一口气，打开烤箱——出乎所有人意料的，里面竟然没有滚滚黑烟，也没有焦糊味，而是飘出一阵甜丝丝的香气。
        </Paragraph>
        
        <div style={{ 
          padding: '12px 16px', 
          background: 'rgba(255, 240, 245, 0.5)', 
          borderRadius: '12px',
          border: '1px dashed rgba(255, 105, 180, 0.3)',
          margin: '16px 0',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <Text style={{ 
            fontSize: isMobile ? '14px' : '15px', 
            color: '#FF69B4',
            fontWeight: '500',
            display: 'block',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}>
            "成功了？！"社员们惊喜地围上去，小兔陛下笑得格外骄傲："对啊，朕……朕这次可用足了心思，还请赫莉在旁边唱歌给面团听，借用她的声音振动，好让泡芙膨胀得更蓬松……"
          </Text>
        </div>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          台下掌声与惊叹不断，有人都感动得快流泪："这也行？音乐烘焙？天啊，好梦幻！"
        </Paragraph>
        
        <div style={{ 
          padding: '12px 16px', 
          background: 'rgba(255, 240, 245, 0.5)', 
          borderRadius: '12px',
          border: '1px dashed rgba(255, 105, 180, 0.3)',
          margin: '16px 0',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <Text style={{ 
            fontSize: isMobile ? '14px' : '15px', 
            color: '#FF69B4',
            fontWeight: '500',
            display: 'block',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}>
            "什么音乐烘焙，朕当然是有科学依据的！"小兔陛下双手叉腰，却偷偷红了耳尖。
          </Text>
        </div>
        
        <div style={{ 
          padding: '12px 16px', 
          background: 'rgba(255, 133, 162, 0.08)', 
          borderRadius: '12px',
          borderLeft: `3px solid ${themeColor}`,
          margin: '24px 0 16px 0',
          maxWidth: '100%',
          boxSizing: 'border-box',
          fontWeight: 'bold'
        }}>
          <Text style={{ 
            fontSize: isMobile ? '16px' : '17px', 
            color: '#555',
            display: 'block',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}>
            【联合谢幕·因为有你】
          </Text>
        </div>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          演出结束后，小兔陛下和赫莉一起站在舞台中央，一边是唱诗班围拢，一边是烘焙社社员簇拥，所有观众都起立鼓掌。
        </Paragraph>
        
        <div style={{ 
          padding: '12px 16px', 
          background: 'rgba(255, 240, 245, 0.5)', 
          borderRadius: '12px',
          border: '1px dashed rgba(255, 105, 180, 0.3)',
          margin: '16px 0',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <Text style={{ 
            fontSize: isMobile ? '14px' : '15px', 
            color: '#FF69B4',
            fontWeight: '500',
            display: 'block',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}>
            赫莉低头含笑："谢谢大家的支持……"
          </Text>
        </div>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          小兔陛下则举起那块小黑板，上面歪歪扭扭写着：
        </Paragraph>
        
        <div style={{ 
          padding: '20px', 
          background: 'rgba(255, 240, 245, 0.7)', 
          borderRadius: '12px',
          border: '1px solid rgba(255, 105, 180, 0.3)',
          margin: '16px 0',
          textAlign: 'center',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <Text style={{ 
            fontSize: isMobile ? '15px' : '17px', 
            color: '#FF69B4',
            fontWeight: '500',
            fontStyle: 'italic',
            lineHeight: '1.8',
            wordBreak: 'break-word',
            display: 'block'
          }}>
            "小兔+赫莉 = 最棒的宇宙（♡=∞）"
          </Text>
        </div>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          那一刻，万千星光都汇聚到她们身上，映着小兔陛下的王冠微微闪烁，和赫莉那双温柔清澈的眸子交相辉映。
        </Paragraph>
        
        <div style={{ 
          padding: '12px 16px', 
          background: 'rgba(255, 133, 162, 0.08)', 
          borderRadius: '12px',
          borderLeft: `3px solid ${themeColor}`,
          margin: '24px 0 16px 0',
          maxWidth: '100%',
          boxSizing: 'border-box',
          fontWeight: 'bold'
        }}>
          <Text style={{ 
            fontSize: isMobile ? '16px' : '17px', 
            color: '#555',
            display: 'block',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}>
            【散场之后·大学生活继续】
          </Text>
        </div>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          夜已深，大礼堂里的人渐渐散去。小兔陛下拿起收好的烤盘，赫莉背着吉他，一起走回宿舍的路上，路灯投下斑驳的影子。
        </Paragraph>
        
        <div style={{ 
          padding: '12px 16px', 
          background: 'rgba(255, 240, 245, 0.5)', 
          borderRadius: '12px',
          border: '1px dashed rgba(255, 105, 180, 0.3)',
          margin: '16px 0',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <Text style={{ 
            fontSize: isMobile ? '14px' : '15px', 
            color: '#FF69B4',
            fontWeight: '500',
            display: 'block',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}>
            "哼，其实朕可不会就此满足，"小兔陛下清了清嗓，"这才只是大学第一年的期中演出，接下来还有更多挑战呢！"<br/>
            "嗯，我也要继续练歌。希望有一天，我的声音能传到9672星，也能……让更多人听见。"赫莉轻声道。
          </Text>
        </div>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          小兔陛下侧头想了想："那……等你开宇宙演唱会，朕就在那里摆个'面包小摊'，让全宇宙都来买朕的面包！"
        </Paragraph>
        
        <div style={{ 
          padding: '12px 16px', 
          background: 'rgba(255, 240, 245, 0.5)', 
          borderRadius: '12px',
          border: '1px dashed rgba(255, 105, 180, 0.3)',
          margin: '16px 0',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <Text style={{ 
            fontSize: isMobile ? '14px' : '15px', 
            color: '#FF69B4',
            fontWeight: '500',
            display: 'block',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}>
            赫莉噗嗤一笑："好啊，来一个'听歌+吃面包'的星际巡回。"
          </Text>
        </div>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          两只小家伙在路灯下相视而笑。王冠似乎感应到了这份默契，闪了一下绿灯，没有再发出任何警示音。只是隐约间，仿佛又听到那熟悉的童声录音："小兔真棒……"
        </Paragraph>
        
        <div style={{ 
          padding: '12px 16px', 
          background: 'rgba(255, 133, 162, 0.08)', 
          borderRadius: '12px',
          borderLeft: `3px solid ${themeColor}`,
          margin: '24px 0 16px 0',
          maxWidth: '100%',
          boxSizing: 'border-box',
          fontWeight: 'bold'
        }}>
          <Text style={{ 
            fontSize: isMobile ? '16px' : '17px', 
            color: '#555',
            display: 'block',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}>
            【后记】
          </Text>
        </div>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          大学的日子才刚刚开始，未来还有更多未知的冒险与挑战在等着她们。
        </Paragraph>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          小兔陛下，带着她对烘焙的热爱、对宇宙征服的野心，和那些偶尔糊掉的梦想一起，踏上了学习与成长的路。
        </Paragraph>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          赫莉，这只声音如银河般澄澈的河狸，也将在歌声中找寻更广阔的星空，唱出属于自己的辉煌。
        </Paragraph>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          在浩瀚宇宙中，这两位性格截然不同的"新生"，在银河大学的校园里，一起写下最甜蜜、最热闹、也最温暖的回忆录。
        </Paragraph>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555' }}>
          这片星海之下，她们的故事还将继续延伸，就像那句小黑板上歪歪扭扭却真诚无比的公式：
        </Paragraph>
        
        <div style={{ 
          padding: '20px', 
          background: 'rgba(255, 240, 245, 0.7)', 
          borderRadius: '12px',
          border: '1px solid rgba(255, 105, 180, 0.3)',
          margin: '16px 0',
          textAlign: 'center',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <Text style={{ 
            fontSize: isMobile ? '15px' : '17px', 
            color: '#FF69B4',
            fontWeight: '500',
            fontStyle: 'italic',
            lineHeight: '1.8',
            wordBreak: 'break-word',
            display: 'block'
          }}>
            "♡ = ∞"
          </Text>
        </div>
        
        <Paragraph style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: '1.8', color: '#555', textAlign: 'center', fontStyle: 'italic' }}>
          ——只要还有音符回荡，只要还有面包的香气，就会有新的篇章，新的奇迹在等着被发现。
        </Paragraph>
      </>
    )
  };

  return (
    <Card
      bordered={false}
      style={{
        background: 'rgba(255, 255, 255, 0.7)',
        borderRadius: '16px',
        boxShadow: '0 6px 16px rgba(255, 133, 162, 0.15)',
        display: expandStory ? 'block' : 'none',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {storyChapters.map((chapter, index) => (
          <div 
            key={index}
            style={{ 
              opacity: expandStory ? 1 : 0,
              transform: expandStory ? 'translateY(0)' : 'translateY(20px)',
              transition: `all 0.5s ease ${0.2 + index * 0.2}s`,
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '16px',
              flexWrap: isMobile ? 'wrap' : 'nowrap',
            }}>
              <div style={{ 
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255, 133, 162, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
                flexShrink: 0,
              }}>
                {chapter.icon}
              </div>
              <Title level={4} style={{ 
                margin: 0,
                fontSize: isMobile ? '18px' : '20px',
                color: '#FF69B4',
                fontWeight: '600',
                wordBreak: 'break-word',
              }}>
                {chapter.title}
              </Title>
            </div>
            
            <div style={{ 
              paddingLeft: isMobile ? '0' : '48px',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            }}>
              {chapter.content}
            </div>
            
            {index < storyChapters.length - 1 && (
              <Divider 
                style={{ 
                  margin: '32px 0', 
                  borderColor: 'rgba(255, 192, 203, 0.3)',
                }}
                dashed
              />
            )}
          </div>
        ))}
        
        {/* 隐藏彩蛋按钮 */}
        <div style={{
          textAlign: 'center',
          margin: '20px 0',
          opacity: expandStory ? 1 : 0,
          transform: expandStory ? 'translateY(0)' : 'translateY(20px)',
          transition: `all 0.5s ease ${0.2 + storyChapters.length * 0.2}s`,
        }}>
          <Button
            type="dashed"
            icon={isUnlocked ? (showExtraStory ? <UpOutlined /> : <DownOutlined />) : <LockOutlined />}
            onClick={handleButtonClick}
            style={{
              borderColor: themeColor,
              color: themeColor,
            }}
          >
            {isUnlocked 
              ? (showExtraStory ? '收起番外篇' : '点击查看隐藏番外篇') 
              : '输入暗号查看隐藏番外篇'}
          </Button>
        </div>
        
        {/* 番外故事 */}
        {showExtraStory && (
          <div 
            style={{ 
              opacity: 1,
              transform: 'translateY(0)',
              transition: 'all 0.5s ease',
              width: '100%',
              boxSizing: 'border-box',
              marginTop: '20px',
            }}
          >
            <Divider 
              style={{ 
                margin: '0 0 32px 0', 
                borderColor: 'rgba(255, 192, 203, 0.5)',
              }}
              dashed
            />
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '16px',
              flexWrap: isMobile ? 'wrap' : 'nowrap',
            }}>
              <div style={{ 
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255, 133, 162, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
                flexShrink: 0,
              }}>
                {extraStory.icon}
              </div>
              <Title level={4} style={{ 
                margin: 0,
                fontSize: isMobile ? '18px' : '20px',
                color: '#FF69B4',
                fontWeight: '600',
                wordBreak: 'break-word',
              }}>
                {extraStory.title}
              </Title>
            </div>
            
            <div style={{ 
              paddingLeft: isMobile ? '0' : '48px',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            }}>
              {extraStory.content}
            </div>
          </div>
        )}
      </Space>
      
      {/* 暗号输入模态框 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <LockOutlined style={{ marginRight: '8px', color: themeColor }} />
            <span>请输入暗号解锁番外篇</span>
          </div>
        }
        open={secretModalVisible}
        onCancel={() => setSecretModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setSecretModalVisible(false)}>
            取消
          </Button>,
          <Button 
            key="unlock" 
            type="primary" 
            onClick={handleSecretCodeCheck}
            style={{ background: themeColor, borderColor: themeColor }}
          >
            解锁
          </Button>
        ]}
        centered
      >
        <div style={{ padding: '16px 0' }}>
          <Paragraph style={{ fontSize: '15px', marginBottom: '16px' }}>
            小兔陛下最好的朋友是谁？请输入她的名字作为暗号：
          </Paragraph>
          <Input 
            placeholder="请输入暗号..." 
            value={secretCode}
            onChange={(e) => setSecretCode(e.target.value)}
            onPressEnter={handleSecretCodeCheck}
            style={{ borderColor: themeColor }}
            prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
          />
        </div>
      </Modal>
    </Card>
  );
};

export default StoryContent; 