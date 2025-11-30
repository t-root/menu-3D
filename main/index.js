// script.js
window.addEventListener('load', () => {
    // Tự động detect đường dẫn của index.js để load config đúng
    const getScriptBasePath = () => {
        const currentScript = document.currentScript || 
            Array.from(document.scripts).find(s => s.src && (s.src.includes('index.js') || s.src.includes('script.js')));
        if (currentScript && currentScript.src) {
            const scriptPath = currentScript.src;
            const scriptDir = scriptPath.substring(0, scriptPath.lastIndexOf('/') + 1);
            return scriptDir;
        }
        // Fallback: dùng đường dẫn hiện tại
        return window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    };
    const basePath = getScriptBasePath();

    // 1) Inject CSS trực tiếp vào JS
    const style = document.createElement('style');
    style.textContent = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  overflow: hidden;
  z-index: -1; /* hidden by default */
}

.scene {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-style: preserve-3d;
  transform: translate(-50%, -50%);
}

.item {
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--item-w);
  height: var(--item-h);
  transform-origin: center center;
  background: rgba(255, 255, 255, 0.1);
  border: 0.1vw solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.item iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.menu-label {
  position: absolute;
  bottom: 0; 
  background: rgba(0, 0, 0, 0.5);
  color: #fff; 
  pointer-events: auto;
  z-index: 10;
  text-decoration: none;
  width: 100%;
  height: 10%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  white-space: nowrap;
}

.menu-label-text {
  display: inline-block;
  padding: 0 10px;
  white-space: nowrap;
}

.menu-label.scrolling {
  justify-content: flex-start;
}
 
 
.menu-label.scrolling:hover .menu-label-text {
  animation-play-state: paused;
}

.menu-toggle-btn {
  position: fixed; 
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  transition: top 0.25s ease, left 0.25s ease; 
}

.menu-toggle-btn.dragging {
  cursor: grabbing;
  transition: none !important;
}

.menu-toggle-btn img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}
`;
    document.head.appendChild(style);

    const updateHeightRateVar = () => {
        const rate = window.innerHeight / Math.max(1, window.innerWidth);
        document.documentElement.style.setProperty('--height-rate', rate);
    };
    updateHeightRateVar();

    // 2) Tạo menu & scene container
    const menu = document.createElement('div');
    menu.className = 'menu';
    document.body.appendChild(menu);

    const scene = document.createElement('div');
    scene.className = 'scene';
    scene.id = 'scene';
    menu.appendChild(scene);

    // Nút toggle nổi (phù hợp với markup index.html)
    const toggleBtn = document.querySelector('.menu-toggle-btn') || document.createElement('button');
    if (!toggleBtn.classList.contains('menu-toggle-btn')) {
        toggleBtn.className = 'menu-toggle-btn';
        toggleBtn.textContent = '';
        document.body.appendChild(toggleBtn);
    }
    toggleBtn.type = 'button';
    toggleBtn.textContent = '';

    let toggleImg = toggleBtn.querySelector('img');
    if (!toggleImg) {
        toggleImg = document.createElement('img');
        toggleImg.alt = 'Menu toggle';
        toggleBtn.appendChild(toggleImg);
    }

    // 3) Load config.json và khởi tạo carousel 3D
    fetch(basePath + 'config.json')
    .then(r => r.json())
    .then(init)
    .catch(console.error);

    function init(cfg) {
    // Debug: kiểm tra config
    console.log('Loaded config:', cfg);
    // Snap margin trực tiếp trong JS (giảm khoảng cách với lề)
    const SNAP_MARGIN_VW = 0;
    const breakpoint = typeof cfg.breakpoint === 'number' ? cfg.breakpoint : window.innerWidth;

    let mode = {};
    let zIndexUp = 0;
    let isMenuVisible = false;
    const dragState = {
        active: false,
        pointerId: null,
        offsetX: 0,
        offsetY: 0,
        moved: false,
        blockClick: false
    };

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const viewportWidthValue = () => Math.max(1, window.innerWidth);
    const toViewportUnits = value => (value / viewportWidthValue()) * 100;

    const responsiveDims = {
        itemWidth: 0,
        itemHeight: 0,
        radius: 0,
        perspective: 0,
        cameraOffset: 0
    };

    const resolveDimensionValue = value => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            const trimmed = value.trim();
            const match = trimmed.match(/^(-?\d+(?:\.\d+)?)(vw)?$/i);
            if (match) {
                const num = parseFloat(match[1]);
                return num;
            }
            const numeric = parseFloat(trimmed);
            if (!Number.isNaN(numeric)) return numeric;
        }
        return 0;
    };

    const setTogglePosition = (xRatio, yRatio) => {
        toggleBtn.style.left = `${xRatio}vw`;
        toggleBtn.style.top = `${yRatio}vw`;
        toggleBtn.style.right = 'auto';
        toggleBtn.style.bottom = 'auto';
    };

    const recomputeResponsiveDimensions = () => {
        responsiveDims.itemWidth = resolveDimensionValue(mode.itemWidth);
        responsiveDims.itemHeight = resolveDimensionValue(mode.itemHeight);
        responsiveDims.radius = resolveDimensionValue(mode.radius);
        responsiveDims.perspective = resolveDimensionValue(mode.perspective);
        // Ưu tiên đọc từ root level, fallback về mode
        responsiveDims.cameraOffset = typeof cfg.cameraOffset === 'number' ? cfg.cameraOffset : 
            (typeof mode.cameraOffset === 'number' ? mode.cameraOffset : 0);
    };

    const applyResponsiveDimensions = () => {
        document.documentElement.style.setProperty('--item-w', responsiveDims.itemWidth + 'vw');
        document.documentElement.style.setProperty('--item-h', responsiveDims.itemHeight + 'vw');
        menu.style.perspective = responsiveDims.perspective + 'vw';
        const toggleSize = typeof mode.toggleSize === 'number' ? mode.toggleSize : 4.0;
        toggleBtn.style.width = toggleSize + 'vw';
        toggleBtn.style.height = toggleSize + 'vw';
    };

    function snapToNearestEdge() {
        const rect = toggleBtn.getBoundingClientRect();
        const btnWidth = toViewportUnits(rect.width);
        const btnHeight = toViewportUnits(rect.height);
        const snapMargin = SNAP_MARGIN_VW;
        const viewportHeight = toViewportUnits(window.innerHeight);
        const distances = {
            left: toViewportUnits(rect.left),
            right: 100 - toViewportUnits(rect.right),
            top: toViewportUnits(rect.top),
            bottom: viewportHeight - toViewportUnits(rect.bottom)
        };

        let closest = 'left';
        let minDist = distances.left;
        for (const edge of ['right', 'top', 'bottom']) {
            if (distances[edge] < minDist) {
                minDist = distances[edge];
                closest = edge;
            }
        }

        let targetX = toViewportUnits(rect.left);
        let targetY = toViewportUnits(rect.top);

        switch (closest) {
            case 'left':
                targetX = snapMargin;
                targetY = clamp(targetY, snapMargin, viewportHeight - btnHeight - snapMargin);
                break;
            case 'right':
                targetX = 100 - btnWidth - snapMargin;
                targetY = clamp(targetY, snapMargin, viewportHeight - btnHeight - snapMargin);
                break;
            case 'top':
                targetY = snapMargin;
                targetX = clamp(targetX, snapMargin, 100 - btnWidth - snapMargin);
                break;
            case 'bottom':
                targetY = viewportHeight - btnHeight - snapMargin;
                targetX = clamp(targetX, snapMargin, 100 - btnWidth - snapMargin);
                break;
        }

        setTogglePosition(targetX, targetY);
    }

    const applyModeForViewport = () => {
        const isMobile = window.innerWidth <= breakpoint;
        const base = isMobile
            ? (cfg.mobile || cfg.desktop || {})
            : (cfg.desktop || cfg.mobile || {});

        mode = base;

        document.documentElement.classList.toggle('mode-mobile', isMobile);
        document.documentElement.classList.toggle('mode-desktop', !isMobile);

        // Ưu tiên đọc từ root level, fallback về mode
        zIndexUp = typeof cfg.indexUp === 'number' ? cfg.indexUp : 
            (typeof mode.indexUp === 'number' ? mode.indexUp : 0);

        // Set z-index của toggle button = indexUp + 1 để luôn hiển thị trên menu
        toggleBtn.style.zIndex = zIndexUp + 1;

        recomputeResponsiveDimensions();
        applyResponsiveDimensions();
    };

    applyModeForViewport();

    // Tự động thêm đường dẫn icon dựa trên vị trí script
    const iconClosed = basePath + 'icon/' + cfg.iconClosed;
    const iconOpen = basePath + 'icon/' + cfg.iconOpen;
    toggleImg.src = iconClosed;

    // Set vị trí ban đầu: giữa chiều cao và sát lề phải
    const setInitialTogglePosition = () => {
        // Tắt transition tạm thời để tránh giật
        toggleBtn.style.transition = 'none';
        const viewportHeight = toViewportUnits(window.innerHeight);
        const btnHeight = toViewportUnits(toggleBtn.offsetHeight);
        const btnWidth = toViewportUnits(toggleBtn.offsetWidth);
        const snapMargin = SNAP_MARGIN_VW;
        // Giữa chiều cao (50% - một nửa chiều cao button)
        const centerY = (viewportHeight - btnHeight) / 2;
        // Sát lề phải (100% - width - margin nhỏ)
        const rightX = 100 - btnWidth - snapMargin;
        setTogglePosition(rightX, centerY);
        // Bật lại transition sau khi set xong
        requestAnimationFrame(() => {
            toggleBtn.style.transition = '';
        });
    };
    
    // Set vị trí ban đầu ngay lập tức, không chờ
    setInitialTogglePosition();
    // Cập nhật lại sau khi có kích thước chính xác
    setTimeout(setInitialTogglePosition, 50);

    function setMenuVisible(state) {
        isMenuVisible = state;
        menu.style.zIndex = isMenuVisible ? zIndexUp : -1;
        toggleBtn.setAttribute('aria-pressed', String(isMenuVisible));
        toggleBtn.setAttribute('aria-label', isMenuVisible ? 'Hide 3D menu' : 'Show 3D menu');
        toggleBtn.title = isMenuVisible ? 'Hide 3D menu' : 'Show 3D menu';
        toggleImg.src = isMenuVisible ? iconOpen : iconClosed;
    }

    toggleBtn.addEventListener('click', () => {
        if (dragState.blockClick) {
            dragState.blockClick = false;
            return;
        }
        setMenuVisible(!isMenuVisible);
    });

    setMenuVisible(false);

    toggleBtn.addEventListener('pointerdown', e => {
        if (e.button !== 0) return;
        e.preventDefault();
        const rect = toggleBtn.getBoundingClientRect();
        const leftRatio = toViewportUnits(rect.left);
        const topRatio = toViewportUnits(rect.top);
        setTogglePosition(leftRatio, topRatio);

        dragState.active = true;
        dragState.pointerId = e.pointerId;
        dragState.offsetX = toViewportUnits(e.clientX - rect.left);
        dragState.offsetY = toViewportUnits(e.clientY - rect.top);
        dragState.moved = false;
        toggleBtn.classList.add('dragging');
        toggleBtn.setPointerCapture(e.pointerId);
    });

    const handlePointerMove = e => {
        if (!dragState.active || dragState.pointerId !== e.pointerId) return;
        dragState.moved = true;
        const widthRatio = toViewportUnits(toggleBtn.offsetWidth);
        const heightRatio = toViewportUnits(toggleBtn.offsetHeight);
        const snapMargin = SNAP_MARGIN_VW;
        const maxX = 100 - widthRatio - snapMargin;
        const maxY = toViewportUnits(window.innerHeight) - heightRatio - snapMargin;
        const pointerX = toViewportUnits(e.clientX);
        const pointerY = toViewportUnits(e.clientY);
        const x = clamp(pointerX - dragState.offsetX, snapMargin, Math.max(snapMargin, maxX));
        const y = clamp(pointerY - dragState.offsetY, snapMargin, Math.max(snapMargin, maxY));
        setTogglePosition(x, y);
    };

    const endDrag = e => {
        if (!dragState.active || (e.pointerId !== dragState.pointerId)) return;
        dragState.active = false;
        dragState.blockClick = dragState.moved;
        dragState.pointerId = null;
        toggleBtn.classList.remove('dragging');
        try { toggleBtn.releasePointerCapture(e.pointerId); } catch (_) {}
        snapToNearestEdge();
        dragState.moved = false;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    // Không snap ngay, giữ vị trí ban đầu (giữa chiều cao, sát lề phải)

    // Ẩn menu khi nhấn ESC
    window.addEventListener('keydown', e => {
        if (e.key === 'Escape' && isMenuVisible) setMenuVisible(false);
    });

    // Cập nhật font-size của labels dựa trên height của chính nó
    const updateLabelFontSizes = () => {
        const labels = document.querySelectorAll('.menu-label');
        labels.forEach(label => {
            const height = label.offsetHeight;
            // font-size = 50% của height (có thể cấu hình)
            const fontSizeRatio = typeof mode.labelFontSizeRatio === 'number' ? mode.labelFontSizeRatio : 0.5;
            label.style.fontSize = (height * fontSizeRatio) + 'px';
        });
    };

    // Hàm kiểm tra và áp dụng scroll effect
    const checkAndApplyScroll = () => {
        const labels = document.querySelectorAll('.menu-label');
        labels.forEach((label, index) => {
            const textSpan = label.querySelector('.menu-label-text');
            if (!textSpan) return;
            
            // Đảm bảo có index để tạo keyframe unique
            if (!label.dataset.scrollIndex) {
                label.dataset.scrollIndex = index;
            }
            const scrollIndex = label.dataset.scrollIndex;
            
            const labelWidth = label.offsetWidth;
            const textWidth = textSpan.scrollWidth;
            
            // Nếu text dài hơn container thì thêm class scrolling
            if (textWidth > labelWidth) {
                label.classList.add('scrolling');
                
                // Tính toán vị trí bắt đầu và kết thúc
                // Bắt đầu từ bên phải của label (labelWidth) và kết thúc ở bên trái (-textWidth)
                const startX = labelWidth;
                const endX = -textWidth;
                const distance = startX - endX;
                
                // Tính thời gian animation dựa trên độ dài text (tốc độ ~50px/s)
                const speed = 50; // pixels per second
                const duration = Math.max(5, distance / speed);
                
                // Tạo keyframes động với tên unique
                const keyframeName = `scrollText-${scrollIndex}`;
                const keyframes = `
                    @keyframes ${keyframeName} {
                        0% {
                            transform: translateX(${startX}px);
                        }
                        100% {
                            transform: translateX(${endX}px);
                        }
                    }
                `;
                
                // Thêm hoặc cập nhật style cho keyframes này
                let styleId = `scrollStyle-${scrollIndex}`;
                let existingStyle = document.getElementById(styleId);
                if (existingStyle) {
                    existingStyle.textContent = keyframes;
                } else {
                    existingStyle = document.createElement('style');
                    existingStyle.id = styleId;
                    existingStyle.textContent = keyframes;
                    document.head.appendChild(existingStyle);
                }
                
                // Áp dụng animation
                textSpan.style.animation = `${keyframeName} ${duration}s linear infinite`;
            } else {
                label.classList.remove('scrolling');
                textSpan.style.animation = '';
            }
        });
    };

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
            
            // Thêm wrapper cho text
            const textSpan = document.createElement('span');
            textSpan.className = 'menu-label-text';
            textSpan.textContent = c.title;
            a.appendChild(textSpan);
            
            el.appendChild(a);
        }

        scene.appendChild(el);
    });

    // Cập nhật font-size sau khi tạo labels và khi resize
    setTimeout(() => {
        updateLabelFontSizes();
        // Delay thêm một chút để đảm bảo layout đã render
        setTimeout(() => {
            checkAndApplyScroll(); // Kiểm tra scroll sau khi render
        }, 100);
    }, 0);

    // Slider logic
    let rotX = 0, rotY = 0, isPaused = false, pauseTO = null;
    const elems = Array.from(scene.children);

    function update() {
        const radiusValue = responsiveDims.radius;
        const cameraOffset = responsiveDims.cameraOffset;
        // Tính vị trí camera: cameraOffset = 0 → ở tâm, âm → trong, dương → ngoài
        const cameraZ = -radiusValue - cameraOffset;
        scene.style.transform =
        `translate(-50%,-50%) translateZ(${cameraZ}vw)` +
        ` rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        elems.forEach(el => {
        const a = el.dataset.angle;
        el.style.transform =
            `translate(-50%,-50%) rotateY(${a}deg) translateZ(${radiusValue}vw)`;
        });
    }

    function pauseForever() {
        isPaused = true;
        clearTimeout(pauseTO);
    }
    function resumeAfter() {
        clearTimeout(pauseTO);
        // Ưu tiên đọc từ root level, fallback về mode
        const timeAuto = typeof cfg.timeAuto === 'number' ? cfg.timeAuto : 
            (typeof mode.timeAuto === 'number' ? mode.timeAuto : 0);
        pauseTO = setTimeout(() => isPaused = false, timeAuto);
    }

    // Vẽ lần đầu
    update();
    // Cập nhật font-size sau khi render
    setTimeout(() => {
        updateLabelFontSizes();
        // Delay thêm để đảm bảo layout đã ổn định
        setTimeout(() => {
            checkAndApplyScroll();
        }, 150);
    }, 100);

    // Auto rotate
    (function animate() {
        if (!isPaused) {
        // Ưu tiên đọc từ root level, fallback về mode
        const speed = typeof cfg.autoRotateSpeed === 'number' ? cfg.autoRotateSpeed : 
            (typeof mode.autoRotateSpeed === 'number' ? mode.autoRotateSpeed : 0);
        rotY += speed;
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
        // Ưu tiên đọc từ root level, fallback về mode
        const scrollSpeed = typeof cfg.scrollRotateSpeed === 'number' ? cfg.scrollRotateSpeed : 
            (typeof mode.scrollRotateSpeed === 'number' ? mode.scrollRotateSpeed : 0);
        rotY += e.deltaY > 0 ? scrollSpeed : -scrollSpeed;
        update();
        pauseForever();
        resumeAfter();
        },
        { passive: false }
    );

    const handleResize = () => {
        updateHeightRateVar();
        applyModeForViewport();
        snapToNearestEdge();
        update();
        updateLabelFontSizes();
        checkAndApplyScroll(); // Kiểm tra lại khi resize
    };
    window.addEventListener('resize', handleResize);
    }
});