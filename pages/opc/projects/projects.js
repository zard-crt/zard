Page({
  data: {
    statusBarHeight: 44,
    listHeight: 500,
    currentFilter: 0,
    filterTabs: ['全部', '进行中', '已完成', '评审中', '已交付'],
    projects: [],
    loading: false,
    noMore: false,
    pageNum: 1,
    animateItems: []
  },
  onLoad() {
    const sys = wx.getSystemInfoSync();
    const statusHeight = sys.statusBarHeight || 44;
    const { windowHeight } = sys;
    const topHeight = statusHeight + 34 + 20 + 44 + 16 + 80;
    this.setData({ statusBarHeight: statusHeight, listHeight: windowHeight - topHeight });
    this.loadProjects();
  },
  loadProjects() {
    const allProjects = [
      { id: 1, company: '深圳星河科技有限公司', statusClass: 'ongoing', statusText: '进行中', progress: 65, members: 8, date: '2026-07-10', companyInitial: '深' },
      { id: 2, company: '上海云端网络技术有限公司', statusClass: 'review', statusText: '评审中', progress: 90, members: 6, date: '2026-07-08', companyInitial: '上' },
      { id: 3, company: '北京创新未来数据集团', statusClass: 'completed', statusText: '已完成', progress: 100, members: 12, date: '2026-07-05', companyInitial: '北' },
      { id: 4, company: '广州智造工场实业有限公司', statusClass: 'delivered', statusText: '已交付', progress: 100, members: 5, date: '2026-07-01', companyInitial: '广' },
      { id: 5, company: '杭州数字经济研究院', statusClass: 'ongoing', statusText: '进行中', progress: 42, members: 9, date: '2026-06-28', companyInitial: '杭' },
      { id: 6, company: '成都智能硬件开发有限公司', statusClass: 'ongoing', statusText: '进行中', progress: 28, members: 4, date: '2026-06-25', companyInitial: '成' },
    ];
    let filtered = [...allProjects];
    if (this.data.currentFilter === 1) filtered = allProjects.filter(p => p.statusClass === 'ongoing');
    else if (this.data.currentFilter === 2) filtered = allProjects.filter(p => p.statusClass === 'completed');
    else if (this.data.currentFilter === 3) filtered = allProjects.filter(p => p.statusClass === 'review');
    else if (this.data.currentFilter === 4) filtered = allProjects.filter(p => p.statusClass === 'delivered');
    this.setData({ projects: filtered, noMore: true });
    // Stagger entrance animation
    const animItems = [];
    for (let i = 0; i < filtered.length; i++) {
      animItems.push('entering');
    }
    this.setData({ animateItems: animItems });
  },
  onFilterTab(e) {
    const index = e.currentTarget.dataset.index;
    if (index === this.data.currentFilter) return;
    // Simulate haptic
    wx.vibrateShort ? wx.vibrateShort({ type: 'light' }) : null;
    this.setData({ currentFilter: index, pageNum: 1, noMore: false });
    this.loadProjects();
  },
  onProjectTap(e) {
    wx.navigateTo({ url: `/pages/opc/project-detail/project-detail?id=${e.currentTarget.dataset.id}` });
  },
  onLoadMore() {},
  onTabTap(e) {
    const tab = e.detail ? e.detail.tabIndex : 0;
    if (tab === 1) wx.navigateTo({ url: '/pages/opc/workspace/workspace' });
    else if (tab === 2) wx.navigateTo({ url: '/pages/opc/dashboard/dashboard' });
  }
});
