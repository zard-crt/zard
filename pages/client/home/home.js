// home.js v2 - 企业端首页
Page({
  data: {
    statusBarHeight: 44,
    tabBarHeight: 80,
    currentTime: '',
    projects: [],
    members: [
      { id: 1, name: '张三', initials: '张', color1: '#0071E3', color2: '#4B9EFF' },
      { id: 2, name: '李四', initials: '李', color1: '#34C759', color2: '#63E68A' },
      { id: 3, name: '王五', initials: '王', color1: '#FF9500', color2: '#FFB340' },
      { id: 4, name: '赵六', initials: '赵', color1: '#AF52DE', color2: '#D07AFF' },
      { id: 5, name: '陈七', initials: '陈', color1: '#FF2D55', color2: '#FF6B8A' },
      { id: 6, name: '刘八', initials: '刘', color1: '#5AC8FA', color2: '#8AD8FF' },
    ],
    displayMembers: [],
    showRoleModal: false,
    currentRole: wx.getStorageSync('userRole') || 'client'
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    const statusBarHeight = sysInfo.statusBarHeight || 44;
    this.setData({ statusBarHeight });
    this.updateTime();
    this.loadProjects();
    this.updateDisplayMembers();
  },

  onShow() {
    this.loadProjects();
    this.updateTime();
  },

  updateTime() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    this.setData({ currentTime: h + ':' + m });
  },

  loadProjects() {
    const mockProjects = [
      {
        id: 1,
        name: '星辰科技有限公司',
        logoText: '星',
        color: '#0071E3',
        colorLight: '#4B9EFF',
        status: '进行中',
        statusEmoji: '⏳',
        statusClass: 'active',
        progress: 65,
        memberCount: 8,
        members: [
          { initials: '张', color1: '#0071E3', color2: '#4B9EFF' },
          { initials: '李', color1: '#34C759', color2: '#63E68A' },
          { initials: '王', color1: '#FF9500', color2: '#FFB340' },
          { initials: '赵', color1: '#AF52DE', color2: '#D07AFF' },
          { initials: '陈', color1: '#FF2D55', color2: '#FF6B8A' }
        ]
      },
      {
        id: 2,
        name: '云端创新集团',
        logoText: '云',
        color: '#34C759',
        colorLight: '#63E68A',
        status: '待开始',
        statusEmoji: '📋',
        statusClass: 'pending',
        progress: 15,
        memberCount: 6,
        members: [
          { initials: '刘', color1: '#5AC8FA', color2: '#8AD8FF' },
          { initials: '周', color1: '#0071E3', color2: '#4B9EFF' },
          { initials: '吴', color1: '#FF9500', color2: '#FFB340' },
          { initials: '郑', color1: '#AF52DE', color2: '#D07AFF' },
          { initials: '孙', color1: '#34C759', color2: '#63E68A' }
        ]
      },
      {
        id: 3,
        name: '明达数据科技',
        logoText: '明',
        color: '#FF9500',
        colorLight: '#FFB340',
        status: '已完成',
        statusEmoji: '✅',
        statusClass: 'completed',
        progress: 100,
        memberCount: 4,
        members: [
          { initials: '周', color1: '#0071E3', color2: '#4B9EFF' },
          { initials: '吴', color1: '#34C759', color2: '#63E68A' },
          { initials: '郑', color1: '#AF52DE', color2: '#D07AFF' },
        ]
      }
    ];
    this.setData({ projects: mockProjects });
  },

  updateDisplayMembers() {
    this.setData({ displayMembers: this.data.members.slice(0, 5) });
  },

  onScan() {
    wx.scanCode({
      success: (res) => {
        wx.showToast({ title: '扫码成功', icon: 'success' });
      },
      fail: () => {
        wx.navigateTo({ url: '/pages/client/invite/invite' });
      }
    });
  },

  onViewAll() {
    wx.showToast({ title: '查看全部项目', icon: 'none' });
  },

  onProjectTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: '/pages/client/report/report?id=' + id });
  },

  onRoleSwitch() {
    this.setData({ showRoleModal: true });
  },

  onRoleSelect(e) {
    const role = e.currentTarget.dataset.role;
    this.setData({ currentRole: role, showRoleModal: false });
    getApp().setRole(role);
    wx.showToast({ title: role === 'opc' ? '已切换至知晨科技端' : '已切换至企业端', icon: 'none', duration: 1500 });
    if (role === 'opc') {
      setTimeout(() => {
        wx.navigateTo({ url: '/pages/opc/projects/projects' });
      }, 500);
    }
  },

  onRoleModalClose() {
    this.setData({ showRoleModal: false });
  },

  onTabTap(e) {
    const { tabIndex } = e.detail;
    if (tabIndex === 1) wx.navigateTo({ url: '/pages/client/chat/chat' });
    else if (tabIndex === 2) wx.navigateTo({ url: '/pages/client/team/team' });
  }
});
