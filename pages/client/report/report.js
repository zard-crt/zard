// report.js v2 - 报告页
Page({
  data: {
    statusBarHeight: 44,
    tabBarHeight: 80,
    company: {
      id: 1,
      name: '星辰科技有限公司',
      logoText: '星',
      color: '#0071E3',
      colorLight: '#4B9EFF',
      date: '2026年7月',
      status: '诊断完成',
      impactScore: 3.8
    },
    heatmap: {
      columns: ['流程效率', '数据孤岛', '重复劳动', '决策缺数据'],
      rows: [
        { name: '销售部', values: [{ severity: 4, label: '高' },{ severity: 3, label: '中' },{ severity: 2, label: '低' },{ severity: 3, label: '中' }] },
        { name: '运营部', values: [{ severity: 3, label: '中' },{ severity: 4, label: '高' },{ severity: 3, label: '中' },{ severity: 2, label: '低' }] },
        { name: '财务部', values: [{ severity: 2, label: '低' },{ severity: 4, label: '高' },{ severity: 1, label: '低' },{ severity: 3, label: '中' }] },
        { name: '市场部', values: [{ severity: 3, label: '中' },{ severity: 2, label: '低' },{ severity: 4, label: '高' },{ severity: 3, label: '中' }] },
        { name: '人事部', values: [{ severity: 2, label: '低' },{ severity: 3, label: '中' },{ severity: 3, label: '中' },{ severity: 4, label: '高' }] }
      ]
    },
    findings: {
      topDepartment: '销售部',
      topIssue: '数据孤岛',
      topIssuePercent: 68,
      avgScore: 3.8,
      avgScoreDesc: '中等偏高，需重点关注'
    }
  },

  onLoad(options) {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 44 });
    if (options && options.id) this.loadReportData(options.id);
  },

  loadReportData(projectId) {
    console.log('Loading report for project:', projectId);
  },

  onHeatmapCell(e) {
    const { row, col } = e.currentTarget.dataset;
    const dept = this.data.heatmap.rows[row].name;
    const issue = this.data.heatmap.columns[col];
    const severity = this.data.heatmap.rows[row].values[col].severity;
    var severityLabel = '低';
    if (severity > 3) severityLabel = '高';
    else if (severity > 1) severityLabel = '中';
    wx.showToast({
      title: dept + ' · ' + issue + ': ' + severityLabel + '(' + severity + '/5)',
      icon: 'none',
      duration: 2000
    });
  },

  onTabTap(e) {
    const { tabIndex } = e.detail;
    if (tabIndex === 0) wx.navigateTo({ url: '/pages/client/home/home' });
    else if (tabIndex === 1) wx.navigateTo({ url: '/pages/client/chat/chat' });
    else if (tabIndex === 2) wx.navigateTo({ url: '/pages/client/team/team' });
  }
});
