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
  
    const app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      transparent: true,
      autoStart: true
    });
    container.appendChild(app.view);
    app.view.style.position = 'fixed';
    app.view.style.right = '20px';
    app.view.style.bottom = '20px';
    app.view.style.width = '25%';
    app.view.style.height = '25%';
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
        adjustModelPosition(model);
        setupModelInteraction(model);
      })
      .catch(error => {
        console.error('Live2D 模型加载失败:', error);
      });
  
      function adjustModelPosition(model) {
        if (!model) return;
    
        const baseScale = (window.innerHeight) / model.height; // 按屏幕高度计算
        const finalScale = baseScale * 1; // **调整缩放系数 (更大)**
        model.scale.set(finalScale);
    
        model.anchor.set(0.5, 1); // **模型底部中心对齐**
        model.x = window.innerWidth - 300; // **适当偏移**
        model.y = window.innerHeight; 
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
        const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        const mouseY = (e.clientY / window.innerHeight) * 2 - 1;
        try {
          if (model.internalModel.parameters.ids.includes('ParamEyeBallX')) {
            model.internalModel.coreModel.setParameterValueById('ParamEyeBallX', mouseX);
          }
          if (model.internalModel.parameters.ids.includes('ParamEyeBallY')) {
            model.internalModel.coreModel.setParameterValueById('ParamEyeBallY', mouseY);
          }
        } catch (e) {
          console.log('参数控制出错:', e);
        }
      }, 100); // 100毫秒的节流时间，可以根据需要调整
      
      document.addEventListener('mousemove', handleMouseMove);
    }
  }
  