const API = require('../../services/api');
const { PROJECT_STATUS, getStatusById } = require('../../services/models');

const STATUS_FILTER_MAP = {
  0: null,
  1: 'active',
  2: 'completed',
  3: 'reviewing',
  4: 'delivered'
};

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
    const self = this;
    this.setData({ loading: true });
    API.getProjects().then(res => {
      const rawList = (res && res.data) || [];
      const allProjects = rawList.map(p => {
        const statusObj = getStatusById(p.status) || {};
        const statusClass = self._mapStatusToClass(p.status);
        return {
          id: p.id,
          company: p.companyName,
          statusClass: statusClass,
          statusText: statusObj.name || p.status,
          progress: p.progress || 0,
          members: p.memberCount || 0,
          date: p.createdAt || '',
          companyInitial: (p.companyName || '企')[0]
        };
      });

      let filtered = [...allProjects];
      const filterStatus = STATUS_FILTER_MAP[self.data.currentFilter];
      if (filterStatus) {
        filtered = allProjects.filter(p => p.statusClass === filterStatus);
      }

      self.setData({ projects: filtered, loading: false, noMore: true });

      const animItems = [];
      for (let i = 0; i < filtered.length; i++) {
        animItems.push('entering');
      }
      self.setData({ animateItems: animItems });
    }).catch(() => {
      self.setData({ loading: false });
    });
  },
  _mapStatusToClass(status) {
    const map = {
      'active': 'ongoing',
      'reviewing': 'review',
      'pending': 'pending',
      'ceo_done': 'pending',
      'completed': 'completed',
      'delivered': 'delivered'
    };
    return map[status] || 'ongoing';
  },
  onFilterTab(e) {
    const index = e.currentTarget.dataset.index;
    if (index === this.data.currentFilter) return;
    wx.vibrateShort ? wx.vibrateShort({ type: 'light' }) : null;
    this.setData({ currentFilter: index, pageNum: 1, noMore: false });
    this.loadProjects();
  },
  onProjectTap(e) {
    wx.navigateTo({ url: '/pages/opc/project-detail/project-detail?id=' + e.currentTarget.dataset.id });
  },
  onLoadMore() {},
  onTabTap(e) {
    const tab = e.detail ? e.detail.tabIndex : 0;
    if (tab === 1) wx.navigateTo({ url: '/pages/opc/workspace/workspace' });
    else if (tab === 2) wx.navigateTo({ url: '/pages/opc/dashboard/dashboard' });
  }
});
