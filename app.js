// app.js - AIDiagnose 应用入口
// 所有服务模块通过 getApp() 全局访问

const API = require('./services/api');
const { AnalysisEngine } = require('./services/analysis');
const { DeliveryEngine, MODULE_TEMPLATES, PHASE_TEMPLATES, RISK_TEMPLATES } = require('./services/delivery');
const DiagnosisEngine = require('./services/diagnosis');
const models = require('./services/models');

App({
  // 全局服务 - 通过 getApp().services.xxx 访问
  services: {
    API,
    AnalysisEngine: new AnalysisEngine(),
    DeliveryEngine: new DeliveryEngine(),
    DiagnosisEngine,
    ...models
  },

  globalData: {
    userInfo: null,
    userRole: null,
    isClient: true,
    currentProject: null,
    projects: [],
    diagnosisResults: {},
    analysisReport: null,
    deliveryPlan: null,
    decisions: null,
    messages: [],
    teamMembers: []
  },

  onLaunch() {
    const token = wx.getStorageSync('token');
    if (token) this.checkLogin(token);
    // 初始化DeepSeek配置
    this.globalData.deepseek = {
      apiKey: wx.getStorageSync('deepseek_api_key') || '',
      model: 'deepseek-v4-pro-fast',
      baseUrl: 'https://api.deepseek.com/v1'
    };
  },

  checkLogin(token) {
    const userRole = wx.getStorageSync('userRole') || 'client';
    this.globalData.isClient = userRole === 'client';
    this.globalData.userRole = userRole;
  },

  setRole(role) {
    this.globalData.isClient = role === 'client';
    this.globalData.userRole = role;
    wx.setStorageSync('userRole', role);
  },

  // DeepSeek V4 Pro Fast API 调用
  async deepseekChat(messages, options = {}) {
    const { apiKey, model, baseUrl } = this.globalData.deepseek;
    if (!apiKey) {
      return { error: '请先配置 DeepSeek API Key' };
    }
    try {
      const res = await this.services.API.request('/chat/completions', {
        model: model || 'deepseek-v4-pro-fast',
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2048,
        stream: false
      }, 'POST', false);
      return res;
    } catch (err) {
      return { error: err.message || 'API 请求失败' };
    }
  }
});
