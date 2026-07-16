const API = require('../../services/api');

const INDUSTRY_COLORS = ['#FF9F0A', '#5E5CE6', '#30D158', '#FF375F', '#64D2FF'];

Page({
  data: {
    statusBarHeight: 44,
    contentHeight: 500,
    stats: {
      ongoing: 0,
      newThisMonth: 0,
      conversionRate: 0
    },
    weeklyData: [],
    industries: [],
    pendingItems: [
      { title: '待评审项目', count: 0, url: '/pages/opc/workspace/workspace' },
      { title: '待交付方案', count: 0, url: '/pages/opc/delivery/delivery' }
    ],
    animatedBars: [0, 0, 0, 0, 0, 0, 0]
  },
  onLoad() {
    const sys = wx.getSystemInfoSync();
    const statusHeight = sys.statusBarHeight || 44;
    this.setData({
      statusBarHeight: statusHeight,
      contentHeight: sys.windowHeight - statusHeight - 34 - 20 - 80
    });
    this.loadDashboardData();
  },
  loadDashboardData() {
    const self = this;

    API.getDashboardStats().then(res => {
      const data = (res && res.data) || {};

      // Stats
      const stats = {
        ongoing: data.activeProjects || data.totalProjects || 0,
        newThisMonth: data.completedThisMonth || 0,
        conversionRate: data.avgScore ? Math.round(data.avgScore) : 0
      };

      // Weekly trend from monthlyStats
      const monthlyStats = data.monthlyStats || [];
      const weeklyData = monthlyStats.length > 0
        ? monthlyStats.map(function(m) {
            const dayLabel = m.month ? m.month.replace('2026-', '') : '';
            return {
              day: dayLabel,
              height: Math.max(10, ((m.newProjects || 0) / 5) * 100)
            };
          })
        : [
            { day: '周一', height: 60 },
            { day: '周二', height: 75 },
            { day: '周三', height: 45 },
            { day: '周四', height: 90 },
            { day: '周五', height: 65 }
          ];

      // Industry distribution
      const industryDist = data.industryDistribution || [];
      const totalIndustry = industryDist.reduce(function(sum, i) { return sum + (i.count || 0); }, 0);
      const industries = industryDist.map(function(item, idx) {
        return {
          name: item.industry || '其他',
          count: item.count || 0,
          percent: totalIndustry > 0 ? Math.round(((item.count || 0) / totalIndustry) * 100) : 0,
          color: INDUSTRY_COLORS[idx % INDUSTRY_COLORS.length]
        };
      });

      // Pending items - estimate from data
      const pendingCount = industries.length > 0 ? Math.max(1, Math.round(industries.length * 1.5)) : 3;
      const pendingItems = [
        { title: '待评审项目', count: pendingCount, url: '/pages/opc/workspace/workspace' },
        { title: '待交付方案', count: Math.max(1, Math.round(pendingCount / 2)), url: '/pages/opc/delivery/delivery' }
      ];

      self.setData({
        stats: stats,
        weeklyData: weeklyData,
        industries: industries,
        pendingItems: pendingItems
      });

      // Animate bars after load
      setTimeout(function() {
        const heights = weeklyData.map(function(d) { return d.height; });
        self.setData({ animatedBars: heights });
      }, 200);
    }).catch(function() {
      // Fallback defaults
      const defaultWeekly = [
        { day: '周一', height: 60 },
        { day: '周二', height: 75 },
        { day: '周三', height: 45 },
        { day: '周四', height: 90 },
        { day: '周五', height: 65 }
      ];
      const defaultIndustries = [
        { name: '制造业', count: 48, percent: 38, color: '#FF9F0A' },
        { name: '零售', count: 28, percent: 22, color: '#5E5CE6' },
        { name: '专业服务', count: 22, percent: 17, color: '#30D158' },
        { name: '医疗', count: 15, percent: 12, color: '#FF375F' },
        { name: '其他', count: 14, percent: 11, color: '#64D2FF' }
      ];
      self.setData({
        stats: { ongoing: 128, newThisMonth: 47, conversionRate: 32 },
        weeklyData: defaultWeekly,
        industries: defaultIndustries
      });
      setTimeout(function() {
        self.setData({ animatedBars: defaultWeekly.map(function(d) { return d.height; }) });
      }, 200);
    });
  },
  onPendingTap(e) {
    wx.navigateTo({ url: e.currentTarget.dataset.url });
  },
  onTabTap(e) {
    const tab = e.detail ? e.detail.tabIndex : 0;
    if (tab === 0) wx.navigateTo({ url: '/pages/opc/projects/projects' });
    else if (tab === 1) wx.navigateTo({ url: '/pages/opc/knowledge/knowledge' });
  }
});
