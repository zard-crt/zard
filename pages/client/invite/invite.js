// invite.js
Page({
  data: {
    statusBarHeight: 44, tabBarHeight: 80,
    project: {
      id: 1, name: '星辰科技有限公司', logoText: '星', color: '#0071E3', status: '诊断中'
    },
    recommendMembers: [
      { id: 1, name: '张伟', role: '销售总监', department: '销售部', initials: '张', color: '#0071E3', invited: false },
      { id: 2, name: '李芳', role: '运营经理', department: '运营部', initials: '李', color: '#34C759', invited: false },
      { id: 3, name: '王强', role: '财务总监', department: '财务部', initials: '王', color: '#FF9500', invited: false },
      { id: 4, name: '赵敏', role: '市场总监', department: '市场部', initials: '赵', color: '#AF52DE', invited: false },
      { id: 5, name: '陈静', role: '人事经理', department: '人事部', initials: '陈', color: '#FF2D55', invited: false }
    ],
    invitedMembers: []
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 44 });
  },

  onInviteMember(e) {
    const id = e.currentTarget.dataset.id;
    const members = this.data.recommendMembers.map(m => {
      if (m.id === id && !m.invited) {
        const now = new Date();
        const timeStr = now.getFullYear() + '-' + (now.getMonth()+1) + '-' + now.getDate() + ' ' + now.getHours() + ':' + now.getMinutes();
        this.data.invitedMembers.push({ ...m, invitedTime: timeStr });
        return { ...m, invited: true };
      }
      return m;
    });
    this.setData({ recommendMembers: members, invitedMembers: this.data.invitedMembers });
    wx.showToast({ title: '邀请已发送', icon: 'success' });
  },

  onShare() {
    wx.showToast({ title: '分享功能', icon: 'none' });
  },

  onGenerateCode() {
    wx.showModal({ title: '邀请码', content: 'ABCD-1234', showCancel: true, confirmText: '复制' });
  },

  onTabTap(e) {
    const { tabIndex } = e.detail;
    if (tabIndex === 0) wx.navigateTo({ url: '/pages/client/home/home' });
    else if (tabIndex === 1) wx.navigateTo({ url: '/pages/client/chat/chat' });
    else if (tabIndex === 2) wx.navigateTo({ url: '/pages/client/team/team' });
  }
});
