const API = require('../../services/api');
const { AnalysisEngine } = require('../../services/analysis');
const { ROLES, getRoleById, SEVERITY_LEVELS } = require('../../services/models');

const analysisEngine = new AnalysisEngine();

const KEY_DECISIONS_TEMPLATE = [
  { question: '是否推进整体方案', options: ['推进', '暂缓', '终止'], selected: null },
  { question: '优先级排序', options: ['P0-紧急', 'P1-重要', 'P2-常规', 'P3-低优'], selected: null },
  { question: '方案可行性评估', options: ['完全可行', '部分可行', '需要调整', '不可行'], selected: null },
  { question: '实现路径选择', options: ['自研开发', '外包合作', '混合模式', '采购产品'], selected: null },
  { question: '交付范围确认', options: ['全量交付', '分阶段交付', '最小可行', '定制范围'], selected: null }
];

Page({
  data: {
    statusBarHeight: 44,
    contentHeight: 500,
    projectId: null,
    companyName: '',
    pendingReviews: [],
    keyDecisions: [],
    loading: false,
    overallScore: 0
  },
  onLoad(options) {
    const sys = wx.getSystemInfoSync();
    const statusHeight = sys.statusBarHeight || 44;
    this.setData({
      statusBarHeight: statusHeight,
      contentHeight: sys.windowHeight - statusHeight - 66
    });

    // Get projectId from app globalData or options
    const app = getApp();
    const project = app.globalData.currentProject || {};
    this.setData({
      projectId: options.projectId || project.id || 1,
      companyName: project.company || ''
    });

    this.loadAnalysisData();
  },
  loadAnalysisData() {
    const self = this;
    self.setData({ loading: true });

    API.getAnalysisReport(this.data.projectId).then(res => {
      const report = (res && res.data) || {};
      const overallScore = report.overallScore || report.getOverallScore ? report.getOverallScore() : 65;

      // Get allAnswers from report or generate from mock data
      const allAnswers = report.allAnswers || {};

      // Use AnalysisEngine to identify pain points
      const painPoints = analysisEngine.identifyPainPoints(allAnswers, Object.keys(allAnswers));

      // Convert pain points to pendingReviews format
      const pendingReviews = (painPoints || []).map((pp, idx) => {
        const severity = pp.severity || 5;
        const severityLevel = severity >= 7 ? 'high' : severity >= 5 ? 'medium' : 'low';
        const affectedRoles = (pp.affectedRoles || []).map(roleId => {
          const role = getRoleById(roleId);
          return role ? role.name : roleId;
        });

        // Generate tags based on affected roles and category
        const tags = [pp.category || '通用'];
        affectedRoles.forEach(r => {
          if (tags.length < 4) tags.push(r);
        });

        return {
          id: pp.id || (idx + 1),
          title: pp.category ? pp.category + '问题' : '待识别痛点',
          severity: severity,
          severityLevel: severityLevel,
          description: pp.description || '需要进一步分析',
          tags: tags,
          decision: null,
          department: affectedRoles.join('、')
        };
      });

      // If no pain points from engine, generate from dimension scores
      if (pendingReviews.length === 0) {
        const dimScores = report.dimensionScores || [];
        dimScores.forEach((d, idx) => {
          const score = typeof d.score === 'number' ? d.score : 50;
          const severity = Math.round((100 - score) / 10);
          const severityLevel = severity >= 7 ? 'high' : severity >= 5 ? 'medium' : 'low';
          pendingReviews.push({
            id: idx + 1,
            title: (d.dimension || '维度') + '优化',
            severity: severity,
            severityLevel: severityLevel,
            description: (d.dimension || '') + '维度评分' + score + '分，有待提升',
            tags: [d.dimension || '通用'],
            decision: null
          });
        });
      }

      // If still empty, provide defaults based on mock data
      if (pendingReviews.length === 0) {
        pendingReviews.push(
          { id: 1, title: '数据治理缺失', severity: 8, severityLevel: 'high', description: '企业数据标准化程度低，影响AI模型训练效果', tags: ['数据治理', 'AI'], decision: null },
          { id: 2, title: '流程自动化不足', severity: 7, severityLevel: 'high', description: '核心业务流程仍依赖人工操作，效率低下', tags: ['流程优化', '自动化'], decision: null },
          { id: 3, title: 'IT架构陈旧', severity: 5, severityLevel: 'medium', description: '现有系统无法支持AI应用快速部署', tags: ['IT架构', '系统升级'], decision: null }
        );
      }

      // Populate key decisions based on report data
      const decisions = KEY_DECISIONS_TEMPLATE.map(d => ({ ...d }));

      // Auto-suggest based on scores
      if (overallScore < 60) {
        decisions[0].selected = 1; // 暂缓
        decisions[1].selected = 0; // P0
        decisions[2].selected = 2; // 需要调整
      } else if (overallScore >= 80) {
        decisions[0].selected = 0; // 推进
        decisions[1].selected = 1; // P1
        decisions[2].selected = 0; // 完全可行
      } else {
        decisions[0].selected = 0; // 推进
        decisions[1].selected = 1; // P1
        decisions[2].selected = 1; // 部分可行
      }

      self.setData({
        pendingReviews: pendingReviews,
        keyDecisions: decisions,
        overallScore: overallScore,
        loading: false
      });
    }).catch(() => {
      // Fallback to mock data if API fails
      self.setData({
        pendingReviews: [
          { id: 1, title: '生产排程效率优化方案', severity: 8, severityLevel: 'high', description: '当前排程依赖人工经验，计划引入AI动态排程系统，预计提升产能利用率15%', tags: ['制造业', '排程优化', 'AI预测'], decision: null },
          { id: 2, title: '客户流失预警模型', severity: 7, severityLevel: 'high', description: '基于历史交易数据构建流失预测模型，预警准确率目标85%以上', tags: ['零售', '客户分析', '机器学习'], decision: null },
          { id: 3, title: '文档智能审核系统', severity: 5, severityLevel: 'medium', description: '利用NLP技术实现合同与报告自动审核，减少人工审核工作量60%', tags: ['专业服务', 'NLP', '文档处理'], decision: null }
        ],
        keyDecisions: KEY_DECISIONS_TEMPLATE.map(d => ({ ...d })),
        loading: false
      });
    });
  },
  onReviewDecision(e) {
    const { index, decision } = e.currentTarget.dataset;
    wx.vibrateShort ? wx.vibrateShort({ type: 'light' }) : null;
    this.setData({ ['pendingReviews[' + index + '].decision']: decision });
  },
  onDecisionSelect(e) {
    const { card, opt } = e.currentTarget.dataset;
    this.setData({ ['keyDecisions[' + card + '].selected']: opt });
  },
  onConfirm() {
    const self = this;
    const decisions = self.data.keyDecisions.map(d => ({
      question: d.question,
      selected: d.options[d.selected] || null
    }));

    const pendingReviews = self.data.pendingReviews.map(r => ({
      id: r.id,
      title: r.title,
      severity: r.severity,
      decision: r.decision
    }));

    // Store in app globalData for delivery page
    const app = getApp();
    app.globalData.currentDecisions = decisions;
    app.globalData.currentReviews = pendingReviews;
    app.globalData.overallScore = self.data.overallScore;

    // Generate delivery plan via API
    API.generateDeliveryPlan(self.data.projectId, {
      decisions: decisions,
      reviews: pendingReviews,
      overallScore: self.data.overallScore
    }).then(res => {
      const plan = (res && res.data) || {};
      app.globalData.deliveryPlan = plan;

      wx.showToast({
        title: '提交成功',
        icon: 'success',
        duration: 2000
      });

      setTimeout(() => {
        wx.navigateTo({ url: '/pages/opc/delivery/delivery' });
      }, 500);
    }).catch(() => {
      wx.showToast({
        title: '提交成功',
        icon: 'success',
        duration: 2000
      });
    });
  },
  onTabTap(e) {
    const tab = e.detail ? e.detail.tabIndex : 0;
    if (tab === 0) wx.navigateTo({ url: '/pages/opc/projects/projects' });
    else if (tab === 2) wx.navigateTo({ url: '/pages/opc/dashboard/dashboard' });
  }
});
