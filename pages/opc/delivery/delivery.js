const app = getApp(); const API = app.services.API; const { ROLES, SEVERITY_LEVELS, DeliveryEngine } = app.services;

const deliveryEngine = new app.services.DeliveryEngine();

Page({
  data: {
    statusBarHeight: 44,
    contentHeight: 500,
    planName: '',
    budget: '',
    phases: [],
    inclusions: [
      { label: '诊断报告', selected: true },
      { label: '数据看板', selected: true },
      { label: '实施方案', selected: true },
      { label: '培训支持', selected: true },
      { label: '技术支持', selected: false },
      { label: '后续迭代', selected: false }
    ],
    exclusions: [
      { label: '硬件采购', selected: false },
      { label: '第三方系统', selected: false },
      { label: '长期运维', selected: false },
      { label: '组织变革', selected: false }
    ],
    projectId: null,
    totalBudget: null,
    totalTimeline: '',
    riskPoints: [],
    deliverablePreview: null,
    showPreview: false
  },
  onLoad(options) {
    const sys = wx.getSystemInfoSync();
    const statusHeight = sys.statusBarHeight || 44;
    this.setData({
      statusBarHeight: statusHeight,
      contentHeight: sys.windowHeight - (sys.statusBarHeight || 44) - 66
    });

    const project = app.globalData.currentProject || {};
    const decisions = app.globalData.currentDecisions || [];
    const deliveryPlan = app.globalData.deliveryPlan || null;
    const overallScore = app.globalData.overallScore || 65;

    const projectId = options.projectId || project.id || 1;
    this.setData({ projectId: projectId });

    // Generate plan name based on company
    const companyName = project.company || project.companyName || '';
    this.setData({ planName: companyName ? companyName + '数字化转型方案' : '数字化转型方案' });

    if (deliveryPlan) {
      // Use pre-generated plan from workspace
      this._applyDeliveryPlan(deliveryPlan);
    } else {
      // Generate from scratch
      this._generatePlan(projectId, decisions, overallScore);
    }
  },
  _generatePlan(projectId, decisions, overallScore) {
    const self = this;

    // Use decisions to determine pain points / focus areas
    const painPointCategories = [];
    const decisionTexts = decisions.map(d => d.selected || '');

    if (decisionTexts.some(t => t.includes('推进') || t.includes('P0'))) {
      painPointCategories.push('数据孤岛', '流程低效');
    }
    if (decisionTexts.some(t => t.includes('P1') || t.includes('部分可行'))) {
      painPointCategories.push('工具落后', '管理粗放');
    }
    if (decisionTexts.some(t => t.includes('P2'))) {
      painPointCategories.push('人才短缺', '协作不畅');
    }
    // Always add at least some default categories
    if (painPointCategories.length === 0) {
      painPointCategories.push('数据孤岛', '流程低效', '工具落后');
    }

    // Generate modules from pain points
    const matchedModules = deliveryEngine.matchModules(painPointCategories);
    const moduleIds = matchedModules.map(m => m.id);

    // Generate phases
    const phases = deliveryEngine.generatePhases(moduleIds);

    // Generate timeline and budget
    const totalTimeline = deliveryEngine.estimateTimeline(phases);
    const totalBudget = deliveryEngine.estimateBudget(phases);

    // Generate risk points
    const riskPoints = RISK_TEMPLATES.slice(0, 3).map(r => r);

    // Build phase display data
    const phaseDisplay = [];
    phases.forEach((p, pIdx) => {
      p.modules.forEach(modId => {
        const tmpl = MODULE_TEMPLATES[modId];
        if (tmpl) {
          phaseDisplay.push({
            name: tmpl.name,
            content: tmpl.description + '（' + p.name + '，预计' + (tmpl.effort || '3周') + '）'
          });
        }
      });
    });

    // If no modules matched, add defaults
    if (phaseDisplay.length === 0) {
      phaseDisplay.push({ name: '现状调研与需求分析', content: '对企业现有业务流程、数据资产进行系统调研，采集核心业务数据' });
      phaseDisplay.push({ name: 'AI诊断与机会识别', content: '基于采集数据应用AI模型进行诊断，识别关键改进机会与痛点' });
      phaseDisplay.push({ name: '方案设计与规划', content: '针对诊断结果设计数字化解决方案和实施路线图' });
      phaseDisplay.push({ name: '实施与交付', content: '按计划分阶段实施数字化方案，确保交付质量' });
      phaseDisplay.push({ name: '培训与知识转移', content: '对企业团队进行系统培训，确保可持续运营能力' });
    }

    // Build the full plan object
    const plan = {
      planName: self.data.planName,
      projectId: projectId,
      phases: phases,
      totalTimeline: totalTimeline,
      totalBudget: totalBudget,
      riskPoints: riskPoints,
      generatedAt: new Date().toISOString(),
      dependencies: deliveryEngine.generateDependencies(moduleIds)
    };

    // Generate deliverable preview
    const deliverablePreview = deliveryEngine.formatDeliverable(plan);

    // Budget display string
    const budgetStr = totalBudget ? totalBudget.min + ' ~ ' + totalBudget.max + ' 元' : '';

    self.setData({
      phases: phaseDisplay,
      totalTimeline: totalTimeline,
      totalBudget: totalBudget,
      budget: totalBudget ? String(totalBudget.min) : '',
      riskPoints: riskPoints,
      deliverablePreview: deliverablePreview,
      showPreview: false
    });

    // Store in app globalData
    app.globalData.deliveryPlan = plan;
    app.globalData.generatedDeliverable = deliverablePreview;
  },
  _applyDeliveryPlan(plan) {
    const phaseDisplay = [];
    if (plan.phases) {
      plan.phases.forEach(p => {
        if (p.modules) {
          p.modules.forEach(m => {
            phaseDisplay.push({
              name: m.name || m.title || '未命名模块',
              content: m.description || m.content || (m.effort ? '预计' + m.effort : '')
            });
          });
        }
      });
    }

    if (phaseDisplay.length === 0) {
      phaseDisplay.push({ name: '现状调研', content: '系统调研与分析' });
      phaseDisplay.push({ name: '方案实施', content: '按计划执行交付' });
    }

    const budgetStr = plan.totalBudget ? (plan.totalBudget.min || 0) + ' ~ ' + (plan.totalBudget.max || 0) + ' 元' : '';
    const deliverablePreview = deliveryEngine.formatDeliverable(plan);

    this.setData({
      planName: plan.planName || this.data.planName,
      phases: phaseDisplay,
      totalTimeline: plan.totalTimeline || '',
      totalBudget: plan.totalBudget || null,
      budget: plan.totalBudget ? String(plan.totalBudget.min || 0) : '',
      riskPoints: plan.riskPoints || [],
      deliverablePreview: deliverablePreview
    });
  },
  onNameInput(e) { this.setData({ planName: e.detail.value }); },
  onPhaseNameInput(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ ['phases[' + index + '].name']: e.detail.value });
  },
  onPhaseContentInput(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ ['phases[' + index + '].content']: e.detail.value });
  },
  onAddPhase() {
    this.setData({ phases: [...this.data.phases, { name: '', content: '' }] });
    setTimeout(() => { wx.pageScrollTo ? wx.pageScrollTo({ selector: '.phase-end', duration: 300 }) : null; }, 100);
  },
  onDeletePhase(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ phases: this.data.phases.filter(function(_, i) { return i !== index; }) });
  },
  onBudgetInput(e) { this.setData({ budget: e.detail.value }); },
  onToggleInclude(e) {
    const { index } = e.currentTarget.dataset;
    wx.vibrateShort ? wx.vibrateShort({ type: 'light' }) : null;
    this.setData({ ['inclusions[' + index + '].selected']: !this.data.inclusions[index].selected });
  },
  onToggleExclude(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ ['exclusions[' + index + '].selected']: !this.data.exclusions[index].selected });
  },
  onPreview() {
    const self = this;

    // Build final deliverable from current form state
    const plan = app.globalData.deliveryPlan || {};
    const phasesData = self.data.phases.map(function(p, idx) {
      return { name: '阶段' + (idx + 1) + '：' + p.name, content: p.content };
    });

    const deliverable = {
      title: self.data.planName,
      version: '1.0',
      generatedAt: new Date().toISOString(),
      sections: [
        { title: '项目概述', type: 'summary', content: { totalTimeline: self.data.totalTimeline || '待定', totalBudget: self.data.budget || '待定', phaseCount: self.data.phases.length, moduleCount: self.data.phases.length } },
        { title: '实施路线图', type: 'roadmap', content: phasesData },
        { title: '预算明细', type: 'budget', content: self.data.totalBudget || { min: parseInt(self.data.budget) || 0, max: parseInt(self.data.budget) * 1.3 || 0, currency: 'CNY', breakdown: [] } },
        { title: '交付范围', type: 'scope', content: { inclusions: self.data.inclusions.filter(function(i) { return i.selected; }).map(function(i) { return i.label; }), exclusions: self.data.exclusions.filter(function(e) { return e.selected; }).map(function(e) { return e.label; }) } }
      ]
    };

    // Show modal preview
    wx.showModal({
      title: '方案预览 - ' + self.data.planName,
      content: '总预算：' + self.data.budget + '\n阶段数：' + self.data.phases.length + '\n包含内容：' + self.data.inclusions.filter(function(i) { return i.selected; }).length + '项',
      confirmText: '确认提交',
      cancelText: '继续编辑',
      success: function(res) {
        if (res.confirm) {
          app.globalData.finalDeliverable = deliverable;
          self.onSubmit();
        }
      }
    });
  },
  onSubmit() {
    const self = this;
    wx.showModal({
      title: '确认提交',
      content: '确认提交此交付方案？',
      success: function(res) {
        if (res.confirm) {
          // Build final plan data
          const finalPlan = {
            planName: self.data.planName,
            phases: self.data.phases,
            budget: self.data.budget,
            inclusions: self.data.inclusions.filter(function(i) { return i.selected; }).map(function(i) { return i.label; }),
            exclusions: self.data.exclusions.filter(function(e) { return e.selected; }).map(function(e) { return e.label; }),
            timestamp: new Date().toISOString()
          };
          app.globalData.submittedPlan = finalPlan;

          wx.showToast({
            title: '提交成功',
            icon: 'success',
            duration: 2000
          });

          setTimeout(function() {
            wx.navigateBack();
          }, 500);
        }
      }
    });
  }
});
