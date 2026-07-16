// team.js v3 - 团队页 (使用 ROLES)
const app = getApp(); const { ROLES, ROLE_LIST, PROJECT_STATUS, getRoleById, getStatusById } = app.services;

Page({
  data: {
    statusBarHeight: 44,
    tabBarHeight: 80,
    project: {
      id: 0,
      name: '加载中...',
      status: '等待诊断',
      statusEmoji: '📋',
      statusClass: 'pending',
      completedInterviews: 0,
      totalInterviews: 0,
      completionRate: 0
    },
    teamMembers: []
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 44 });
    this.loadProjectData();
  },

  onShow() {
    this.loadProjectData();
  },

  loadProjectData() {
    var self = this;
    var app = getApp();
    var diagnosisResults = app.globalData.diagnosisResults || {};

    // Build team members from ROLES
    var roleColors = {
      ceo: { color1: '#0071E3', color2: '#4B9EFF' },
      sales: { color1: '#34C759', color2: '#63E68A' },
      ops: { color1: '#FF9500', color2: '#FFB340' },
      finance: { color1: '#AF52DE', color2: '#D07AFF' },
      marketing: { color1: '#FF3B30', color2: '#FF6B8A' },
      hr: { color1: '#5AC8FA', color2: '#8AD8FF' }
    };

    // Get role initials
    var roleInitials = {
      ceo: 'C',
      sales: '销',
      ops: '运',
      finance: '财',
      marketing: '市',
      hr: '人'
    };

    var members = ROLE_LIST.map(function(role) {
      var isCompleted = !!diagnosisResults[role.id];
      var initials = roleInitials[role.id] || role.name.charAt(0);
      var colors = roleColors[role.id] || { color1: '#86868B', color2: '#AEAEB2' };

      return {
        id: role.id,
        name: role.name,
        role: role.name + ' ' + role.icon,
        initials: initials,
        color1: colors.color1,
        color2: colors.color2,
        statusLabel: isCompleted ? '已完成' : '待参与',
        statusEmoji: isCompleted ? '✅' : '⏳',
        statusClass: isCompleted ? 'done' : 'pending'
      };
    });

    // Calculate project progress
    var completed = members.filter(function(m) { return m.statusClass === 'done'; }).length;
    var total = members.length;
    var rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    var projectName = (app.globalData.currentProject && app.globalData.currentProject.companyName) || '诊断项目';
    var isAllDone = completed >= total;
    var projectStatus = isAllDone ? '已完成' : '进行中';
    var statusEmoji = isAllDone ? '✅' : '⏳';
    var statusClass = isAllDone ? 'completed' : 'active';

    this.setData({
      project: {
        id: (app.globalData.currentProject && app.globalData.currentProject.id) || 0,
        name: projectName,
        status: projectStatus,
        statusEmoji: statusEmoji,
        statusClass: statusClass,
        completedInterviews: completed,
        totalInterviews: total,
        completionRate: rate
      },
      teamMembers: members
    });
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
