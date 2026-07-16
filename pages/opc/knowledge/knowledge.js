Page({
  data: {
    statusBarHeight: 44,
    contentHeight: 500,
    searchValue: '',
    currentCategory: 0,
    categories: ['全部', '制造业', '零售', '专业服务', '医疗'],
    templates: [
      { id: 1, name: '制造业诊断模板', description: '针对制造业的AI诊断框架', icon: '🏭', iconBg: 'rgba(255,159,10,0.15)' },
      { id: 2, name: '零售业诊断模板', description: '零售行业数字化诊断方案', icon: '🏪', iconBg: 'rgba(94,92,230,0.15)' },
      { id: 3, name: '服务行业模板', description: '专业服务行业AI应用诊断', icon: '📋', iconBg: 'rgba(48,209,88,0.15)' },
      { id: 4, name: '医疗行业模板', description: '医疗健康领域AI诊断框架', icon: '🏥', iconBg: 'rgba(255,55,95,0.15)' }
    ],
    reports: [
      { id: 1, title: '2026中国制造业AI应用白皮书', date: '2026-06', description: '全面分析制造业AI应用现状、趋势与最佳实践', category: '制造业', pages: 68 },
      { id: 2, title: '零售业数字化转型趋势报告', date: '2026-05', description: '零售行业AI诊断与数字化转型前沿洞察', category: '零售', pages: 42 },
      { id: 3, title: '专业服务领域AI渗透率研究', date: '2026-04', description: '专业服务行业AI技术应用深度研究报告', category: '专业服务', pages: 55 },
      { id: 4, title: 'AI诊断行业标准化白皮书', date: '2026-03', description: 'AI诊断服务流程、标准与评估体系', category: '通用', pages: 36 }
    ]
  },
  onLoad() {
    const sys = wx.getSystemInfoSync();
    const statusHeight = sys.statusBarHeight || 44;
    this.setData({
      statusBarHeight: statusHeight,
      contentHeight: sys.windowHeight - statusHeight - 34 - 20 - 16 - 56 - 80
    });
  },
  onSearchInput(e) { this.setData({ searchValue: e.detail.value }); },
  onCategoryTap(e) {
    const index = e.currentTarget.dataset.index;
    wx.vibrateShort ? wx.vibrateShort({ type: 'light' }) : null;
    this.setData({ currentCategory: index });
  },
  onTemplateTap() { wx.showToast({ title: '模板加载中...', icon: 'none' }); },
  onReportTap() { wx.showToast({ title: '报告详情', icon: 'none' }); },
  onNewTemplate() { wx.showToast({ title: '新建模板', icon: 'none' }); },
  onTabTap(e) {
    const tab = e.detail ? e.detail.tabIndex : 0;
    if (tab === 0) wx.navigateTo({ url: '/pages/opc/projects/projects' });
    else if (tab === 2) wx.navigateTo({ url: '/pages/opc/dashboard/dashboard' });
  }
});
