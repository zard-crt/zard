Page({
  data: {
    statusBarHeight: 44, contentHeight: 500,
    stats: { ongoing: 128, newThisMonth: 47, conversionRate: 32 },
    weeklyData: [{ day: '周一', height: 60 }, { day: '周二', height: 75 }, { day: '周三', height: 45 }, { day: '周四', height: 90 }, { day: '周五', height: 65 }],
    industries: [{ name: '制造业', count: 48, percent: 38, color: '#FF9F0A' }, { name: '零售', count: 28, percent: 22, color: '#5E5CE6' }, { name: '专业服务', count: 22, percent: 17, color: '#30D158' }, { name: '医疗', count: 15, percent: 12, color: '#FF375F' }, { name: '其他', count: 14, percent: 11, color: '#64D2FF' }],
    pendingItems: [{ title: '待评审项目', count: 8, url: '/pages/opc/workspace/workspace' }, { title: '待交付方案', count: 3, url: '/pages/opc/delivery/delivery' }]
  },
  onLoad() {
    const sys = wx.getSystemInfoSync();
    const statusHeight = sys.statusBarHeight || 44;
    this.setData({ statusBarHeight: statusHeight, contentHeight: sys.windowHeight - statusHeight - 34 - 20 - 80 });
  },
  onPendingTap(e) { wx.navigateTo({ url: e.currentTarget.dataset.url }); },
  onTabTap() {}
});
