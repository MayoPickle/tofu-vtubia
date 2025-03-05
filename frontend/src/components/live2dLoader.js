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
  
    return loadScript('https://cdn.jsdelivr.net/npm/pixi.js@5.3.3/dist/pixi.min.js')
      .then(() => loadScript('https://cdn.jsdelivr.net/npm/live2d-widget@3.1.4/lib/L2Dwidget.min.js'))
      .then(() => loadScript('https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js'))
      .then(() => loadScript('https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.3.1/dist/cubism4.min.js'))
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
    
    const app = new PIXI.Application({
      width: containerWidth,
      height: containerHeight,
      transparent: true,
      autoStart: true,
      resolution: window.devicePixelRatio || 1, // 支持高DPI显示
    });

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

        // 监听窗口大小变化
        window.addEventListener('resize', () => {
          const newWidth = container.clientWidth;
          const newHeight = container.clientHeight;
          app.renderer.resize(newWidth, newHeight);
          adjustModelPosition(model, newWidth, newHeight, isMobile);
        });
      })
      .catch(error => {
        console.error('Live2D 模型加载失败:', error);
      });
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
  