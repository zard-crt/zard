// home.js
Page({
  data: {
    statusBarHeight: 44,
    tabBarHeight: 80,
    projects: [],
    members: [
      { id: 1, name: '张三', initials: '张', color: '#0071E3' },
      { id: 2, name: '李四', initials: '李', color: '#34C759' },
      { id: 3, name: '王五', initials: '王', color: '#FF9500' },
      { id: 4, name: '赵六', initials: '赵', color: '#AF52DE' },
      { id: 5, name: '陈七', initials: '陈', color: '#FF2D55' },
      { id: 6, name: '刘八', initials: '刘', color: '#5AC8FA' },
    ],
    displayMembers: []
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    const statusBarHeight = sysInfo.statusBarHeight || 44;
    this.setData({ statusBarHeight });
    this.loadProjects();
    this.updateDisplayMembers();
  },

  onShow() {
    this.loadProjects();
  },

  loadProjects() {
    const mockProjects = [
      {
        id: 1,
        name: '星辰科技有限公司',
        logoText: '星',
        color: '#0071E3',
        status: '进行中',
        statusClass: 'active',
        progress: 65,
        memberCount: 8,
        members: [
          { initials: '张' }, { initials: '李' }, { initials: '王' },
          { initials: '赵' }, { initials: '陈' }
        ]
      },
      {
        id: 2,
        name: '云端创新集团',
        logoText: '云',
        color: '#34C759',
        status: '待开始',
        statusClass: 'pending',
        progress: 15,
        memberCount: 6,
        members: [
          { initials: '刘' }, { initials: '周' }, { initials: '吴' },
          { initials: '郑' }, { initials: '孙' }
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
    wx.navigateTo({ url: `/pages/client/report/report?id=${id}` });
  },

  onTabTap(e) {
    const { tabIndex } = e.detail;
    if (tabIndex === 1) wx.navigateTo({ url: '/pages/client/chat/chat' });
    else if (tabIndex === 2) wx.navigateTo({ url: '/pages/client/team/team' });
  }
});
