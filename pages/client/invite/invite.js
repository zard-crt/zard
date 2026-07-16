// invite.js v2 - 邀请页
Page({
  data: {
    statusBarHeight: 44,
    tabBarHeight: 80,
    showCodeModal: false,
    inviteCode: 'ABCD-1234',
    project: {
      id: 1,
      name: '星辰科技有限公司',
      logoText: '星',
      color: '#0071E3',
      colorLight: '#4B9EFF',
      status: '诊断中'
    },
    recommendMembers: [
      { id: 1, name: '张伟', role: '销售总监', department: '销售部', initials: '张', color1: '#0071E3', color2: '#4B9EFF', invited: false },
      { id: 2, name: '李芳', role: '运营经理', department: '运营部', initials: '李', color1: '#34C759', color2: '#63E68A', invited: false },
      { id: 3, name: '王强', role: '财务总监', department: '财务部', initials: '王', color1: '#FF9500', color2: '#FFB340', invited: false },
      { id: 4, name: '赵敏', role: '市场总监', department: '市场部', initials: '赵', color1: '#AF52DE', color2: '#D07AFF', invited: false },
      { id: 5, name: '陈静', role: '人事经理', department: '人事部', initials: '陈', color1: '#FF2D55', color2: '#FF6B8A', invited: false }
    ],
    invitedMembers: []
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 44 });
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
    wx.showToast({ title: '分享给微信好友', icon: 'none' });
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
