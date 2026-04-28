/**
 * 造梦空间 - 创作者工作室
 * 功能：剧本创作、配图管理、提交审核
 */

// ========== 数据库配置 ==========
const CREATOR_DB_KEY = 'zaomeng_creators_db';
const SCRIPTS_DB_KEY = 'zaomeng_scripts_db';
const USER_DB_KEY = 'zaomeng_app_data';

// 创作者等级配置
const CREATOR_TIERS = {
    basic: {
        name: '基础创作者',
        color: '#4facfe',
        scriptLimit: 3,
        maxScenes: 5,
        maxNPCs: 5,
        features: ['基础场景编辑', '简单NPC对话', '基础谜题']
    },
    silver: {
        name: '白银创作者',
        color: '#C0C0C0',
        scriptLimit: 10,
        maxScenes: 15,
        maxNPCs: 15,
        features: ['高级场景编辑', '分支剧情', '复杂谜题', '数据分析']
    },
    gold: {
        name: '黄金创作者',
        color: '#FFD700',
        scriptLimit: 999,
        maxScenes: 50,
        maxNPCs: 50,
        features: ['完整功能', '优先推荐', '专属客服', '定制活动']
    }
};

// 默认剧本模板
const DEFAULT_SCRIPT_TEMPLATE = {
    id: '',
    creatorId: '',
    title: '',
    type: '悬疑',
    difficulty: '中等',
    players: { min: 2, max: 8 },
    duration: 4,
    price: 168,
    cover: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    desc: '',
    fullDesc: '',
    location: '',
    tags: [],
    scenes: [],
    npcs: [],
    puzzles: [],
    rewards: [],
    status: 'draft', // draft, pending, approved, rejected
    createdAt: '',
    updatedAt: '',
    submittedAt: '',
    reviewedAt: '',
    reviewNote: '',
    stats: {
        plays: 0,
        favorites: 0,
        rating: 0,
        revenue: 0
    }
};

// ========== 数据库操作 ==========

function getCreatorDB() {
    try {
        const data = localStorage.getItem(CREATOR_DB_KEY);
        return data ? JSON.parse(data) : { 
            creators: [], 
            applications: [],
            transactions: []
        };
    } catch (e) {
        return { creators: [], applications: [], transactions: [] };
    }
}

function saveCreatorDB(data) {
    localStorage.setItem(CREATOR_DB_KEY, JSON.stringify(data));
}

function getScriptsDB() {
    try {
        const data = localStorage.getItem(SCRIPTS_DB_KEY);
        return data ? JSON.parse(data) : { scripts: [] };
    } catch (e) {
        return { scripts: [] };
    }
}

function saveScriptsDB(data) {
    localStorage.setItem(SCRIPTS_DB_KEY, JSON.stringify(data));
}

function getUserData() {
    try {
        const data = localStorage.getItem(USER_DB_KEY);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        return null;
    }
}

// ========== 权限检查 ==========

function checkCreatorAccess() {
    const user = getUserData();
    if (!user || !user.isLoggedIn) {
        showToast('请先登录', 2000);
        setTimeout(() => window.location.href = 'index.html', 1500);
        return false;
    }
    
    if (!user.isCreator) {
        showToast('您还不是创作者，请先申请', 2000);
        setTimeout(() => window.location.href = 'index.html', 1500);
        return false;
    }
    
    // 检查保证金状态
    const creatorDB = getCreatorDB();
    const creator = creatorDB.creators.find(c => c.id === user.creatorId);
    
    if (!creator || !creator.depositPaid) {
        showToast('请先支付保证金', 2000);
        setTimeout(() => showDepositModal(), 500);
        return false;
    }
    
    return true;
}

function getCurrentCreator() {
    const user = getUserData();
    if (!user || !user.creatorId) return null;
    
    const creatorDB = getCreatorDB();
    return creatorDB.creators.find(c => c.id === user.creatorId);
}

// ========== 页面初始化 ==========

let currentView = 'dashboard';
let currentScript = null;
let editingScene = null;
let editingNPC = null;

function init() {
    // 检查权限
    if (!checkCreatorAccess()) return;
    
    // 加载创作者数据
    loadCreatorData();
    
    // 初始化UI
    initNavigation();
    initEventListeners();
    
    // 显示控制台（如果有未读消息）
    checkNotifications();
}

function loadCreatorData() {
    const creator = getCurrentCreator();
    if (!creator) return;
    
    // 更新仪表盘
    updateDashboard(creator);
    
    // 加载剧本列表
    loadScriptsList(creator.id);
}

function updateDashboard(creator) {
    // 更新创作者信息
    const nameEl = document.getElementById('creator-name');
    const tierEl = document.getElementById('creator-tier');
    const statsEl = document.getElementById('creator-stats');
    
    if (nameEl) nameEl.textContent = creator.name || '创作者';
    if (tierEl) {
        const tier = CREATOR_TIERS[creator.tier] || CREATOR_TIERS.basic;
        tierEl.textContent = tier.name;
        tierEl.style.color = tier.color;
    }
    
    if (statsEl) {
        statsEl.innerHTML = `
            <div class="stat-card">
                <span class="stat-icon">📚</span>
                <span class="stat-value">${creator.stats?.scripts || 0}</span>
                <span class="stat-label">剧本数</span>
            </div>
            <div class="stat-card">
                <span class="stat-icon">👥</span>
                <span class="stat-value">${creator.stats?.totalPlays || 0}</span>
                <span class="stat-label">总游玩</span>
            </div>
            <div class="stat-card">
                <span class="stat-icon">💰</span>
                <span class="stat-value">¥${(creator.stats?.totalRevenue || 0).toFixed(2)}</span>
                <span class="stat-label">总收益</span>
            </div>
            <div class="stat-card">
                <span class="stat-icon">⭐</span>
                <span class="stat-value">${creator.stats?.followers || 0}</span>
                <span class="stat-label">粉丝</span>
            </div>
        `;
    }
}

function loadScriptsList(creatorId) {
    const scriptsDB = getScriptsDB();
    const creatorScripts = scriptsDB.scripts.filter(s => s.creatorId === creatorId);
    
    const listEl = document.getElementById('scripts-list');
    if (!listEl) return;
    
    if (creatorScripts.length === 0) {
        listEl.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📝</span>
                <p>还没有创建剧本</p>
                <button class="btn-primary" onclick="createNewScript()">
                    创建第一个剧本
                </button>
            </div>
        `;
        return;
    }
    
    listEl.innerHTML = creatorScripts.map(script => `
        <div class="script-item" data-id="${script.id}">
            <div class="script-cover-mini" style="background: ${script.cover}">
                ${getStatusBadge(script.status)}
            </div>
            <div class="script-info-mini">
                <h4>${script.title || '未命名剧本'}</h4>
                <p>${script.type} · ${script.difficulty} · ${script.players.min}-${script.players.max}人</p>
                <span class="script-date">${script.updatedAt ? new Date(script.updatedAt).toLocaleDateString('zh-CN') : ''}</span>
            </div>
            <div class="script-actions">
                <button class="action-btn-small" onclick="editScript('${script.id}')" title="编辑">✏️</button>
                <button class="action-btn-small" onclick="previewScript('${script.id}')" title="预览">👁️</button>
                <button class="action-btn-small" onclick="deleteScript('${script.id}')" title="删除">🗑️</button>
            </div>
        </div>
    `).join('');
}

function getStatusBadge(status) {
    const badges = {
        draft: '<span class="status-badge draft">草稿</span>',
        pending: '<span class="status-badge pending">审核中</span>',
        approved: '<span class="status-badge approved">已上线</span>',
        rejected: '<span class="status-badge rejected">未通过</span>'
    };
    return badges[status] || badges.draft;
}

// ========== 导航 ==========

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const view = item.dataset.view;
            if (view) switchView(view);
        });
    });
}

function switchView(viewName) {
    // 更新导航状态
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.view === viewName);
    });
    
    // 更新内容区域
    document.querySelectorAll('.view-content').forEach(content => {
        content.classList.toggle('active', content.id === `${viewName}-view`);
    });
    
    currentView = viewName;
    
    // 视图特定初始化
    switch(viewName) {
        case 'scripts':
            loadScriptsList(getCurrentCreator()?.id);
            break;
        case 'analytics':
            loadAnalytics();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// ========== 事件监听 ==========

function initEventListeners() {
    // 新建剧本按钮
    const createBtn = document.getElementById('create-script-btn');
    if (createBtn) {
        createBtn.addEventListener('click', createNewScript);
    }
    
    // 支付保证金按钮
    const depositBtn = document.getElementById('pay-deposit-btn');
    if (depositBtn) {
        depositBtn.addEventListener('click', showDepositModal);
    }
    
    // 保存剧本基础信息
    const basicInfoForm = document.getElementById('basic-info-form');
    if (basicInfoForm) {
        basicInfoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveBasicInfo();
        });
    }
    
    // 添加场景按钮
    const addSceneBtn = document.getElementById('add-scene-btn');
    if (addSceneBtn) {
        addSceneBtn.addEventListener('click', addNewScene);
    }
    
    // 添加NPC按钮
    const addNPCBtn = document.getElementById('add-npc-btn');
    if (addNPCBtn) {
        addNPCBtn.addEventListener('click', addNewNPC);
    }
    
    // 提交审核按钮
    const submitBtn = document.getElementById('submit-review-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitForReview);
    }
    
    // 保存草稿按钮
    const saveDraftBtn = document.getElementById('save-draft-btn');
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', saveDraft);
    }
}

// ========== 剧本创建/编辑 ==========

function createNewScript() {
    const creator = getCurrentCreator();
    if (!creator) return;
    
    const tier = CREATOR_TIERS[creator.tier] || CREATOR_TIERS.basic;
    const scriptsDB = getScriptsDB();
    const creatorScripts = scriptsDB.scripts.filter(s => s.creatorId === creator.id);
    
    if (creatorScripts.length >= tier.scriptLimit) {
        showToast(`您当前等级最多创建 ${tier.scriptLimit} 个剧本`);
        return;
    }
    
    // 创建新剧本
    currentScript = {
        ...DEFAULT_SCRIPT_TEMPLATE,
        id: 'script_' + Date.now(),
        creatorId: creator.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // 打开编辑页面
    openScriptEditor();
}

function editScript(scriptId) {
    const scriptsDB = getScriptsDB();
    const script = scriptsDB.scripts.find(s => s.id === scriptId);
    
    if (!script) {
        showToast('剧本不存在');
        return;
    }
    
    currentScript = script;
    openScriptEditor();
}

function openScriptEditor() {
    // 切换到编辑视图
    switchView('create');
    
    // 填充表单数据
    fillScriptForm(currentScript);
    
    // 渲染场景列表
    renderScenesList();
    
    // 渲染NPC列表
    renderNPCsList();
}

function fillScriptForm(script) {
    // 基础信息
    const fields = ['title', 'type', 'difficulty', 'players-min', 'players-max', 'duration', 'price', 'desc', 'fullDesc', 'location'];
    fields.forEach(field => {
        const el = document.getElementById(`script-${field}`);
        if (el) {
            if (field === 'desc' || field === 'fullDesc' || field === 'location') {
                el.value = script[field] || '';
            } else if (field.startsWith('players-')) {
                const key = field.replace('players-', '');
                el.value = script.players?.[key] || 2;
            } else {
                el.value = script[field] || '';
            }
        }
    });
    
    // 类型选择
    const typeSelect = document.getElementById('script-type');
    if (typeSelect) {
        typeSelect.value = script.type || '悬疑';
    }
    
    // 难度选择
    const diffSelect = document.getElementById('script-difficulty');
    if (diffSelect) {
        diffSelect.value = script.difficulty || '中等';
    }
    
    // 封面颜色
    const coverInput = document.getElementById('script-cover');
    if (coverInput && script.cover) {
        coverInput.value = script.cover;
    }
    
    // 标签
    const tagsInput = document.getElementById('script-tags');
    if (tagsInput) {
        tagsInput.value = (script.tags || []).join(', ');
    }
}

function saveBasicInfo() {
    if (!currentScript) return;
    
    // 收集表单数据
    currentScript.title = document.getElementById('script-title')?.value || '';
    currentScript.type = document.getElementById('script-type')?.value || '';
    currentScript.difficulty = document.getElementById('script-difficulty')?.value || '';
    currentScript.players = {
        min: parseInt(document.getElementById('script-players-min')?.value) || 2,
        max: parseInt(document.getElementById('script-players-max')?.value) || 8
    };
    currentScript.duration = parseInt(document.getElementById('script-duration')?.value) || 4;
    currentScript.price = parseInt(document.getElementById('script-price')?.value) || 168;
    currentScript.desc = document.getElementById('script-desc')?.value || '';
    currentScript.fullDesc = document.getElementById('script-fullDesc')?.value || '';
    currentScript.location = document.getElementById('script-location')?.value || '';
    currentScript.cover = document.getElementById('script-cover')?.value || currentScript.cover;
    currentScript.tags = (document.getElementById('script-tags')?.value || '').split(',').map(t => t.trim()).filter(t => t);
    currentScript.updatedAt = new Date().toISOString();
    
    // 保存到数据库
    const scriptsDB = getScriptsDB();
    const index = scriptsDB.scripts.findIndex(s => s.id === currentScript.id);
    if (index >= 0) {
        scriptsDB.scripts[index] = currentScript;
    } else {
        scriptsDB.scripts.push(currentScript);
    }
    saveScriptsDB(scriptsDB);
    
    showToast('基础信息已保存');
}

function saveDraft() {
    if (!currentScript) return;
    
    currentScript.status = 'draft';
    currentScript.updatedAt = new Date().toISOString();
    
    const scriptsDB = getScriptsDB();
    const index = scriptsDB.scripts.findIndex(s => s.id === currentScript.id);
    if (index >= 0) {
        scriptsDB.scripts[index] = currentScript;
    } else {
        scriptsDB.scripts.push(currentScript);
    }
    saveScriptsDB(scriptsDB);
    
    showToast('草稿已保存');
    
    // 返回剧本列表
    setTimeout(() => switchView('scripts'), 1000);
}

function submitForReview() {
    if (!currentScript) return;
    
    // 验证必填项
    if (!currentScript.title) {
        showToast('请填写剧本名称');
        return;
    }
    if (!currentScript.desc || !currentScript.fullDesc) {
        showToast('请填写剧本描述');
        return;
    }
    if (!currentScript.scenes || currentScript.scenes.length === 0) {
        showToast('请至少添加一个场景');
        return;
    }
    
    // 确认提交
    if (!confirm('确认提交审核？提交后将无法编辑，直到审核结束。')) {
        return;
    }
    
    currentScript.status = 'pending';
    currentScript.submittedAt = new Date().toISOString();
    currentScript.updatedAt = new Date().toISOString();
    
    const scriptsDB = getScriptsDB();
    const index = scriptsDB.scripts.findIndex(s => s.id === currentScript.id);
    if (index >= 0) {
        scriptsDB.scripts[index] = currentScript;
    } else {
        scriptsDB.scripts.push(currentScript);
    }
    saveScriptsDB(scriptsDB);
    
    showToast('已提交审核，请等待管理员审批');
    
    // 返回剧本列表
    setTimeout(() => switchView('scripts'), 1500);
}

// ========== 场景管理 ==========

function addNewScene() {
    const creator = getCurrentCreator();
    const tier = CREATOR_TIERS[creator?.tier] || CREATOR_TIERS.basic;
    
    if (currentScript.scenes && currentScript.scenes.length >= tier.maxScenes) {
        showToast(`您当前等级最多添加 ${tier.maxScenes} 个场景`);
        return;
    }
    
    const scene = {
        id: 'scene_' + Date.now(),
        name: '',
        description: '',
        image: '',
        npcs: [],
        items: [],
        puzzles: [],
        connections: []
    };
    
    if (!currentScript.scenes) currentScript.scenes = [];
    currentScript.scenes.push(scene);
    
    renderScenesList();
    
    // 打开编辑弹窗
    setTimeout(() => editScene(scene.id), 100);
}

function editScene(sceneId) {
    const scene = currentScript.scenes.find(s => s.id === sceneId);
    if (!scene) return;
    
    editingScene = scene;
    
    // 填充弹窗表单
    document.getElementById('scene-name').value = scene.name || '';
    document.getElementById('scene-description').value = scene.description || '';
    document.getElementById('scene-image').value = scene.image || '';
    
    // 显示弹窗
    showModal('scene-edit-modal');
}

function saveScene() {
    if (!editingScene) return;
    
    editingScene.name = document.getElementById('scene-name').value;
    editingScene.description = document.getElementById('scene-description').value;
    editingScene.image = document.getElementById('scene-image').value;
    
    // 更新数据库
    const scriptsDB = getScriptsDB();
    const index = scriptsDB.scripts.findIndex(s => s.id === currentScript.id);
    if (index >= 0) {
        scriptsDB.scripts[index] = currentScript;
        saveScriptsDB(scriptsDB);
    }
    
    hideModal('scene-edit-modal');
    renderScenesList();
    showToast('场景已保存');
}

function deleteScene(sceneId) {
    if (!confirm('确定删除此场景？')) return;
    
    currentScript.scenes = currentScript.scenes.filter(s => s.id !== sceneId);
    
    // 更新数据库
    const scriptsDB = getScriptsDB();
    const index = scriptsDB.scripts.findIndex(s => s.id === currentScript.id);
    if (index >= 0) {
        scriptsDB.scripts[index] = currentScript;
        saveScriptsDB(scriptsDB);
    }
    
    renderScenesList();
    showToast('场景已删除');
}

function renderScenesList() {
    const container = document.getElementById('scenes-list');
    if (!container || !currentScript) return;
    
    const scenes = currentScript.scenes || [];
    
    if (scenes.length === 0) {
        container.innerHTML = `
            <div class="empty-list-hint">
                <p>还没有添加场景</p>
                <button class="btn-secondary btn-sm" onclick="addNewScene()">添加第一个场景</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = scenes.map((scene, index) => `
        <div class="scene-card" data-id="${scene.id}">
            <div class="scene-number">${index + 1}</div>
            <div class="scene-preview" style="${scene.image ? `background-image: url(${scene.image})` : ''}">
                ${scene.image ? '' : '<span class="scene-placeholder-icon">🏠</span>'}
            </div>
            <div class="scene-details">
                <h4>${scene.name || '未命名场景'}</h4>
                <p>${scene.description || '暂无描述'}</p>
                <div class="scene-meta">
                    <span>👤 ${scene.npcs?.length || 0} NPC</span>
                    <span>🧩 ${scene.puzzles?.length || 0} 谜题</span>
                    <span>📦 ${scene.items?.length || 0} 道具</span>
                </div>
            </div>
            <div class="scene-actions">
                <button class="btn-icon" onclick="editScene('${scene.id}')" title="编辑">✏️</button>
                <button class="btn-icon" onclick="deleteScene('${scene.id}')" title="删除">🗑️</button>
            </div>
        </div>
    `).join('');
}

// ========== NPC管理 ==========

function addNewNPC() {
    const creator = getCurrentCreator();
    const tier = CREATOR_TIERS[creator?.tier] || CREATOR_TIERS.basic;
    
    if (currentScript.npcs && currentScript.npcs.length >= tier.maxNPCs) {
        showToast(`您当前等级最多添加 ${tier.maxNPCs} 个NPC`);
        return;
    }
    
    const npc = {
        id: 'npc_' + Date.now(),
        name: '',
        role: '',
        avatar: '',
        description: '',
        dialogues: [],
        isMurderer: false
    };
    
    if (!currentScript.npcs) currentScript.npcs = [];
    currentScript.npcs.push(npc);
    
    renderNPCsList();
    
    // 打开编辑弹窗
    setTimeout(() => editNPC(npc.id), 100);
}

function editNPC(npcId) {
    const npc = currentScript.npcs.find(n => n.id === npcId);
    if (!npc) return;
    
    editingNPC = npc;
    
    // 填充弹窗表单
    document.getElementById('npc-name').value = npc.name || '';
    document.getElementById('npc-role').value = npc.role || '';
    document.getElementById('npc-avatar').value = npc.avatar || '';
    document.getElementById('npc-description').value = npc.description || '';
    document.getElementById('npc-is-murderer').checked = npc.isMurderer || false;
    
    // 渲染对话列表
    renderDialoguesList();
    
    // 显示弹窗
    showModal('npc-edit-modal');
}

function saveNPC() {
    if (!editingNPC) return;
    
    editingNPC.name = document.getElementById('npc-name').value;
    editingNPC.role = document.getElementById('npc-role').value;
    editingNPC.avatar = document.getElementById('npc-avatar').value;
    editingNPC.description = document.getElementById('npc-description').value;
    editingNPC.isMurderer = document.getElementById('npc-is-murderer').checked;
    
    // 更新数据库
    const scriptsDB = getScriptsDB();
    const index = scriptsDB.scripts.findIndex(s => s.id === currentScript.id);
    if (index >= 0) {
        scriptsDB.scripts[index] = currentScript;
        saveScriptsDB(scriptsDB);
    }
    
    hideModal('npc-edit-modal');
    renderNPCsList();
    showToast('NPC已保存');
}

function deleteNPC(npcId) {
    if (!confirm('确定删除此NPC？')) return;
    
    currentScript.npcs = currentScript.npcs.filter(n => n.id !== npcId);
    
    // 更新数据库
    const scriptsDB = getScriptsDB();
    const index = scriptsDB.scripts.findIndex(s => s.id === currentScript.id);
    if (index >= 0) {
        scriptsDB.scripts[index] = currentScript;
        saveScriptsDB(scriptsDB);
    }
    
    renderNPCsList();
    showToast('NPC已删除');
}

function renderNPCsList() {
    const container = document.getElementById('npcs-list');
    if (!container || !currentScript) return;
    
    const npcs = currentScript.npcs || [];
    
    if (npcs.length === 0) {
        container.innerHTML = `
            <div class="empty-list-hint">
                <p>还没有添加NPC</p>
                <button class="btn-secondary btn-sm" onclick="addNewNPC()">添加第一个NPC</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = npcs.map(npc => `
        <div class="npc-card" data-id="${npc.id}">
            <div class="npc-avatar-mini" style="${npc.avatar ? `background-image: url(${npc.avatar})` : ''}">
                ${npc.avatar ? '' : '<span>' + (npc.name?.[0] || '?') + '</span>'}
            </div>
            <div class="npc-info-mini">
                <h4>${npc.name || '未命名'}</h4>
                <p>${npc.role || '角色待定'} ${npc.isMurderer ? '<span class="murderer-tag">凶手</span>' : ''}</p>
            </div>
            <div class="npc-actions">
                <button class="btn-icon" onclick="editNPC('${npc.id}')" title="编辑">✏️</button>
                <button class="btn-icon" onclick="deleteNPC('${npc.id}')" title="删除">🗑️</button>
            </div>
        </div>
    `).join('');
}

// 对话管理
function addDialogue() {
    const dialogue = {
        id: 'dlg_' + Date.now(),
        trigger: '',
        text: '',
        choices: []
    };
    
    editingNPC.dialogues = editingNPC.dialogues || [];
    editingNPC.dialogues.push(dialogue);
    
    renderDialoguesList();
}

function removeDialogue(dlgId) {
    editingNPC.dialogues = editingNPC.dialogues.filter(d => d.id !== dlgId);
    renderDialoguesList();
}

function renderDialoguesList() {
    const container = document.getElementById('dialogues-list');
    if (!container || !editingNPC) return;
    
    const dialogues = editingNPC.dialogues || [];
    
    if (dialogues.length === 0) {
        container.innerHTML = '<p class="hint-text">还没有对话，点击上方按钮添加</p>';
        return;
    }
    
    container.innerHTML = dialogues.map((dlg, index) => `
        <div class="dialogue-item">
            <div class="dialogue-header">
                <span class="dialogue-num">对话 ${index + 1}</span>
                <button class="btn-icon btn-sm" onclick="removeDialogue('${dlg.id}')">🗑️</button>
            </div>
            <input type="text" class="input-sm" placeholder="触发条件" value="${dlg.trigger}" 
                onchange="editingNPC.dialogues[${index}].trigger = this.value">
            <textarea class="textarea-sm" placeholder="对话内容" rows="2"
                onchange="editingNPC.dialogues[${index}].text = this.value">${dlg.text}</textarea>
        </div>
    `).join('');
}

// ========== 保证金支付 ==========

function showDepositModal() {
    showModal('deposit-modal');
}

function processDeposit() {
    const method = document.querySelector('input[name="payment-method"]:checked')?.value;
    if (!method) {
        showToast('请选择支付方式');
        return;
    }
    
    showToast('正在调用支付...');
    
    // 模拟支付过程
    setTimeout(() => {
        // 标记保证金已支付
        const creator = getCurrentCreator();
        if (creator) {
            creator.depositPaid = true;
            creator.depositAmount = 1000;
            creator.depositPaidAt = new Date().toISOString();
            
            const creatorDB = getCreatorDB();
            const index = creatorDB.creators.findIndex(c => c.id === creator.id);
            if (index >= 0) {
                creatorDB.creators[index] = creator;
                saveCreatorDB(creatorDB);
            }
            
            // 记录交易
            creatorDB.transactions.push({
                id: 'txn_' + Date.now(),
                creatorId: creator.id,
                type: 'deposit',
                amount: 1000,
                method: method,
                status: 'completed',
                createdAt: new Date().toISOString()
            });
            saveCreatorDB(creatorDB);
        }
        
        hideModal('deposit-modal');
        showToast('保证金支付成功！');
        
        // 刷新界面
        loadCreatorData();
    }, 2000);
}

// ========== 其他功能 ==========

function previewScript(scriptId) {
    showToast('预览功能开发中');
}

function deleteScript(scriptId) {
    if (!confirm('确定删除此剧本？')) return;
    
    const scriptsDB = getScriptsDB();
    scriptsDB.scripts = scriptsDB.scripts.filter(s => s.id !== scriptId);
    saveScriptsDB(scriptsDB);
    
    showToast('剧本已删除');
    loadScriptsList(getCurrentCreator()?.id);
}

function loadAnalytics() {
    // 加载数据分析
    const container = document.getElementById('analytics-content');
    if (!container) return;
    
    const creator = getCurrentCreator();
    const scriptsDB = getScriptsDB();
    const creatorScripts = scriptsDB.scripts.filter(s => s.creatorId === creator?.id);
    
    container.innerHTML = `
        <div class="analytics-grid">
            <div class="analytics-card">
                <h3>📊 剧本表现</h3>
                <div class="chart-placeholder">
                    <p>📈 数据图表</p>
                    <p class="hint-text">展示游玩次数、评分等趋势</p>
                </div>
            </div>
            <div class="analytics-card">
                <h3>💰 收益明细</h3>
                <div class="revenue-list">
                    ${creatorScripts.filter(s => s.status === 'approved').map(s => `
                        <div class="revenue-item">
                            <span>${s.title}</span>
                            <span>¥${(s.stats?.revenue || 0).toFixed(2)}</span>
                        </div>
                    `).join('') || '<p class="hint-text">暂无收益数据</p>'}
                </div>
            </div>
        </div>
    `;
}

function loadSettings() {
    // 加载设置页面
    const container = document.getElementById('settings-content');
    if (!container) return;
    
    const creator = getCurrentCreator();
    
    container.innerHTML = `
        <div class="settings-section">
            <h3>🏷️ 创作者等级</h3>
            <div class="tier-card">
                <div class="tier-badge" style="background: ${CREATOR_TIERS[creator?.tier]?.color || '#4facfe'}">
                    ${CREATOR_TIERS[creator?.tier]?.name || '基础创作者'}
                </div>
                <div class="tier-perks">
                    ${(CREATOR_TIERS[creator?.tier]?.features || []).map(f => `<span class="perk">✓ ${f}</span>`).join('')}
                </div>
            </div>
        </div>
        
        <div class="settings-section">
            <h3>💳 保证金状态</h3>
            <div class="deposit-status">
                <p>保证金：¥1000</p>
                <p>状态：${creator?.depositPaid ? '✅ 已支付' : '❌ 未支付'}</p>
                ${creator?.depositPaid ? '' : '<button class="btn-primary" onclick="showDepositModal()">立即支付</button>'}
            </div>
        </div>
        
        <div class="settings-section">
            <h3>📋 资质认证</h3>
            <div class="cert-status">
                <p>实名认证：✅ 已完成</p>
                <p>资质审核：✅ 通过</p>
            </div>
        </div>
    `;
}

// ========== 工具函数 ==========

function showToast(message, duration = 2000) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), duration);
    }
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

function checkNotifications() {
    // 检查待审核剧本
    const scriptsDB = getScriptsDB();
    const creator = getCurrentCreator();
    if (!creator) return;
    
    const pendingScripts = scriptsDB.scripts.filter(s => 
        s.creatorId === creator.id && (s.status === 'pending' || s.status === 'rejected')
    );
    
    if (pendingScripts.length > 0) {
        const notification = document.getElementById('notification-badge');
        if (notification) {
            notification.textContent = pendingScripts.length;
            notification.style.display = 'inline';
        }
    }
}

// ========== 启动 ==========

document.addEventListener('DOMContentLoaded', init);
