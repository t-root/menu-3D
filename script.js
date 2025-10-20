// script.js
window.addEventListener('load', () => {
    // 1) Thêm style chung
    const style = document.createElement('style');
    style.textContent = `
    * { margin:0; padding:0; box-sizing:border-box; } 
    .menu {
        position: fixed; top:0; left:0;
        width:100vw; height:100vh;
        perspective: 1000px;
        background: #1e1e1e;
        overflow: hidden;
        z-index: -1; /* ẩn mặc định */
    }
    .scene {
        position:absolute; top:50%; left:50%;
        transform-style: preserve-3d;
        transform: translate(-50%, -50%);
    }
    .item {
        position:absolute; top:50%; left:50%;
        width: var(--item-w); height: var(--item-h);
        transform-origin: center center;
        background: rgba(255,255,255,0.1);
        border:2px solid #fff;
        display:flex; align-items:center; justify-content:center;
        overflow:hidden; 
    }
    .item iframe { width:100%; height:100%; border:none; }
    .menu-label {
        position:absolute; bottom:8px; left:50%;
        transform:translateX(-50%);
        background:rgba(0,0,0,0.6); color:#fff;
        padding:4px 8px; border-radius:4px;
        font-size:14px; pointer-events:auto; z-index:10;
        text-decoration:none;
    }
    `;
    document.head.appendChild(style);

    // 2) Tạo menu & scene container
    const menu = document.createElement('div');
    menu.className = 'menu';
    document.body.appendChild(menu);

    const scene = document.createElement('div');
    scene.className = 'scene';
    scene.id = 'scene';
    menu.appendChild(scene);

    // 3) Load config.json và khởi tạo carousel 3D + contextmenu handler
    fetch('config.json')
    .then(r => r.json())
    .then(init)
    .catch(console.error);

    function init(cfg) {
    // Debug: kiểm tra config
    console.log('Loaded config:', cfg);
    console.log('cfg.indexUp =', cfg.indexUp);

    // Lấy giá trị z-index khi menu mở từ config
    const zIndexUp = typeof cfg.indexUp === 'number' ? cfg.indexUp : 100;

    // Biến điều khiển toggle
    let isMenuVisible = false;
    let lastContextTime = 0;
    const dblThreshold = 500; // ms
    let clickTimer = null;

    document.addEventListener('contextmenu', e => {
      const now = Date.now();
      const diff = now - lastContextTime;
      lastContextTime = now;

      if (diff < dblThreshold) {
        // Double-click: clear pending single-click action, let default menu open
        clearTimeout(clickTimer);
        // Do not preventDefault -> browser menu appears
      } else {
        // Single-click: prevent default and schedule toggle
        e.preventDefault();
        clearTimeout(clickTimer);
        clickTimer = setTimeout(() => {
          isMenuVisible = !isMenuVisible;
          console.log('Toggled custom menu:', isMenuVisible);
          menu.style.zIndex = isMenuVisible ? zIndexUp : -1;
        }, dblThreshold);
      }
    });

    // Áp dụng kích thước & perspective
    document.documentElement.style.setProperty('--item-w', cfg.itemWidth + 'px');
    document.documentElement.style.setProperty('--item-h', cfg.itemHeight + 'px');
    menu.style.perspective = cfg.perspective + 'px';

    // Khởi tạo các mục trong carousel
    cfg.items.forEach((c, i) => {
        const el = document.createElement('div');
        el.className = 'item';
        el.dataset.angle = (360 / cfg.items.length) * i;

        const iframe = document.createElement('iframe');
        iframe.src = c.path;
        iframe.title = c.title;
        iframe.tabIndex = 0;
        el.appendChild(iframe);

        if (c.title) {
        const a = document.createElement('a');
        a.href = c.path;
        a.className = 'menu-label';
        a.textContent = c.title;
        el.appendChild(a);
        }

        scene.appendChild(el);
    });

    // Slider logic
    let rotX = 0, rotY = 0, isPaused = false, pauseTO = null;
    const elems = Array.from(scene.children);

    function update() {
        scene.style.transform =
        `translate(-50%,-50%) translateZ(${-cfg.radius}px)` +
        ` rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        elems.forEach(el => {
        const a = el.dataset.angle;
        el.style.transform =
            `translate(-50%,-50%) rotateY(${a}deg) translateZ(${cfg.radius}px)`;
        });
    }

    function pauseForever() {
        isPaused = true;
        clearTimeout(pauseTO);
    }
    function resumeAfter() {
        clearTimeout(pauseTO);
        pauseTO = setTimeout(() => isPaused = false, cfg.timeAuto);
    }

    // Vẽ lần đầu
    update();

    // Auto rotate
    (function animate() {
        if (!isPaused) {
        rotY += cfg.autoRotateSpeed;
        update();
        }
        requestAnimationFrame(animate);
    })();

    // Hover/focus → pause
    elems.forEach(el => {
        el.addEventListener('mouseenter', pauseForever);
        el.addEventListener('mouseleave', () => isPaused = false);
        const ifr = el.querySelector('iframe');
        ifr.addEventListener('focus', pauseForever);
        ifr.addEventListener('blur', () => isPaused = false);
    });

    // Drag-to-rotate
    let dragging = false, sX, sY;
    menu.addEventListener('mousedown', e => {
        if (e.button !== 0) return;
        dragging = true;
        sX = e.clientX; sY = e.clientY;
    });
    window.addEventListener('mouseup', () => (dragging = false));
    window.addEventListener('mousemove', e => {
        if (!dragging) return;
        rotY += (e.clientX - sX) * 0.3;
        rotX -= (e.clientY - sY) * 0.3;
        rotX = Math.max(-90, Math.min(90, rotX));
        sX = e.clientX; sY = e.clientY;
        update();
    });

    // Wheel → quick rotate + pause + resume
    window.addEventListener(
        'wheel',
        e => {
        e.preventDefault();
        rotY += e.deltaY > 0 ? cfg.scrollRotateSpeed : -cfg.scrollRotateSpeed;
        update();
        pauseForever();
        resumeAfter();
        },
        { passive: false }
    );
    }
});
