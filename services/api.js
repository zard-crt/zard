/**
 * api.js - 集中式 API 服务
 * 所有后端/LLM 请求统一通过此文件
 * 后端就绪后替换 BASE_URL 并设置 USE_MOCK = false
 */

const API = {
  BASE_URL: '',
  USE_MOCK: true,

  /**
   * 通用请求方法
   * @param {string} url    请求路径
   * @param {object} data   请求参数
   * @param {string} method HTTP 方法
   */
  request(url, data = {}, method = 'GET', useDeepseek = false) {
    if (this.USE_MOCK && !useDeepseek) {
      return this._mockResponse(url, data, method);
    }
    if (useDeepseek) {
      const app = getApp();
      const { apiKey, model, baseUrl } = app.globalData.deepseek || {};
      if (!apiKey) {
        return Promise.reject({ errMsg: '请先配置 DeepSeek API Key' });
      }
      return new Promise((resolve, reject) => {
        wx.request({
          url: (baseUrl || 'https://api.deepseek.com/v1') + '/chat/completions',
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey
          },
          data: {
            model: model || 'deepseek-chat',
            messages: data.messages || [],
            temperature: data.temperature || 0.7,
            max_tokens: data.maxTokens || 4096,
            stream: false
          },
          success: (res) => {
            if (res.data && res.data.choices && res.data.choices[0]) {
              resolve({ code: 0, data: { reply: res.data.choices[0].message.content, usage: res.data.usage } });
            } else {
              reject({ errMsg: 'DeepSeek 返回异常', raw: res.data });
            }
          },
          fail: (err) => reject({ errMsg: '网络请求失败', error: err })
        });
      });
    }
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.BASE_URL + url,
        data,
        method,
        header: { 'Content-Type': 'application/json' },
        success: res => resolve(res.data),
        fail: err => reject(err)
      });
    });
  },

  /**
   * Mock 响应分发
   */
  _mockResponse(url, data, method = 'GET') {
    // 模拟网络延迟（300-800ms）
    const delay = 300 + Math.random() * 500;

    if (url.includes('/projects')) {
      if (url.includes('/detail') || data.id) {
        return this._delay(delay, this._mockProjectDetail(data.id || 1));
      }
      return this._delay(delay, this._mockProjectList());
    }
    if (url.includes('/questions')) {
      return this._delay(delay, this._mockQuestions(data.role, data.industry));
    }
    if (url.includes('/submit-answer')) {
      return this._delay(delay, { success: true, message: '答案已提交' });
    }
    if (url.includes('/diagnosis-result')) {
      return this._delay(delay + 200, this._mockDiagnosisResult(data.projectId));
    }
    if (url.includes('/analysis-report')) {
      return this._delay(delay + 300, this._mockAnalysisReport(data.projectId));
    }
    if (url.includes('/delivery-plan')) {
      return this._delay(delay + 400, this._mockDeliveryPlan(data.projectId, data.decisions));
    }
    if (url.includes('/dashboard')) {
      return this._delay(delay, this._mockDashboardStats());
    }
    if (url.includes('/knowledge')) {
      return this._delay(delay, this._mockKnowledgeBase(data.category));
    }
    if (url.includes('/login')) {
      return this._delay(delay, { token: 'mock_token_' + Date.now(), userId: 1 });
    }
    return this._delay(delay, { code: 0, message: 'unknown endpoint' });
  },

  _delay(ms, data) {
    return new Promise(resolve => setTimeout(() => resolve(data), ms));
  },

  /* ========== 具体 API 方法 ========== */

  /** 获取项目列表 */
  getProjects() {
    return this.request('/api/projects');
  },

  /** 获取项目详情 */
  getProjectDetail(id) {
    return this.request('/api/projects/detail', { id });
  },

  /** 获取诊断问题 */
  getDiagnosisQuestions(role, industry) {
    return this.request('/api/questions', { role, industry });
  },

  /** 提交答案 */
  submitAnswer(projectId, role, answer) {
    return this.request('/api/submit-answer', { projectId, role, answer }, 'POST');
  },

  /** 获取诊断结果 */
  getDiagnosisResult(projectId) {
    return this.request('/api/diagnosis-result', { projectId });
  },

  /** 获取分析报告 */
  getAnalysisReport(projectId) {
    return this.request('/api/analysis-report', { projectId });
  },

  /** 生成交付方案 */
  generateDeliveryPlan(projectId, decisions) {
    return this.request('/api/delivery-plan', { projectId, decisions }, 'POST');
  },

  /** 获取仪表盘统计 */
  getDashboardStats() {
    return this.request('/api/dashboard');
  },

  /** 获取知识库 */
  getKnowledgeBase(category) {
    return this.request('/api/knowledge', { category });
  },

  /** 登录 */
  login(code) {
    return this.request('/api/login', { code }, 'POST');
  },

  /* ========== Mock 数据 ========== */

  _mockProjectList() {
    return {
      code: 0,
      data: [
        { id: 1, companyName: '星辰科技有限公司', industry: '制造业', status: 'active', progress: 65, memberCount: 5, createdAt: '2026-07-10', deadline: '2026-08-20' },
        { id: 2, companyName: '鼎新制造集团', industry: '制造业', status: 'completed', progress: 100, memberCount: 3, createdAt: '2026-07-05', deadline: '2026-08-05' },
        { id: 3, companyName: '云帆数据科技', industry: '专业服务', status: 'pending', progress: 0, memberCount: 4, createdAt: '2026-07-14', deadline: '2026-08-30' },
        { id: 4, companyName: '瑞康医疗', industry: '医疗', status: 'reviewing', progress: 85, memberCount: 6, createdAt: '2026-07-01', deadline: '2026-08-10' },
        { id: 5, companyName: '华联零售集团', industry: '零售', status: 'delivered', progress: 100, memberCount: 4, createdAt: '2026-06-20', deadline: '2026-07-25' }
      ]
    };
  },

  _mockProjectDetail(id) {
    const projects = {
      1: {
        id: 1,
        companyName: '星辰科技有限公司',
        industry: '制造业',
        size: '200-500人',
        status: 'active',
        progress: 65,
        startDate: '2026-07-10',
        deadline: '2026-08-20',
        teamMembers: [
          { id: 101, name: '王明', role: 'CEO/创始人', roleId: 'ceo', avatar: '', completed: true },
          { id: 102, name: '李华', role: '销售总监', roleId: 'sales', avatar: '', completed: true },
          { id: 103, name: '张伟', role: '运营总监', roleId: 'ops', avatar: '', completed: false },
          { id: 104, name: '赵琳', role: '财务总监', roleId: 'finance', avatar: '', completed: false },
          { id: 105, name: '陈静', role: '市场总监', roleId: 'marketing', avatar: '', completed: true }
        ],
        diagnosisSummary: {
          answeredRoles: ['ceo', 'sales', 'marketing'],
          totalQuestions: 55,
          answeredQuestions: 32
        }
      },
      2: {
        id: 2,
        companyName: '鼎新制造集团',
        industry: '制造业',
        size: '500-1000人',
        status: 'completed',
        progress: 100,
        startDate: '2026-07-05',
        deadline: '2026-08-05',
        teamMembers: [
          { id: 201, name: '刘强', role: 'CEO/创始人', roleId: 'ceo', avatar: '', completed: true },
          { id: 202, name: '陈涛', role: '运营总监', roleId: 'ops', avatar: '', completed: true }
        ],
        diagnosisSummary: {
          answeredRoles: ['ceo', 'ops'],
          totalQuestions: 26,
          answeredQuestions: 26
        }
      }
    };
    return { code: 0, data: projects[id] || projects[1] };
  },

  _mockQuestions(role, industry) {
    // 由 diagnosis.js 提供完整问题树，此处返回占位
    return { code: 0, data: [] };
  },

  _mockDiagnosisResult(projectId) {
    return {
      code: 0,
      data: {
        projectId: projectId || 1,
        overallScore: 62.5,
        roleScores: [
          { role: 'ceo', name: 'CEO/创始人', score: 75, answered: 15, total: 15 },
          { role: 'sales', name: '销售部', score: 55, answered: 12, total: 12 },
          { role: 'ops', name: '运营部', score: 0, answered: 0, total: 11 },
          { role: 'finance', name: '财务部', score: 0, answered: 0, total: 11 },
          { role: 'marketing', name: '市场部', score: 68, answered: 11, total: 11 }
        ],
        painPoints: [
          { id: 'pp1', category: '数据孤岛', severity: 8.5, description: '各部门系统不互通，数据无法共享', affectedRoles: ['sales', 'ops', 'finance'] },
          { id: 'pp2', category: '流程低效', severity: 7.2, description: '审批流程冗长，决策周期过长', affectedRoles: ['ceo', 'ops'] },
          { id: 'pp3', category: '管理粗放', severity: 6.8, description: '缺乏数据驱动的精细化管理能力', affectedRoles: ['ceo', 'sales', 'marketing'] }
        ],
        timestamp: new Date().toISOString()
      }
    };
  },

  _mockAnalysisReport(projectId) {
    return {
      code: 0,
      data: {
        projectId: projectId || 1,
        companyName: '星辰科技有限公司',
        industry: '制造业',
        reportDate: new Date().toISOString(),
        executiveSummary: '星辰科技在数字化转型中面临典型的数据孤岛和流程低效问题。CEO层有清晰愿景但缺乏落地路径；销售团队数据意识较强但工具落后；市场部数字化程度较高。建议从数据中台建设入手，分阶段推进数字化升级。',
        dimensionScores: [
          { dimension: '战略规划', score: 72, maxScore: 100, level: '良好' },
          { dimension: '组织能力', score: 58, maxScore: 100, level: '待提升' },
          { dimension: '技术基础', score: 45, maxScore: 100, level: '薄弱' },
          { dimension: '数据文化', score: 60, maxScore: 100, level: '基础' },
          { dimension: '流程效率', score: 55, maxScore: 100, level: '待提升' }
        ],
        heatmapData: {
          roles: ['CEO/创始人', '销售部', '运营部', '财务部', '市场部'],
          dimensions: ['数据管理', '流程自动化', '团队协作', '决策支持', '客户管理', '业财一体'],
          matrix: [
            [4, 3, 5, 4, 2, 3],
            [3, 2, 4, 3, 5, 2],
            [2, 5, 3, 2, 1, 4],
            [1, 4, 2, 3, 1, 5],
            [3, 2, 4, 3, 4, 2]
          ]
        },
        suggestions: [
          { priority: 'P0', title: '数据中台建设', description: '打通各业务系统数据，建立统一数据平台', effort: '3-4个月', impact: '高' },
          { priority: 'P1', title: 'CRM系统升级', description: '替换现有CRM系统，实现销售全流程数字化', effort: '2-3个月', impact: '高' },
          { priority: 'P2', title: '流程自动化改造', description: '对审批、报表等高频流程进行自动化', effort: '1-2个月', impact: '中' }
        ]
      }
    };
  },

  _mockDeliveryPlan(projectId, decisions) {
    return {
      code: 0,
      data: {
        projectId: projectId || 1,
        planName: '星辰科技数字化转型实施计划',
        phases: [
          {
            id: 'phase1',
            name: '第一阶段：基础建设',
            duration: '第1-2月',
            modules: [
              { id: 'm1', name: '数据中台搭建', status: 'planned', effort: '4周', dependencies: [] },
              { id: 'm2', name: '系统集成与API治理', status: 'planned', effort: '3周', dependencies: ['m1'] },
              { id: 'm3', name: '数据治理规范制定', status: 'planned', effort: '2周', dependencies: [] }
            ]
          },
          {
            id: 'phase2',
            name: '第二阶段：核心应用',
            duration: '第3-4月',
            modules: [
              { id: 'm4', name: '智能CRM系统', status: 'planned', effort: '5周', dependencies: ['m1', 'm2'] },
              { id: 'm5', name: '运营管理平台', status: 'planned', effort: '4周', dependencies: ['m1', 'm3'] },
              { id: 'm6', name: '财务管理系统升级', status: 'planned', effort: '4周', dependencies: ['m2'] }
            ]
          },
          {
            id: 'phase3',
            name: '第三阶段：智能升级',
            duration: '第5-6月',
            modules: [
              { id: 'm7', name: 'AI决策支持系统', status: 'planned', effort: '5周', dependencies: ['m4', 'm5', 'm6'] },
              { id: 'm8', name: '数据可视化看板', status: 'planned', effort: '3周', dependencies: ['m1'] },
              { id: 'm9', name: '智能预测模型', status: 'planned', effort: '4周', dependencies: ['m7'] }
            ]
          }
        ],
        totalTimeline: '6个月',
        totalBudget: {
          min: 580000,
          max: 850000,
          currency: 'CNY',
          breakdown: [
            { item: '数据中台搭建', amount: 200000 },
            { item: 'CRM系统实施', amount: 150000 },
            { item: '运营平台开发', amount: 120000 },
            { item: 'AI系统开发', amount: 180000 },
            { item: '培训与运维', amount: 80000 }
          ]
        },
        riskPoints: [
          { risk: '数据迁移风险', level: '中', mitigation: '制定详细数据迁移计划，保留回滚机制' },
          { risk: '员工适应风险', level: '中', mitigation: '分阶段培训，设置过渡期并行运行' },
          { risk: '系统兼容风险', level: '低', mitigation: '前期充分调研现有系统接口，预留适配层' }
        ]
      }
    };
  },

  _mockDashboardStats() {
    return {
      code: 0,
      data: {
        totalProjects: 12,
        activeProjects: 5,
        completedThisMonth: 2,
        avgScore: 64.3,
        roleDistribution: [
          { role: 'ceo', count: 12 },
          { role: 'sales', count: 8 },
          { role: 'ops', count: 10 },
          { role: 'finance', count: 6 },
          { role: 'marketing', count: 7 },
          { role: 'hr', count: 4 }
        ],
        industryDistribution: [
          { industry: '制造业', count: 5 },
          { industry: '零售', count: 3 },
          { industry: '专业服务', count: 2 },
          { industry: '医疗', count: 2 }
        ],
        monthlyStats: [
          { month: '2026-03', newProjects: 1, completed: 0 },
          { month: '2026-04', newProjects: 2, completed: 1 },
          { month: '2026-05', newProjects: 3, completed: 2 },
          { month: '2026-06', newProjects: 4, completed: 3 },
          { month: '2026-07', newProjects: 2, completed: 2 }
        ],
        commonPainPoints: [
          { category: '数据孤岛', frequency: 8, avgSeverity: 8.2 },
          { category: '流程低效', frequency: 7, avgSeverity: 7.5 },
          { category: '管理粗放', frequency: 6, avgSeverity: 7.0 },
          { category: '工具落后', frequency: 5, avgSeverity: 6.8 },
          { category: '人才短缺', frequency: 4, avgSeverity: 6.5 }
        ]
      }
    };
  },

  _mockKnowledgeBase(category) {
    const all = {
      digital_transformation: [
        { id: 'kb1', title: '企业数字化转型白皮书', summary: '系统介绍数字化转型的框架与方法论', type: 'whitepaper', readTime: '20分钟' },
        { id: 'kb2', title: '制造业数字化案例集', summary: '收录30+制造业数字化转型成功案例', type: 'case', readTime: '30分钟' }
      ],
      ai_application: [
        { id: 'kb3', title: 'AI在企业中的应用场景', summary: '覆盖销售预测、智能客服、流程自动化等场景', type: 'guide', readTime: '15分钟' },
        { id: 'kb4', title: 'LLM与大模型技术入门', summary: '帮助非技术人员理解大语言模型原理与应用', type: 'tutorial', readTime: '25分钟' }
      ],
      data_analysis: [
        { id: 'kb5', title: '数据驱动决策方法论', summary: '从数据采集到决策的科学方法论', type: 'whitepaper', readTime: '20分钟' },
        { id: 'kb6', title: '数据治理最佳实践', summary: '数据标准化、质量管理和安全合规指南', type: 'guide', readTime: '15分钟' }
      ],
      industry_report: [
        { id: 'kb7', title: '2026中国制造业数字化报告', summary: '行业趋势、技术应用与市场分析', type: 'report', readTime: '40分钟' },
        { id: 'kb8', title: '中小企业数字化转型路径', summary: '针对中小企业的低成本数字化方案', type: 'guide', readTime: '15分钟' }
      ]
    };
    if (category && all[category]) {
      return { code: 0, data: all[category] };
    }
    const flat = Object.values(all).flat();
    return { code: 0, data: flat };
  },

  // 直接调用 DeepSeek V4 Pro Fast
  deepseekChat(messages, options = {}) {
    return this.request('/chat/completions', {
      messages,
      temperature: options.temperature || 0.7,
      maxTokens: options.maxTokens || 4096
    }, 'POST', true);
  },

  // 设置 DeepSeek API Key
  setDeepseekKey(apiKey) {
    const app = getApp();
    app.globalData.deepseek = app.globalData.deepseek || {};
    app.globalData.deepseek.apiKey = apiKey;
    wx.setStorageSync('deepseek_api_key', apiKey);
  }
};

module.exports = API;
