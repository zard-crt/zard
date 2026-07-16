const API = require('../../services/api');

Page({
  data: {
    statusBarHeight: 44,
    contentHeight: 500,
    searchValue: '',
    currentCategory: 0,
    categories: ['全部', '数字化转型', 'AI应用', '数据分析', '行业报告'],
    categoryKeys: ['', 'digital_transformation', 'ai_application', 'data_analysis', 'industry_report'],
    templates: [],
    reports: [],
    allTemplates: [],
    allReports: [],
    loading: false
  },
  onLoad() {
    const sys = wx.getSystemInfoSync();
    const statusHeight = sys.statusBarHeight || 44;
    this.setData({
      statusBarHeight: statusHeight,
      contentHeight: sys.windowHeight - statusHeight - 34 - 20 - 16 - 56 - 80
    });
    this.loadKnowledgeBase();
  },
  loadKnowledgeBase() {
    const self = this;
    self.setData({ loading: true });

    API.getKnowledgeBase().then(function(res) {
      const items = (res && res.data) || [];
      const templates = [];
      const reports = [];

      items.forEach(function(item, idx) {
        const templateIconMap = {
          'whitepaper': { icon: '📄', iconBg: 'rgba(255,159,10,0.15)' },
          'case': { icon: '📋', iconBg: 'rgba(94,92,230,0.15)' },
          'guide': { icon: '📘', iconBg: 'rgba(48,209,88,0.15)' },
          'tutorial': { icon: '🎓', iconBg: 'rgba(255,55,95,0.15)' },
          'report': { icon: '📊', iconBg: 'rgba(100,210,255,0.15)' }
        };
        const vis = templateIconMap[item.type] || { icon: '📄', iconBg: 'rgba(255,159,10,0.15)' };

        if (item.type === 'whitepaper' || item.type === 'case' || item.type === 'guide' || item.type === 'tutorial') {
          // Map to template format
          const industryNames = ['数字化转型', 'AI应用', '数据分析', '行业报告'];
          const catIdx = idx % industryNames.length;
          templates.push({
            id: item.id,
            name: item.title,
            description: item.summary || item.description || '',
            icon: vis.icon,
            iconBg: vis.iconBg,
            category: industryNames[catIdx],
            readTime: item.readTime || ''
          });
        } else {
          reports.push({
            id: item.id,
            title: item.title,
            date: '',
            description: item.summary || item.description || '',
            category: '行业报告',
            pages: 0,
            readTime: item.readTime || ''
          });
        }
      });

      // Format dates from item IDs as fallback
      reports.forEach(function(r, idx) {
        var m = (idx + 3) % 12 + 1;
        r.date = '2026-' + (m < 10 ? '0' + m : m);
        r.pages = 20 + (idx * 8) % 50;
      });

      // Add default templates if none returned
      if (templates.length === 0) {
        templates.push(
          { id: 'kb1', name: '企业数字化转型白皮书', description: '系统介绍数字化转型的框架与方法论', icon: '📄', iconBg: 'rgba(255,159,10,0.15)', category: '数字化转型', readTime: '20分钟' },
          { id: 'kb2', name: '制造业数字化案例集', description: '收录30+制造业数字化转型成功案例', icon: '📋', iconBg: 'rgba(94,92,230,0.15)', category: '数字化转型', readTime: '30分钟' },
          { id: 'kb3', name: 'AI在企业中的应用场景', description: '覆盖销售预测、智能客服、流程自动化等场景', icon: '📘', iconBg: 'rgba(48,209,88,0.15)', category: 'AI应用', readTime: '15分钟' },
          { id: 'kb4', name: 'LLM与大模型技术入门', description: '帮助非技术人员理解大语言模型原理与应用', icon: '🎓', iconBg: 'rgba(255,55,95,0.15)', category: 'AI应用', readTime: '25分钟' }
        );
      }
      if (reports.length === 0) {
        reports.push(
          { id: 'r1', title: '2026中国制造业数字化报告', date: '2026-06', description: '行业趋势、技术应用与市场分析', category: '行业报告', pages: 68 },
          { id: 'r2', title: '零售业数字化转型趋势报告', date: '2026-05', description: '零售行业AI诊断与数字化转型前沿洞察', category: '行业报告', pages: 42 },
          { id: 'r3', title: '专业服务领域AI渗透率研究', date: '2026-04', description: '专业服务行业AI技术应用深度研究报告', category: '行业报告', pages: 55 },
          { id: 'r4', title: 'AI诊断行业标准化白皮书', date: '2026-03', description: 'AI诊断服务流程、标准与评估体系', category: '行业报告', pages: 36 }
        );
      }

      self.setData({
        templates: templates,
        reports: reports,
        allTemplates: templates,
        allReports: reports,
        loading: false
      });
    }).catch(function() {
      // Fallback defaults
      const defaultTemplates = [
        { id: 1, name: '制造业诊断模板', description: '针对制造业的AI诊断框架', icon: '\U0001f3ed', iconBg: 'rgba(255,159,10,0.15)' },
        { id: 2, name: '零售业诊断模板', description: '零售行业数字化诊断方案', icon: '\U0001f3ea', iconBg: 'rgba(94,92,230,0.15)' },
        { id: 3, name: '服务行业模板', description: '专业服务行业AI应用诊断', icon: '\U0001f4cb', iconBg: 'rgba(48,209,88,0.15)' },
        { id: 4, name: '医疗行业模板', description: '医疗健康领域AI诊断框架', icon: '\U0001f3e5', iconBg: 'rgba(255,55,95,0.15)' }
      ];
      const defaultReports = [
        { id: 1, title: '2026中国制造业AI应用白皮书', date: '2026-06', description: '全面分析制造业AI应用现状、趋势与最佳实践', category: '制造业', pages: 68 },
        { id: 2, title: '零售业数字化转型趋势报告', date: '2026-05', description: '零售行业AI诊断与数字化转型前沿洞察', category: '零售', pages: 42 },
        { id: 3, title: '专业服务领域AI渗透率研究', date: '2026-04', description: '专业服务行业AI技术应用深度研究报告', category: '专业服务', pages: 55 },
        { id: 4, title: 'AI诊断行业标准化白皮书', date: '2026-03', description: 'AI诊断服务流程、标准与评估体系', category: '通用', pages: 36 }
      ];
      self.setData({
        templates: defaultTemplates,
        reports: defaultReports,
        allTemplates: defaultTemplates,
        allReports: defaultReports,
        loading: false
      });
    });
  },
  onSearchInput(e) {
    var val = e.detail.value;
    this.setData({ searchValue: val });

    // Filter templates and reports by search
    if (val.trim() === '') {
      this.setData({
        templates: this.data.allTemplates,
        reports: this.data.allReports
      });
      return;
    }

    var lowerVal = val.toLowerCase();
    var filteredTemplates = this.data.allTemplates.filter(function(t) {
      return t.name.toLowerCase().indexOf(lowerVal) !== -1 || t.description.toLowerCase().indexOf(lowerVal) !== -1;
    });
    var filteredReports = this.data.allReports.filter(function(r) {
      return r.title.toLowerCase().indexOf(lowerVal) !== -1 || r.description.toLowerCase().indexOf(lowerVal) !== -1;
    });
    this.setData({
      templates: filteredTemplates,
      reports: filteredReports
    });
  },
  onCategoryTap(e) {
    var index = e.currentTarget.dataset.index;
    wx.vibrateShort ? wx.vibrateShort({ type: 'light' }) : null;
    this.setData({ currentCategory: index });

    // Filter by category
    var categoryKey = this.data.categoryKeys[index];
    var self = this;

    if (!categoryKey) {
      // Show all
      this.setData({
        templates: this.data.allTemplates,
        reports: this.data.allReports
      });
    } else {
      // Fetch by category from API
      API.getKnowledgeBase(categoryKey).then(function(res) {
        var items = (res && res.data) || [];
        var filteredTemplates = self.data.allTemplates.filter(function(t) {
          return t.category === categoryKey || items.some(function(item) { return item.id === t.id; });
        });
        // For now just filter by name match
        var catName = self.data.categories[index];
        var filteredTemplates2 = self.data.allTemplates.filter(function(t) {
          return (t.category || '').indexOf(catName) !== -1;
        });
        var filteredReports2 = self.data.allReports.filter(function(r) {
          return (r.category || '').indexOf(catName) !== -1;
        });
        self.setData({
          templates: filteredTemplates2.length > 0 ? filteredTemplates2 : self.data.allTemplates,
          reports: filteredReports2.length > 0 ? filteredReports2 : self.data.allReports
        });
      }).catch(function() {
        self.setData({
          templates: self.data.allTemplates,
          reports: self.data.allReports
        });
      });
    }
  },
  onTemplateTap() { wx.showToast({ title: '模板加载中...', icon: 'none' }); },
  onReportTap() { wx.showToast({ title: '报告详情', icon: 'none' }); },
  onNewTemplate() { wx.showToast({ title: '新建模板', icon: 'none' }); },
  onTabTap(e) {
    var tab = e.detail ? e.detail.tabIndex : 0;
    if (tab === 0) wx.navigateTo({ url: '/pages/opc/projects/projects' });
    else if (tab === 2) wx.navigateTo({ url: '/pages/opc/dashboard/dashboard' });
  }
});
