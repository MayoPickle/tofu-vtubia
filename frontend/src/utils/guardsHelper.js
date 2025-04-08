// 守护者相关的工具函数

// 获取舰长数据
export const fetchGuardsData = async () => {
  try {
    const response = await fetch('/api/guards');
    if (!response.ok) {
      throw new Error('获取舰长数据失败');
    }
    const data = await response.json();
    return data.guards || [];
  } catch (error) {
    console.error('获取舰长数据错误:', error);
    throw error;
  }
};

// 获取舰长等级对应的标签颜色
export const getGuardLevelColor = (level) => {
  switch (level) {
    case 3:
      return '#FF1493'; // 舰长
    case 2:
      return '#FF69B4'; // 提督
    case 1:
      return '#FFB6C1'; // 总督
    default:
      return '#FFC0CB';
  }
};

// 获取舰长等级对应的文字
export const getGuardLevelText = (level) => {
  switch (level) {
    case 3:
      return '舰长';
    case 2:
      return '提督';
    case 1:
      return '总督';
    default:
      return '未知';
  }
};

// 生成守护者的故事
export const generateGuardStory = (guard) => {
  const levelText = getGuardLevelText(guard.guard_level);
  const days = guard.accompany;
  const stories = [
    {
      title: '初次相遇',
      content: `在9672星球的第${Math.floor(days * 0.1)}天，${guard.username}带着对未知的好奇来到了这里。作为一名${levelText}，${guard.username}的到来让这个星球增添了一份独特的色彩。`,
    },
    {
      title: '守护时光',
      content: `在这${days}天里，${guard.username}见证了无数个日出日落，参与了众多精彩的故事。${guard.medal_name ? `佩戴着「${guard.medal_name}」的${guard.username}，用温暖的心为这个星球增添了独特的光芒。` : ''}`,
    },
    {
      title: '难忘瞬间',
      content: `每一次的互动，每一个温暖的瞬间，都让人难以忘怀。${guard.username}不仅是一位${levelText}，更是9672星球故事中不可或缺的一部分。`,
    },
    {
      title: '未来期许',
      content: `期待在未来的日子里，能和${guard.username}一起创造更多精彩的故事，让9672星球变得更加绚丽多彩。`,
    },
  ];
  return stories;
}; 