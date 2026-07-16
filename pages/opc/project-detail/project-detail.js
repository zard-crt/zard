Page({
  data: {
    statusBarHeight: 44,
    contentHeight: 500,
    project: {},
    projectId: null,
    animatedProgress: 0
  },
  onLoad(options) {
    const sys = wx.getSystemInfoSync();
    const statusHeight = sys.statusBarHeight || 44;
    this.setData({
      statusBarHeight: statusHeight,
      contentHeight: sys.windowHeight - statusHeight - 48,
      projectId: options.id || '1'
    });
    this.loadProjectDetail();
  },
  loadProjectDetail() {
    const project = {
      id: this.data.projectId,
      company: '深圳星河科技有限公司',
      industry: '制造业',
      statusClass: 'ongoing',
      statusText: '进行中',
      createDate: '2026-06-15',
      endDate: '2026-08-15',
      progress: 65,
      totalTasks: 24,
      completedTasks: 16,
      members: [
        { name: '张明', role: '项目负责人', done: true },
        { name: '李华', role: 'AI诊断师', done: true },
        { name: '王芳', role: '数据分析师', done: false },
        { name: '陈强', role: '方案顾问', done: false }
      ],
      findings: [
        { priority: 'high', title: '数据治理缺失', description: '企业数据标准化程度低，影响AI模型训练效果', severity: 8 },
        { priority: 'high', title: '流程自动化不足', description: '核心业务流程仍依赖人工操作，效率低下', severity: 7 },
        { priority: 'medium', title: 'IT架构陈旧', description: '现有系统无法支持AI应用快速部署', severity: 6 },
        { priority: 'low', title: '人才储备不足', description: '缺乏AI领域专业人才团队建设', severity: 4 }
      ]
    };
    this.setData({ project: project });
    // Animate progress circle
    setTimeout(() => {
      this.setData({ animatedProgress: project.progress });
    }, 200);
  },
  onBack() { wx.navigateBack(); },
  onReview() { wx.navigateTo({ url: '/pages/opc/workspace/workspace' }); },
  onViewPlan() { wx.navigateTo({ url: '/pages/opc/delivery/delivery' }); }
});
