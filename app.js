// app.js
App({
  globalData: {
    userInfo: null,
    userRole: null, // 'client' | 'opc'
    isClient: true,
    currentProject: null,
    projects: [],
    messages: [],
    teamMembers: []
  },

  onLaunch() {
    // 检查登录状态
    const token = wx.getStorageSync('token')
    if (token) {
      this.checkLogin(token)
    }
  },

  checkLogin(token) {
    // 模拟登录检查
    const userRole = wx.getStorageSync('userRole') || 'client'
    this.globalData.isClient = userRole === 'client'
    this.globalData.userRole = userRole
  },

  // 设置用户角色（用于调试/开发）
  setRole(role) {
    this.globalData.isClient = role === 'client'
    this.globalData.userRole = role
    wx.setStorageSync('userRole', role)
  },

  // 模拟数据
  getMockProjects() {
    return [
      {
        id: 1,
        companyName: '星辰科技有限公司',
        companyLogo: '',
        status: 'in_progress',
        statusText: '进行中',
        progress: 65,
        members: ['王', '李', '张', '赵'],
        createdAt: '2026-07-10'
      },
      {
        id: 2,
        companyName: '鼎新制造集团',
        companyLogo: '',
        status: 'completed',
        statusText: '已完成',
        progress: 100,
        members: ['刘', '陈'],
        createdAt: '2026-07-05'
      }
    ]
  },

  getMockTeamMembers() {
    return [
      { name: '王明', role: 'CEO', avatar: '' },
      { name: '李华', role: '销售总监', avatar: '' },
      { name: '张伟', role: '运营总监', avatar: '' },
      { name: '赵琳', role: '财务总监', avatar: '' },
      { name: '陈静', role: '市场总监', avatar: '' }
    ]
  }
})
