# VUP乌托邦 (VUP Utopia)

<p align="center">
  <img src="frontend/public/logo.png" alt="VUP乌托邦" width="200" />
</p>

<p align="center">
  <b>打造属于虚拟主播的理想家园</b>
</p>

<p align="center">
  <a href="#项目简介">项目简介</a> •
  <a href="#功能特点">功能特点</a> •
  <a href="#技术架构">技术架构</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#项目结构">项目结构</a> •
  <a href="#开发指南">开发指南</a> •
  <a href="#常见问题">常见问题</a> •
  <a href="#社区与贡献">社区与贡献</a> •
  <a href="#未来规划">未来规划</a> •
  <a href="#许可证">许可证</a>
</p>

## 项目简介

VUP乌托邦是一个为虚拟主播（VTuber/VUP）创建的综合性内容管理与互动平台，旨在为虚拟主播提供一站式解决方案。集成了音乐点播、互动抽奖、粉丝留言、直播工具和Live2D模型展示等功能，为虚拟主播与粉丝之间搭建了一座沟通的桥梁。

无论是刚入行的新人VUP，还是有一定粉丝基础的虚拟主播，VUP乌托邦都能助你轻松管理内容、提升互动体验，打造专属于你的虚拟世界。

## 功能特点

### 🎵 内容管理
- **音乐库管理**：轻松整理、分类和管理你的曲库
- **点歌系统**：观众实时点歌，自动排队和播放
- **歌单分享**：一键生成特色歌单，分享到社交平台
- **历史记录**：记录每一次直播的点歌历史，方便回顾

### 🎮 互动系统
- **实时弹幕集成**：与主流直播平台的弹幕系统无缝对接
- **抽奖系统**：多种抽奖模式，增强直播互动性
- **棉花糖留言板**：粉丝匿名或实名留言，主播实时回应
- **应援装置**：礼物效果、特效动画等增强直播氛围

### 🐰 Live2D展示
- **模型实时渲染**：高性能Live2D模型渲染
- **跨平台兼容**：同时支持PC端和移动端的模型展示
- **互动响应**：模型可跟随鼠标/触摸移动，增强互动感
- **动作切换**：支持多种预设动作与表情，丰富直播表现力

### 👑 管理后台
- **用户权限管理**：多级权限系统，满足团队协作需求
- **数据分析**：直播数据可视化，了解观众偏好
- **内容审核**：弹幕和留言过滤系统，创建健康的互动环境
- **自定义主题**：个性化界面设置，打造专属品牌形象

### 🌸 特色功能
- **樱花特效**：唯美视觉效果增强直播氛围
- **季节主题**：根据节日和季节自动切换界面主题
- **多语言支持**：中文、英文、日文等多语言界面
- **离线模式**：支持部分功能在无网络环境下使用

## 技术架构

### 前端技术
- **React.js**：构建用户界面的核心框架
- **Ant Design**：专业美观的UI组件库
- **React Router**：前端路由管理
- **Redux**：状态管理
- **Axios**：API请求处理
- **WebSocket**：实时通信
- **PIXI.js**：Live2D模型渲染
- **CSS3动画**：樱花飘落等特效实现

### 后端技术
- **Flask**：Python轻量级Web框架
- **SQLAlchemy**：ORM数据库操作
- **Redis**：缓存和消息队列
- **JWT**：身份验证
- **Celery**：任务队列
- **WebSocket**：实时消息推送
- **RESTful API**：标准化API设计

### 数据存储
- **PostgreSQL**：主要关系型数据库
- **MongoDB**：非结构化数据存储
- **Redis**：缓存和实时数据
- **阿里云OSS/AWS S3**：静态资源存储

### 部署环境
- **Docker**：容器化部署
- **Nginx**：Web服务器和反向代理
- **CI/CD**：自动化构建和部署
- **监控告警**：系统健康监控

## 快速开始

### 环境要求
- Node.js 16+
- Python 3.8+
- PostgreSQL 13+
- Redis 6+

### 前端部署

```bash
# 克隆仓库
git clone https://github.com/your-username/vup-utopia.git
cd vup-utopia

# 安装前端依赖
cd frontend
npm install

# 开发模式运行
npm run dev

# 构建生产版本
npm run build
```

### 后端部署

```bash
# 进入后端目录
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑.env文件设置必要的环境变量

# 初始化数据库
flask db upgrade

# 运行开发服务器
flask run
```

### Docker一键部署

```bash
# 使用Docker Compose启动全部服务
docker-compose up -d

# 访问应用
# 前端: http://localhost:3000
# 后端API: http://localhost:5000
# 管理控制台: http://localhost:3000/admin
```

## 项目结构

```
vup-utopia/
├── frontend/               # React前端应用
│   ├── src/                # 源代码
│   │   ├── components/     # UI组件
│   │   ├── pages/          # 页面
│   │   ├── services/       # API服务
│   │   ├── stores/         # 状态管理
│   │   ├── utils/          # 工具函数
│   │   └── App.js          # 入口组件
│   ├── public/             # 静态资源
│   └── package.json        # 依赖配置
│
├── backend/                # Flask后端API
│   ├── app/                # 应用代码
│   │   ├── api/            # API路由
│   │   ├── models/         # 数据模型
│   │   ├── services/       # 业务逻辑
│   │   └── utils/          # 工具函数
│   ├── migrations/         # 数据库迁移
│   ├── tests/              # 测试代码
│   ├── config.py           # 配置文件
│   ├── wsgi.py             # WSGI入口
│   └── requirements.txt    # Python依赖
│
├── live2d/                 # Live2D模型与渲染
│   ├── model/              # 模型文件
│   ├── lib/                # 第三方库
│   └── src/                # 自定义脚本
│
├── docker/                 # Docker配置
│   ├── frontend/           # 前端Docker配置
│   ├── backend/            # 后端Docker配置
│   └── nginx/              # Nginx配置
│
├── scripts/                # 脚本工具
│   ├── setup.sh            # 环境设置脚本
│   ├── deploy.sh           # 部署脚本
│   └── backup.sh           # 数据备份脚本
│
├── docs/                   # 文档
│   ├── api/                # API文档
│   ├── dev/                # 开发指南
│   └── user/               # 用户手册
│
├── .github/                # GitHub配置
├── docker-compose.yml      # Docker编排配置
├── .env.example            # 环境变量示例
└── README.md               # 项目说明
```

## 开发指南

### 代码规范
- 前端代码遵循[Airbnb JavaScript风格指南](https://github.com/airbnb/javascript)
- 后端代码遵循[PEP 8](https://www.python.org/dev/peps/pep-0008/)
- 提交前请运行代码检查工具确保符合规范

### 开发流程
1. 从`develop`分支创建新的特性分支
2. 在本地完成开发和测试
3. 提交Pull Request到`develop`分支
4. 通过代码审查后合并

### API开发
- 遵循RESTful API设计原则
- 使用Swagger记录API文档
- 所有API需要编写测试用例

### 前端组件开发
- 组件设计遵循原子设计原则
- 组件需要有完整的PropTypes定义
- 大型组件应编写单元测试

## 常见问题

### Live2D模型无法加载
- 请确保浏览器支持WebGL
- 检查模型文件是否完整
- 尝试清除浏览器缓存后重试

### 性能优化问题
- 移动端尽量关闭高级视觉效果
- 减少同时展示的动画数量
- 使用CDN加速静态资源加载

### 跨平台兼容问题
- iOS设备可能存在音频播放限制，需用户交互后才能播放
- 低配置Android设备可能无法流畅运行Live2D模型，建议降低分辨率

## 社区与贡献

- **Issues**: 请使用GitHub Issues报告问题或提出新功能建议
- **Discussion**: 加入我们的[Discord社区](https://discord.gg/vup-utopia)参与讨论
- **Contributors**: 欢迎提交PR，查看[贡献指南](CONTRIBUTING.md)了解详情

### 如何参与贡献
1. Fork本仓库
2. 创建你的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 未来规划

### 近期计划
- [ ] 集成更多直播平台API
- [ ] 优化移动端体验
- [ ] 增加更多Live2D模型选择
- [ ] 实现全平台黑暗模式

### 长期计划
- [ ] 语音识别功能，实现语音控制
- [ ] AR/VR支持，实现沉浸式虚拟主播体验
- [ ] AI辅助创作工具
- [ ] 跨平台客户端应用

## 许可证

本项目采用MIT许可证。详情请参阅[LICENSE](LICENSE)文件。

## 联系我们

- **官方网站**: [https://vup-utopia.com](https://vup-utopia.com)
- **电子邮件**: support@vup-utopia.com
- **微博**: [@VUP乌托邦](https://weibo.com/vup-utopia)
- **B站**: [VUP乌托邦官方](https://space.bilibili.com/vup-utopia)

---

<p align="center">用科技点亮虚拟世界，为创作赋能</p>
<p align="center">Copyright © 2023 VUP乌托邦团队. All Rights Reserved.</p> 