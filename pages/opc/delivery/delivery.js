Page({
  data: {
    statusBarHeight: 44,
    contentHeight: 500,
    planName: '',
    budget: '',
    phases: [
      { name: '现状调研与数据采集', content: '对企业现有业务流程、数据资产进行系统调研，采集核心业务数据' },
      { name: 'AI诊断与机会识别', content: '基于采集数据应用AI模型进行诊断，识别关键改进机会与痛点' }
    ],
    inclusions: [
      { label: '诊断报告', selected: true },
      { label: '数据看板', selected: true },
      { label: '实施方案', selected: false },
      { label: '培训支持', selected: false },
      { label: '技术支持', selected: false },
      { label: '后续迭代', selected: false }
    ],
    exclusions: [
      { label: '硬件采购', selected: false },
      { label: '第三方系统', selected: false },
      { label: '长期运维', selected: false },
      { label: '组织变革', selected: false }
    ]
  },
  onLoad() {
    const sys = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: sys.statusBarHeight || 44,
      contentHeight: sys.windowHeight - (sys.statusBarHeight || 44) - 66
    });
  },
  onNameInput(e) { this.setData({ planName: e.detail.value }); },
  onPhaseNameInput(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ [`phases[${index}].name`]: e.detail.value });
  },
  onPhaseContentInput(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ [`phases[${index}].content`]: e.detail.value });
  },
  onAddPhase() {
    this.setData({ phases: [...this.data.phases, { name: '', content: '' }] });
    setTimeout(() => { wx.pageScrollTo ? wx.pageScrollTo({ selector: '.phase-end', duration: 300 }) : null; }, 100);
  },
  onDeletePhase(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ phases: this.data.phases.filter((_, i) => i !== index) });
  },
  onBudgetInput(e) { this.setData({ budget: e.detail.value }); },
  onToggleInclude(e) {
    const { index } = e.currentTarget.dataset;
    wx.vibrateShort ? wx.vibrateShort({ type: 'light' }) : null;
    this.setData({ [`inclusions[${index}].selected`]: !this.data.inclusions[index].selected });
  },
  onToggleExclude(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ [`exclusions[${index}].selected`]: !this.data.exclusions[index].selected });
  },
  onPreview() { wx.showToast({ title: '预览方案', icon: 'none' }); },
  onSubmit() {
    wx.showModal({
      title: '确认提交',
      content: '确认提交此交付方案？',
      success: (res) => { if (res.confirm) wx.showToast({ title: '提交成功', icon: 'success', duration: 2000 }); }
    });
  }
});
