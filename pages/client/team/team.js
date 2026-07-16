// team.js
Page({
  data: {
    statusBarHeight: 44, tabBarHeight: 80,
    project: {
      id: 1, name: '星辰科技有限公司', status: '进行中', statusClass: 'active',
      completedInterviews: 18, totalInterviews: 30, completionRate: 60
    },
    teamMembers: [
      { id: 1, name: '张三', role: '项目负责人', initials: '张', color: '#0071E3', statusLabel: '已完成', statusClass: 'done' },
      { id: 2, name: '李四', role: '运营主管', initials: '李', color: '#34C759', statusLabel: '已完成', statusClass: 'done' },
      { id: 3, name: '王五', role: '技术总监', initials: '王', color: '#FF9500', statusLabel: '待参与', statusClass: 'pending' },
      { id: 4, name: '赵六', role: '产品经理', initials: '赵', color: '#AF52DE', statusLabel: '进行中', statusClass: 'progress' },
      { id: 5, name: '陈七', role: '人力资源', initials: '陈', color: '#FF2D55', statusLabel: '已完成', statusClass: 'done' },
      { id: 6, name: '刘八', role: '财务经理', initials: '刘', color: '#5AC8FA', statusLabel: '待参与', statusClass: 'pending' }
    ]
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 44 });
  },

  onInvite() {
    wx.navigateTo({ url: '/pages/client/invite/invite' });
  },

  onTabTap(e) {
    const { tabIndex } = e.detail;
    if (tabIndex === 0) wx.navigateTo({ url: '/pages/client/home/home' });
    else if (tabIndex === 1) wx.navigateTo({ url: '/pages/client/chat/chat' });
  }
});
