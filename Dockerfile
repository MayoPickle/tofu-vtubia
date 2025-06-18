# 多阶段构建 Dockerfile for 兔福音乐清单

# 第一阶段：构建前端
FROM node:18-alpine AS frontend-builder

# 设置工作目录
WORKDIR /app/frontend

# 复制前端依赖文件
COPY frontend/package*.json ./

# 声明要接收的 build-arg
ARG REACT_APP_ICP_FILING_NUMBER
# 让后续的 npm run build 能看到这个 ENV
ENV REACT_APP_ICP_FILING_NUMBER=$REACT_APP_ICP_FILING_NUMBER

# 安装依赖
RUN npm install

# 复制前端源代码
COPY frontend/ ./

# 构建前端应用
RUN npm run build

# 第二阶段：构建后端并整合前端
FROM python:3.10-slim

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 复制后端依赖文件
COPY backend/requirements.txt .

# 安装Python依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制后端代码
COPY backend/ .

# 从前端构建阶段复制构建产物到后端的build目录
COPY --from=frontend-builder /app/frontend/build ./build

# 创建上传目录
RUN mkdir -p uploads && chmod 777 uploads

# 设置环境变量
ENV HOST=0.0.0.0
ENV PORT=5000
ENV FLASK_APP=main.py
ENV PYTHONUNBUFFERED=1

# 暴露端口
EXPOSE 5000

# 启动命令
CMD ["python", "main.py"] 
