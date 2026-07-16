Page({
  data: { statusBarHeight: 44, contentHeight: 500, pendingReviews: [], keyDecisions: [] },
  onLoad() {
    const sys = wx.getSystemInfoSync();
    const statusHeight = sys.statusBarHeight || 44;
    this.setData({ statusBarHeight: statusHeight, contentHeight: sys.windowHeight - statusHeight - 66 });
    this.setData({
      pendingReviews: [
        { title: '生产排程效率优化方案', severity: 8, severityLevel: 'high', description: '当前排程依赖人工经验，计划引入AI动态排程系统，预计提升产能利用率15%', tags: ['制造业', '排程优化', 'AI预测'], decision: null },
        { title: '客户流失预警模型', severity: 7, severityLevel: 'high', description: '基于历史交易数据构建流失预测模型，预警准确率目标85%以上', tags: ['零售', '客户分析', '机器学习'], decision: null },
        { title: '文档智能审核系统', severity: 5, severityLevel: 'medium', description: '利用NLP技术实现合同与报告自动审核，减少人工审核工作量60%', tags: ['专业服务', 'NLP', '文档处理'], decision: null }
      ],
      keyDecisions: [
        { question: '是否推进整体方案', options: ['推进', '暂缓', '终止'], selected: null },
        { question: '优先级排序', options: ['P0-紧急', 'P1-重要', 'P2-常规', 'P3-低优'], selected: null },
        { question: '方案可行性评估', options: ['完全可行', '部分可行', '需要调整', '不可行'], selected: null },
        { question: '实现路径选择', options: ['自研开发', '外包合作', '混合模式', '采购产品'], selected: null },
        { question: '交付范围确认', options: ['全量交付', '分阶段交付', '最小可行', '定制范围'], selected: null }
      ]
    });
  },
  onReviewDecision(e) {
    const { index, decision } = e.currentTarget.dataset;
    this.setData({ [`pendingReviews[${index}].decision`]: decision });
  },
  onDecisionSelect(e) {
    const { card, opt } = e.currentTarget.dataset;
    this.setData({ [`keyDecisions[${card}].selected`]: opt });
  },
  onConfirm() { wx.showToast({ title: '提交成功', icon: 'success', duration: 2000 }); }
});
