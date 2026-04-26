/**
 * 造梦空间 APP - 主逻辑
 * 功能：登录注册、页面导航、数据管理
 */

// ========== 数据存储 ==========
const DB_KEY = 'zaomeng_app_data';

// 默认剧本数据
const SCRIPTS_DATA = [
    {
        id: 1,
        title: '迷雾山庄',
        type: '悬疑',
        rating: 9.2,
        players: '5人',
        duration: '4小时',
        price: 188,
        cover: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        desc: '暴雨夜，山庄内接连发生诡异事件，真相扑朔迷离...',
        fullDesc: '暴雨之夜，五位素不相识的客人被困在偏僻的山庄中。午夜时分，山庄主人离奇死亡，而此时山庄已被暴雨冲垮了唯一的出路。在场的每一个人都有嫌疑，每一个人都藏着不可告人的秘密。你需要与时间赛跑，在黎明到来之前找出真凶，否则下一个受害者可能就是你...',
        location: '黄山风景区 · 西海大峡谷',
        scenes: ['客厅', '书房', '卧室', '地下室', '花园'],
        difficulty: '中等',
        tags: ['推理', '悬疑', '烧脑']
    },
    {
        id: 2,
        title: '消失的证人',
        type: '恐怖',
        rating: 8.8,
        players: '4人',
        duration: '3小时',
        price: 158,
        cover: 'linear-gradient(135deg, #2d132c 0%, #801336 100%)',
        desc: '证人突然消失，真相扑朔迷离...',
        fullDesc: '一个关键证人在出庭前夕神秘失踪，警方展开调查却发现更多疑点。黑暗中似乎有双眼睛在注视着一切...',
        location: '杭州西湖 · 雷峰塔',
        scenes: ['法院', '证人住所', '暗巷', '废弃工厂'],
        difficulty: '较难',
        tags: ['恐怖', '推理', '悬疑']
    },
    {
        id: 3,
        title: '仙人指路',
        type: '仙侠',
        rating: 9.5,
        players: '6人',
        duration: '5小时',
        price: 268,
        cover: 'linear-gradient(135deg, #0f3443 0%, #34e89e 100%)',
        desc: '黄山之巅，修仙问道的传奇...',
        fullDesc: '黄山之巅，云雾缭绕。传说中，这里是仙人飞升之地。一场奇遇，让你踏上修仙问道之路。六大仙门，三十六洞天，七十二福地，等待你来探索...',
        location: '黄山风景区 · 天海景区',
        scenes: ['仙人桥', '迎客松', '光明顶', '飞来石', '云海'],
        difficulty: '简单',
        tags: ['仙侠', '冒险', '古风']
    },
    {
        id: 4,
        title: '龙凤呈祥',
        type: '爱情',
        rating: 9.0,
        players: '2人',
        duration: '3小时',
        price: 288,
        cover: 'linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)',
        desc: '一段跨越千年的爱情传说...',
        fullDesc: '千年之前，你们曾经相守。如今，命运的齿轮再次转动，让你们在古老的景区中重逢...',
        location: '西湖景区 · 断桥',
        scenes: ['断桥', '白堤', '雷峰塔', '三潭印月'],
        difficulty: '简单',
        tags: ['爱情', '古风', '情侣']
    },
    {
        id: 5,
        title: '江湖夜雨',
        type: '武侠',
        rating: 8.5,
        players: '5人',
        duration: '4小时',
        price: 198,
        cover: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
        desc: '江湖风云，侠骨柔情...',
        fullDesc: '雨夜，客栈，五位江湖人士相遇。一场阴谋正在酝酿，谁能笑到最后？',
        location: '千岛湖景区 · 梅峰观岛',
        scenes: ['客栈', '后院', '密道', '山顶'],
        difficulty: '中等',
        tags: ['武侠', '江湖', '策略']
    },
    {
        id: 6,
        title: '江南烟雨',
        type: '古风',
        rating: 9.3,
        players: '4人',
        duration: '3.5小时',
        price: 168,
        cover: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        desc: '烟雨江南，诗意人生...',
        fullDesc: '江南小镇，烟雨朦胧。你是富家小姐、落魄书生、神秘商人还是江湖侠客？在这个诗意的小镇里，演绎属于你的故事...',
        location: '乌镇景区 · 西栅',
        scenes: ['茶馆', '戏台', '酒楼', '水巷'],
        difficulty: '简单',
        tags: ['古风', '文艺', '休闲']
    }
];

// 用户数据模板
const defaultUserData = {
    isLoggedIn: false,
    phone: '',
    nickname: '',
    avatar: '👤',
    stats: {
        experiences: 0,
        favorites: 0,
        points: 0
    },
    favorites: [],
    orders: [],
    coupons: [
        { id: 1, title: '新人专享', discount: 50, min: 100, expire: '2025-05-31' },
        { id: 2, title: '剧本体验券', discount: 30, min: 200, expire: '2025-06-30' },
        { id: 3, title: '情侣套餐', discount: 100, min: 500, expire: '2025-05-25' }
    ]
};

// ========== 工具函数 ==========

// 获取存储数据
function getStorageData() {
    try {
        const data = localStorage.getItem(DB_KEY);
        return data ? JSON.parse(data) : { ...defaultUserData, users: [] };
    } catch (e) {
        return { ...defaultUserData, users: [] };
    }
}

// 保存存储数据
function saveStorageData(data) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
}

// 显示Toast提示
function showToast(message, duration = 2000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// 显示/隐藏加载
function showLoading() {
    document.getElementById('loading').classList.add('show');
}

function hideLoading() {
    document.getElementById('loading').classList.remove('show');
}

// 更新时间
function updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeEl = document.getElementById('current-time');
    if (timeEl) {
        timeEl.textContent = `${hours}:${minutes}`;
    }
}

// 手机号验证
function isValidPhone(phone) {
    return /^1[3-9]\d{9}$/.test(phone);
}

// ========== 页面导航 ==========

// 当前页面
let currentPage = 'home';

// 切换页面
function navigateTo(pageName, data = null) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // 显示目标页面
    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
        currentPage = pageName;
        
        // 更新底部导航状态
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === pageName) {
                item.classList.add('active');
            }
        });

        // 页面特殊处理
        if (pageName === 'scripts') {
            renderScriptsGrid();
        } else if (pageName === 'script-detail' && data) {
            renderScriptDetail(data);
        } else if (pageName === 'profile') {
            updateProfilePage();
        }
    }
}

// 返回上一页
function goBack(targetPage) {
    navigateTo(targetPage);
}

// ========== 认证系统 ==========

// 初始化认证页面
function initAuthScreen() {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');

    // 标签切换
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            forms.forEach(f => f.classList.remove('active'));
            
            tab.classList.add('active');
            const targetForm = document.getElementById(`${tab.dataset.tab}-form`);
            if (targetForm) {
                targetForm.classList.add('active');
            }
        });
    });

    // 登录表单提交
    document.getElementById('login-form').addEventListener('submit', handleLogin);

    // 注册表单提交
    document.getElementById('register-form').addEventListener('submit', handleRegister);

    // 发送验证码
    document.getElementById('send-code-btn').addEventListener('click', handleSendCode);
}

// 处理登录
function handleLogin(e) {
    e.preventDefault();
    
    const phone = document.getElementById('login-phone').value.trim();
    const password = document.getElementById('login-password').value;

    if (!isValidPhone(phone)) {
        showToast('请输入正确的手机号');
        return;
    }

    if (!password) {
        showToast('请输入密码');
        return;
    }

    showLoading();

    // 模拟登录验证
    setTimeout(() => {
        const data = getStorageData();
        const user = data.users.find(u => u.phone === phone);

        if (!user) {
            hideLoading();
            showToast('该手机号未注册');
            return;
        }

        if (user.password !== password) {
            hideLoading();
            showToast('密码错误');
            return;
        }

        // 登录成功
        data.isLoggedIn = true;
        data.phone = user.phone;
        data.nickname = user.nickname;
        data.avatar = user.avatar || '👤';
        saveStorageData(data);

        hideLoading();
        showToast('登录成功！');
        
        // 跳转到主应用
        setTimeout(() => {
            showMainApp();
        }, 500);
    }, 1000);
}

// 处理注册
function handleRegister(e) {
    e.preventDefault();

    const phone = document.getElementById('register-phone').value.trim();
    const code = document.getElementById('register-code').value.trim();
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    const nickname = document.getElementById('register-nickname').value.trim();
    const agreed = document.getElementById('agree-terms').checked;

    if (!isValidPhone(phone)) {
        showToast('请输入正确的手机号');
        return;
    }

    if (!code || code.length !== 6) {
        showToast('请输入6位验证码');
        return;
    }

    if (password.length < 6 || password.length > 20) {
        showToast('密码需为6-20位');
        return;
    }

    if (password !== confirm) {
        showToast('两次密码不一致');
        return;
    }

    if (!nickname) {
        showToast('请输入昵称');
        return;
    }

    if (!agreed) {
        showToast('请同意用户协议');
        return;
    }

    showLoading();

    setTimeout(() => {
        const data = getStorageData();

        // 检查手机号是否已注册
        if (data.users && data.users.find(u => u.phone === phone)) {
            hideLoading();
            showToast('该手机号已注册');
            return;
        }

        // 创建新用户
        if (!data.users) data.users = [];
        data.users.push({
            phone,
            password,
            nickname,
            avatar: '👤',
            createdAt: new Date().toISOString()
        });

        // 自动登录
        data.isLoggedIn = true;
        data.phone = phone;
        data.nickname = nickname;
        data.avatar = '👤';
        data.stats = { experiences: 0, favorites: 0, points: 100 };

        saveStorageData(data);

        hideLoading();
        showToast('注册成功！赠送100积分');
        
        setTimeout(() => {
            showMainApp();
        }, 500);
    }, 1500);
}

// 发送验证码
let countdownTimer = null;
function handleSendCode() {
    const phone = document.getElementById('register-phone').value.trim();
    const btn = document.getElementById('send-code-btn');

    if (!isValidPhone(phone)) {
        showToast('请输入正确的手机号');
        return;
    }

    // 模拟发送验证码
    btn.disabled = true;
    let seconds = 60;
    btn.textContent = `${seconds}s`;

    countdownTimer = setInterval(() => {
        seconds--;
        if (seconds <= 0) {
            clearInterval(countdownTimer);
            btn.disabled = false;
            btn.textContent = '获取验证码';
        } else {
            btn.textContent = `${seconds}s`;
        }
    }, 1000);

    showToast('验证码已发送');
}

// 退出登录
function handleLogout() {
    const data = getStorageData();
    data.isLoggedIn = false;
    data.phone = '';
    data.nickname = '';
    saveStorageData(data);

    showToast('已退出登录');
    setTimeout(() => {
        showAuthScreen();
    }, 500);
}

// ========== 主应用 ==========

// 显示主应用
function showMainApp() {
    document.getElementById('splash-screen').classList.remove('active');
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('main-app').classList.add('active');

    // 更新用户信息
    updateUserInfo();
}

// 显示认证页面
function showAuthScreen() {
    document.getElementById('splash-screen').classList.remove('active');
    document.getElementById('main-app').classList.remove('active');
    document.getElementById('auth-screen').classList.add('active');
}

// 更新用户信息
function updateUserInfo() {
    const data = getStorageData();
    
    // 更新问候语
    const nameDisplay = document.getElementById('user-name-display');
    if (nameDisplay && data.nickname) {
        nameDisplay.textContent = data.nickname;
    }

    // 更新个人中心
    updateProfilePage();
}

// 更新个人中心页面
function updateProfilePage() {
    const data = getStorageData();
    
    const profileName = document.getElementById('profile-name');
    const profilePhone = document.getElementById('profile-phone');
    
    if (profileName && data.nickname) {
        profileName.textContent = data.nickname;
    }
    
    if (profilePhone && data.phone) {
        // 隐藏中间4位
        profilePhone.textContent = data.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    }

    // 更新统计数据
    const statNums = document.querySelectorAll('.stat-num');
    if (statNums.length >= 3) {
        statNums[0].textContent = data.stats?.experiences || 0;
        statNums[1].textContent = data.stats?.favorites || 0;
        statNums[2].textContent = data.stats?.points || 0;
    }
}

// ========== 剧本渲染 ==========

// 渲染剧本网格
function renderScriptsGrid(filter = '全部') {
    const grid = document.getElementById('scripts-grid');
    if (!grid) return;

    const filteredScripts = filter === '全部' 
        ? SCRIPTS_DATA 
        : SCRIPTS_DATA.filter(s => s.type === filter);

    grid.innerHTML = filteredScripts.map(script => `
        <div class="script-card" data-id="${script.id}" onclick="openScriptDetail(${script.id})">
            <div class="script-cover" style="background: ${script.cover}">
                <span class="script-type">${script.type}</span>
                <span class="script-rating">⭐ ${script.rating}</span>
            </div>
            <div class="script-info">
                <h3>${script.title}</h3>
                <p class="script-desc">${script.desc}</p>
                <div class="script-meta">
                    <span>👥 ${script.players}</span>
                    <span>💰 ${script.price}/人</span>
                </div>
            </div>
        </div>
    `).join('');
}

// 打开剧本详情
function openScriptDetail(scriptId) {
    const script = SCRIPTS_DATA.find(s => s.id === scriptId);
    if (script) {
        navigateTo('script-detail', script);
    }
}

// 渲染剧本详情
function renderScriptDetail(script) {
    const container = document.getElementById('script-detail-content');
    if (!container) return;

    container.innerHTML = `
        <div class="detail-hero" style="background: ${script.cover}">
            <h2>${script.title}</h2>
            <div class="detail-meta">
                <span>⭐ ${script.rating}</span>
                <span>👥 ${script.players}</span>
                <span>⏱️ ${script.duration}</span>
            </div>
        </div>
        
        <div class="detail-body">
            <div class="detail-section">
                <h3>📖 剧本简介</h3>
                <p>${script.fullDesc}</p>
            </div>
            
            <div class="detail-section">
                <h3>📍 活动地点</h3>
                <p>${script.location}</p>
            </div>
            
            <div class="detail-section">
                <h3>🎬 场景设置</h3>
                <div class="scene-tags">
                    ${script.scenes.map(scene => `<span class="scene-tag">${scene}</span>`).join('')}
                </div>
            </div>
            
            <div class="detail-section">
                <h3>🏷️ 标签</h3>
                <div class="scene-tags">
                    ${script.tags.map(tag => `<span class="scene-tag">${tag}</span>`).join('')}
                </div>
            </div>
            
            <div class="detail-info-bar">
                <div class="detail-price">
                    <span class="price-label">价格</span>
                    <span class="price-value">¥${script.price}/人</span>
                </div>
                <button class="btn-primary btn-book" onclick="navigateTo('booking')">
                    立即预约
                </button>
            </div>
        </div>
    `;
}

// ========== 轮播图 ==========

let currentSlide = 0;
const totalSlides = 3;

function initCarousel() {
    setInterval(() => {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateCarousel();
    }, 4000);
}

function updateCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');

    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentSlide);
    });

    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

// ========== 事件绑定 ==========

function initEventListeners() {
    // 底部导航
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            if (page) {
                navigateTo(page);
            }
        });
    });

    // 返回按钮
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.back;
            if (target) {
                goBack(target);
            }
        });
    });

    // 快捷入口
    document.querySelectorAll('.action-item').forEach(item => {
        item.addEventListener('click', () => {
            const action = item.dataset.action;
            if (action) {
                navigateTo(action);
            }
        });
    });

    // 更多链接
    document.querySelectorAll('.more-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            if (page) {
                navigateTo(page);
            }
        });
    });

    // 筛选栏
    document.querySelectorAll('.filter-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.filter-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            renderScriptsGrid(item.textContent);
        });
    });

    // 剧本卡片点击（首页）
    document.querySelectorAll('.script-card[data-id]').forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.dataset.id);
            if (id) {
                openScriptDetail(id);
            }
        });
    });

    // 退出登录
    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    // 预约日期选择
    document.querySelectorAll('.date-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.date-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // 预约时间选择
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.addEventListener('click', () => {
            document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('active'));
            slot.classList.add('active');
        });
    });

    // 人数计数器
    const counterMinus = document.querySelector('.counter-btn.minus');
    const counterPlus = document.querySelector('.counter-btn.plus');
    const counterValue = document.querySelector('.counter-value');
    const totalPrice = document.querySelector('.total-price');

    if (counterMinus && counterPlus && counterValue) {
        let count = 2;
        const pricePerPerson = 188;

        counterMinus.addEventListener('click', () => {
            if (count > 1) {
                count--;
                counterValue.textContent = count;
                if (totalPrice) {
                    totalPrice.textContent = `¥${count * pricePerPerson}`;
                }
            }
        });

        counterPlus.addEventListener('click', () => {
            if (count < 10) {
                count++;
                counterValue.textContent = count;
                if (totalPrice) {
                    totalPrice.textContent = `¥${count * pricePerPerson}`;
                }
            }
        });
    }

    // 确认预约
    document.querySelector('.btn-booking')?.addEventListener('click', () => {
        showLoading();
        setTimeout(() => {
            hideLoading();
            showToast('预约成功！');
            navigateTo('profile');
        }, 1500);
    });

    // 申请创作者
    document.getElementById('apply-creator-btn')?.addEventListener('click', () => {
        showToast('申请已提交，请等待审核');
    });
}

// ========== 初始化 ==========

function init() {
    // 更新时间
    updateTime();
    setInterval(updateTime, 60000);

    // 初始化轮播图
    initCarousel();

    // 初始化认证页面
    initAuthScreen();

    // 初始化事件监听
    initEventListeners();

    // 检查登录状态
    setTimeout(() => {
        const data = getStorageData();
        
        if (data.isLoggedIn) {
            showMainApp();
        } else {
            showAuthScreen();
        }
    }, 2500); // 等待启动动画完成
}

// 启动应用
document.addEventListener('DOMContentLoaded', init);
