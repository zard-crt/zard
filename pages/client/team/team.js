// team.js v2 - 团队页
Page({
  data: {
    statusBarHeight: 44,
    tabBarHeight: 80,
    project: {
      id: 1,
      name: '星辰科技有限公司',
      status: '进行中',
      statusEmoji: '⏳',
      statusClass: 'active',
      completedInterviews: 18,
      totalInterviews: 30,
      completionRate: 60
    },
    teamMembers: [
      { id: 1, name: '张三', role: '项目负责人', initials: '张', color1: '#0071E3', color2: '#4B9EFF', statusLabel: '已完成', statusEmoji: '✅', statusClass: 'done' },
      { id: 2, name: '李四', role: '运营主管', initials: '李', color1: '#34C759', color2: '#63E68A', statusLabel: '已完成', statusEmoji: '✅', statusClass: 'done' },
      { id: 3, name: '王五', role: '技术总监', initials: '王', color1: '#FF9500', color2: '#FFB340', statusLabel: '待参与', statusEmoji: '⏳', statusClass: 'pending' },
      { id: 4, name: '赵六', role: '产品经理', initials: '赵', color1: '#AF52DE', color2: '#D07AFF', statusLabel: '进行中', statusEmoji: '🔄', statusClass: 'progress' },
      { id: 5, name: '陈七', role: '人力资源', initials: '陈', color1: '#FF2D55', color2: '#FF6B8A', statusLabel: '已完成', statusEmoji: '✅', statusClass: 'done' },
      { id: 6, name: '刘八', role: '财务经理', initials: '刘', color1: '#5AC8FA', color2: '#8AD8FF', statusLabel: '待参与', statusEmoji: '⏳', statusClass: 'pending' }
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
