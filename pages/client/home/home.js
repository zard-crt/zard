// home.js v3 - 企业端首页 (使用 API.getProjects)
const app = getApp(); const API = app.services.API;

Page({
  data: {
    statusBarHeight: 44,
    tabBarHeight: 80,
    currentTime: '',
    projects: [],
    members: [],
    displayMembers: [],
    showRoleModal: false,
    currentRole: 'client'
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    const statusBarHeight = sysInfo.statusBarHeight || 44;
    var savedRole = wx.getStorageSync('userRole') || 'client';
    this.setData({ statusBarHeight, currentRole: savedRole });
    this.updateTime();
    this.loadProjects();
    this.loadTeamMembers();
  },

  onShow() {
    this.loadProjects();
    this.updateTime();
    this.loadTeamMembers();
  },

  updateTime() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    this.setData({ currentTime: h + ':' + m });
  },

  loadProjects() {
    var self = this;
    API.getProjects().then(function(res) {
      var projectList = [];
      if (res && res.code === 0 && res.data) {
        projectList = res.data.map(function(p) {
          return self.formatProject(p);
        });
      }
      if (projectList.length === 0) {
        // Fallback: use app globalData if available
        var app = getApp();
        if (app.globalData.currentProject) {
          projectList.push(self.formatProject(app.globalData.currentProject));
        }
      }
      self.setData({ projects: projectList });
    }).catch(function() {
      // On error, keep existing data or empty
      self.setData({ projects: [] });
    });
  },

  formatProject(p) {
    var statusObj = getStatusById(p.status);
    var name = p.companyName || p.name || '未命名项目';
    var colors = [
      { color: '#0071E3', colorLight: '#4B9EFF' },
      { color: '#34C759', colorLight: '#63E68A' },
      { color: '#FF9500', colorLight: '#FFB340' },
      { color: '#AF52DE', colorLight: '#D07AFF' },
      { color: '#FF3B30', colorLight: '#FF6B8A' }
    ];
    var colorIdx = (p.id || 1) % colors.length;
    var colorSet = colors[colorIdx];

    // Build member avatars from teamMembers if available
    var memberAvatars = [];
    if (p.teamMembers && p.teamMembers.length > 0) {
      memberAvatars = p.teamMembers.slice(0, 5).map(function(m) {
        var roleConfig = getRoleById(m.role);
        var roleColors = {
          ceo: { color1: '#0071E3', color2: '#4B9EFF' },
          sales: { color1: '#34C759', color2: '#63E68A' },
          ops: { color1: '#FF9500', color2: '#FFB340' },
          finance: { color1: '#AF52DE', color2: '#D07AFF' },
          marketing: { color1: '#FF3B30', color2: '#FF6B8A' },
          hr: { color1: '#5AC8FA', color2: '#8AD8FF' }
        };
        var rc = roleColors[m.role] || { color1: '#86868B', color2: '#AEAEB2' };
        return {
          initials: roleConfig ? roleConfig.name.charAt(0) : (m.name ? m.name.charAt(0) : '?'),
          color1: rc.color1,
          color2: rc.color2
        };
      });
    } else {
      // Default avatars based on count
      var count = p.memberCount || 3;
      var defaultColors = [
        { color1: '#0071E3', color2: '#4B9EFF' },
        { color1: '#34C759', color2: '#63E68A' },
        { color1: '#FF9500', color2: '#FFB340' },
        { color1: '#AF52DE', color2: '#D07AFF' },
        { color1: '#FF3B30', color2: '#FF6B8A' }
      ];
      for (var i = 0; i < Math.min(count, 5); i++) {
        memberAvatars.push({ initials: '●', color1: defaultColors[i].color1, color2: defaultColors[i].color2 });
      }
    }

    return {
      id: p.id,
      name: name,
      logoText: name.charAt(0),
      color: colorSet.color,
      colorLight: colorSet.colorLight,
      status: statusObj ? statusObj.name : '未知',
      statusEmoji: statusObj ? statusObj.emoji : '📋',
      statusClass: p.status || 'pending',
      progress: p.progress || 0,
      memberCount: p.memberCount || (p.teamMembers ? p.teamMembers.length : 0),
      members: memberAvatars
    };
  },

  loadTeamMembers() {
    var app = getApp();
    var diagnosisResults = app.globalData.diagnosisResults || {};

    var memberColors = {
      ceo: { color1: '#0071E3', color2: '#4B9EFF' },
      sales: { color1: '#34C759', color2: '#63E68A' },
      ops: { color1: '#FF9500', color2: '#FFB340' },
      finance: { color1: '#AF52DE', color2: '#D07AFF' },
      marketing: { color1: '#FF3B30', color2: '#FF6B8A' },
      hr: { color1: '#5AC8FA', color2: '#8AD8FF' }
    };

    var members = ROLE_LIST.map(function(role) {
      var colors = memberColors[role.id] || { color1: '#86868B', color2: '#AEAEB2' };
      var isCompleted = !!diagnosisResults[role.id];
      return {
        id: role.id,
        name: role.name,
        initials: role.icon,
        color1: colors.color1,
        color2: colors.color2,
        completed: isCompleted
      };
    });

    this.setData({
      members: members,
      displayMembers: members.slice(0, 5)
    });
  },

  onScan() {
    wx.scanCode({
      success: function(res) {
        wx.showToast({ title: '扫码成功', icon: 'success' });
        // Parse the scanned code for role
        var role = 'ceo';
        if (res.result) {
          var match = res.result.match(/role=(\w+)/);
          if (match) role = match[1];
        }
        wx.navigateTo({ url: '/pages/client/chat/chat?role=' + role });
      },
      fail: function() {
        // Fallback: navigate to invite
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
      setTimeout(function() {
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
