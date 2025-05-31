// constants.js
export const defaultPrizes = [
    { name: '旺旺', probability: 0.2, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTN_FxYRgRP9Diku5wUhgg3PiciL5CJBFu46Q&s' },
    { name: '袜袜', probability: 0.3, image: 'https://cdn.yamibuy.net/itemdescription/c0f98c73b07e3b746419ece26db18fcb_0x0.webp' },
    { name: '狗狗', probability: 0.5, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeCBPTS5r3v6v-0K0YWhNp4XAHoCHAdW1nuQ&s' },
];

// 默认人员列表（用于礼物抽人模式）
export const defaultMembers = [
    { name: '舰长小明', probability: 1, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDKjVw7xNfBXTNz0VwQXp8-hXUY7OtQoXNhA&s' },
    { name: '舰长小红', probability: 1, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhK4K2cK0TJyNfvOcZ_N7eHOKK7W1Q1cKkQA&s' },
    { name: '舰长小刚', probability: 1, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSk5hGt1TzXWJY2iyI3o3d5MvCfKVE5N8Y1gQ&s' },
    { name: '舰长小丽', probability: 1, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbOlQNhOIVPqJ5oiZFJZ7_uGaHdp7Y1FPGlA&s' },
];

// 默认礼品设置（用于礼物抽人模式）
export const defaultGift = {
    name: '牛奶',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdBZGZgH3gJq6i3pF7oQ7Y6Dx5X5H5Y5h5gA&s',
    description: '美味的牛奶一瓶',
    quantity: 1
};

// 轮盘模式
export const LOTTERY_MODES = {
    PRIZE_MODE: 'prize_mode',  // 抽奖品模式
    GIFT_MEMBER_MODE: 'gift_member_mode'  // 用礼物抽人模式
};
  