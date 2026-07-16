// invite.js v3 - 邀请页 (使用 ROLES)
const { ROLES, ROLE_LIST } = require('../../services/models');

Page({
  data: {
    statusBarHeight: 44,
    tabBarHeight: 80,
    showCodeModal: false,
    inviteCode: '',
    project: {
      id: 0,
      name: '',
      logoText: '',
      color: '#0071E3',
      colorLight: '#4B9EFF',
      status: '诊断中'
    },
    recommendMembers: [],
    invitedMembers: []
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 44 });

    var app = getApp();
    var project = app.globalData.currentProject || {};
    var diagnosisResults = app.globalData.diagnosisResults || {};
    var projectName = project.companyName || '诊断项目';

    // Generate a unique invite code
    var code = 'DX-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

    // Build member list from ROLES, marking already-invited ones
    var roleColors = {
      ceo: { color1: '#0071E3', color2: '#4B9EFF' },
      sales: { color1: '#34C759', color2: '#63E68A' },
      ops: { color1: '#FF9500', color2: '#FFB340' },
      finance: { color1: '#AF52DE', color2: '#D07AFF' },
      marketing: { color1: '#FF3B30', color2: '#FF6B8A' },
      hr: { color1: '#5AC8FA', color2: '#8AD8FF' }
    };

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
        role: role.name,
        department: role.name,
        initials: initials,
        color1: colors.color1,
        color2: colors.color2,
        invited: isCompleted
      };
    });

    this.setData({
      project: {
        id: project.id || 0,
        name: projectName,
        logoText: projectName.charAt(0),
        color: '#0071E3',
        colorLight: '#4B9EFF',
        status: '诊断中'
      },
      recommendMembers: members,
      inviteCode: code
    });
  },

  onBack() {
    wx.navigateBack();
  },

  onInviteMember(e) {
    const id = e.currentTarget.dataset.id;
    var members = this.data.recommendMembers.map(function(m) {
      if (m.id === id && !m.invited) {
        var now = new Date();
        var month = now.getMonth() + 1;
        var day = now.getDate();
        var hours = now.getHours();
        var minutes = now.getMinutes();
        var timeStr = month + '/' + day + ' ' + hours + ':' + String(minutes).padStart(2, '0');
        this.data.invitedMembers.push({
          name: m.name,
          role: m.role,
          initials: m.initials,
          color1: m.color1,
          color2: m.color2,
          invitedTime: timeStr
        });
        return { id: m.id, name: m.name, role: m.role, department: m.department, initials: m.initials, color1: m.color1, color2: m.color2, invited: true };
      }
      return m;
    }.bind(this));
    this.setData({ recommendMembers: members, invitedMembers: this.data.invitedMembers });
    wx.showToast({ title: '邀请已发送', icon: 'success' });
  },

  onShareWechat() {
    var app = getApp();
    var project = app.globalData.currentProject || {};
    // Generate a role-specific deep link for the first uninvited role
    var uninvited = this.data.recommendMembers.filter(function(m) { return !m.invited; });
    var targetRole = uninvited.length > 0 ? uninvited[0].id : 'ceo';

    wx.showModal({
      title: '分享邀请链接',
      content: '角色: ' + (ROLES[targetRole.toUpperCase()] ? ROLES[targetRole.toUpperCase()].name : targetRole) + '\n邀请码: ' + this.data.inviteCode,
      confirmText: '复制链接',
      success: function(res) {
        if (res.confirm) {
          var link = 'AIDiagnose://invite?role=' + targetRole + '&code=' + this.data.inviteCode;
          wx.setClipboardData({
            data: link,
            success: function() {
              wx.showToast({ title: '已复制邀请链接', icon: 'success' });
            }
          });
        }
      }.bind(this)
    });
  },

  onGenerateCode() {
    this.setData({ showCodeModal: true });
  },

  onCopyCode() {
    wx.setClipboardData({
      data: this.data.inviteCode,
      success: function() {
        wx.showToast({ title: '已复制邀请码', icon: 'success' });
        this.setData({ showCodeModal: false });
      }.bind(this)
    });
  },

  onCloseModal() {
    this.setData({ showCodeModal: false });
  },

  noop() {},

  onTabTap(e) {
    const { tabIndex } = e.detail;
    if (tabIndex === 0) wx.navigateTo({ url: '/pages/client/home/home' });
    else if (tabIndex === 1) wx.navigateTo({ url: '/pages/client/chat/chat' });
    else if (tabIndex === 2) wx.navigateTo({ url: '/pages/client/team/team' });
  }
});
