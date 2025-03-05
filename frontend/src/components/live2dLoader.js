export function loadLive2DScripts() {
    function loadScript(url) {
      return new Promise((resolve, reject) => {
        console.log('加载脚本:', url);
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => {
          console.log('脚本加载成功:', url);
          resolve();
        };
        script.onerror = () => {
          console.error('脚本加载失败:', url);
          reject(new Error(`Failed to load ${url}`));
        };
        document.body.appendChild(script);
      });
    }
  
    // 首先加载基本的PIXI.js
    return loadScript('https://cdn.jsdelivr.net/npm/pixi.js@5.3.3/dist/pixi.min.js')
      // 加载Cubism 2运行时 - 必须先加载
      .then(() => loadScript('/assets/live2d/live2d.min.js'))
      // 加载L2Dwidget
      .then(() => loadScript('https://cdn.jsdelivr.net/npm/live2d-widget@3.1.4/lib/L2Dwidget.min.js'))
      // 加载Cubism 4运行时
      .then(() => loadScript('https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js'))
      // 加载Cubism 4支持
      .then(() => loadScript('https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.3.1/dist/cubism4.min.js'))
      // 加载主索引文件 - 需要在Cubism 2和Cubism 4都加载完毕后加载
      .then(() => loadScript('https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.3.1/dist/index.min.js'))
      .then(() => {
        console.log('所有 Live2D 相关库加载完成');
      })
      .catch(error => {
        console.error('Live2D 资源加载失败:', error);
      });
  }
  
  export function initLive2DModel() {
    if (!window.PIXI || !window.PIXI.live2d) {
      console.error('PIXI.live2d 未加载，无法初始化模型');
      return;
    }
  
    const container = document.getElementById('live2d-container');
    if (!container) {
      console.error('找不到 live2d-container');
      return;
    }

    // 检测是否为移动设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
    // 根据设备类型设置画布大小
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // 确保先清理之前的可能存在的PIXI应用和WebGL上下文
    destroyLive2DModel();
    
    const app = new PIXI.Application({
      width: containerWidth,
      height: containerHeight,
      transparent: true,
      autoStart: true,
      resolution: window.devicePixelRatio || 1, // 支持高DPI显示
      powerPreference: 'high-performance', // 提高性能
      antialias: true, // 抗锯齿
      preserveDrawingBuffer: false // 提高性能
    });

    // 保存应用实例到window对象以便后续清理
    window.live2dApp = app;

    container.appendChild(app.view);
    
    // 设置画布样式以适应容器
    app.view.style.width = '100%';
    app.view.style.height = '100%';
    app.view.style.position = 'absolute';
    app.view.style.top = '0';
    app.view.style.left = '0';
    app.view.style.pointerEvents = 'none';
    app.view.style.zIndex = '1000';
  
    const modelContainer = new PIXI.Container();
    app.stage.addChild(modelContainer);
  
    const modelPath = 'model/JKRabbit/JKRabbit.model3.json';
    console.log('开始加载 Live2D 模型:', modelPath);
  
    PIXI.live2d.Live2DModel.from(modelPath)
      .then(model => {
        console.log('Live2D 模型加载成功');
        modelContainer.addChild(model);
        adjustModelPosition(model, containerWidth, containerHeight, isMobile);
        setupModelInteraction(model);

        // 保存模型到window对象以便后续清理
        window.live2dModel = model;

        // 监听窗口大小变化
        window.addEventListener('resize', handleResize);
      })
      .catch(error => {
        console.error('Live2D 模型加载失败:', error);
      });
      
    // 分离resize事件处理函数，方便后续移除
    function handleResize() {
      if (!window.live2dModel || !window.live2dApp) return;
      
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      window.live2dApp.renderer.resize(newWidth, newHeight);
      adjustModelPosition(window.live2dModel, newWidth, newHeight, isMobile);
    }
    
    // 保存事件处理器以便后续清理
    window.live2dResizeHandler = handleResize;
  }

  // 添加清理函数，避免内存泄漏和WebGL上下文冲突
  export function destroyLive2DModel() {
    // 清理resize事件
    if (window.live2dResizeHandler) {
      window.removeEventListener('resize', window.live2dResizeHandler);
      window.live2dResizeHandler = null;
    }
    
    // 清理模型
    if (window.live2dModel) {
      if (window.live2dModel.parent) {
        window.live2dModel.parent.removeChild(window.live2dModel);
      }
      window.live2dModel.destroy(true);
      window.live2dModel = null;
    }
    
    // 清理PIXI应用
    if (window.live2dApp) {
      const container = document.getElementById('live2d-container');
      if (container && container.contains(window.live2dApp.view)) {
        container.removeChild(window.live2dApp.view);
      }
      window.live2dApp.destroy(true, { children: true, texture: true, baseTexture: true });
      window.live2dApp = null;
    }
  }

  function adjustModelPosition(model, containerWidth, containerHeight, isMobile) {
    if (!model) return;

    // 计算合适的缩放比例
    const scale = isMobile 
      ? Math.min(containerWidth / model.width, containerHeight / model.height) * 0.6  // 移动端缩小到0.6倍
      : Math.min(containerWidth / model.width, containerHeight / model.height);
    
    model.scale.set(scale);

    // 设置模型锚点为底部中心
    model.anchor.set(0.5, 1);
    
    // 调整模型位置 - 向右上方移动
    model.x = containerWidth * 0.7; // 向右移动到容器70%的位置
    model.y = containerHeight * 0.9; // 向上移动10%
  }

  function setupModelInteraction(model) {
    if (!model) return;
    
    // 添加节流函数来限制事件触发频率
    function throttle(callback, delay) {
      let lastCall = 0;
      return function(...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
          lastCall = now;
          callback.apply(this, args);
        }
      };
    }
    
    // 使用节流函数包装鼠标移动处理函数
    const handleMouseMove = throttle((e) => {
      if (!model?.internalModel?.parameters?.ids) return;
      
      // 计算相对于容器的鼠标位置
      const rect = model.parent.getBounds();
      const mouseX = ((e.clientX - rect.x) / rect.width) * 2 - 1;
      const mouseY = ((e.clientY - rect.y) / rect.height) * 2 - 1;
      
      try {
        if (model.internalModel.parameters.ids.includes('ParamEyeBallX')) {
          model.internalModel.coreModel.setParameterValueById('ParamEyeBallX', mouseX);
        }
        if (model.internalModel.parameters.ids.includes('ParamEyeBallY')) {
          model.internalModel.coreModel.setParameterValueById('ParamEyeBallY', mouseY);
        }
        // 添加头部转动
        if (model.internalModel.parameters.ids.includes('ParamAngleX')) {
          model.internalModel.coreModel.setParameterValueById('ParamAngleX', mouseX * 30);
        }
        if (model.internalModel.parameters.ids.includes('ParamAngleY')) {
          model.internalModel.coreModel.setParameterValueById('ParamAngleY', mouseY * 30);
        }
      } catch (e) {
        console.log('参数控制出错:', e);
      }
    }, 500);
    
    document.addEventListener('mousemove', handleMouseMove);
    
    // 添加触摸事件支持
    document.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        handleMouseMove({
          clientX: touch.clientX,
          clientY: touch.clientY
        });
      }
    });
  }
  