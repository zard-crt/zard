/**
 * delivery.js - 交付方案引擎
 * 基于分析结果生成结构化的实施计划
 * 包含阶段划分、时间估算、预算核算、依赖管理
 */

/* ========== 方案模板库 ========== */

/** 模块定义：根据痛点类别映射到标准化实施模块 */
const MODULE_TEMPLATES = {
  // ---- 数据基础 ----
  data_platform: {
    id: 'data_platform',
    name: '数据中台搭建',
    description: '搭建统一数据平台，集成各业务系统数据',
    category: 'data',
    effort: '4-6周',
    effortDays: { min: 20, max: 30 },
    estimatedCost: { min: 150000, max: 250000 },
    requiredSkills: ['数据工程师', '后端开发', '数据架构师'],
    dependencies: [],
    painPointMatch: ['数据孤岛']
  },
  data_governance: {
    id: 'data_governance',
    name: '数据治理规范制定',
    description: '建立数据标准、质量规则和安全规范',
    category: 'data',
    effort: '2-3周',
    effortDays: { min: 10, max: 15 },
    estimatedCost: { min: 50000, max: 80000 },
    requiredSkills: ['数据治理专家'],
    dependencies: ['data_platform'],
    painPointMatch: ['数据孤岛', '管理粗放']
  },
  data_bi: {
    id: 'data_bi',
    name: '数据可视化与BI看板',
    description: '搭建管理驾驶舱和业务数据看板',
    category: 'data',
    effort: '3-4周',
    effortDays: { min: 15, max: 20 },
    estimatedCost: { min: 80000, max: 120000 },
    requiredSkills: ['BI工程师', '数据分析师'],
    dependencies: ['data_platform'],
    painPointMatch: ['管理粗放', '数据孤岛']
  },

  // ---- 销售 ----
  crm_system: {
    id: 'crm_system',
    name: 'CRM销售管理系统',
    description: '客户关系管理系统，覆盖线索到回款全流程',
    category: 'sales',
    effort: '5-7周',
    effortDays: { min: 25, max: 35 },
    estimatedCost: { min: 120000, max: 200000 },
    requiredSkills: ['产品经理', '前端开发', '后端开发'],
    dependencies: ['data_platform'],
    painPointMatch: ['工具落后', '获客困难']
  },
  sales_auto: {
    id: 'sales_auto',
    name: '销售自动化（SFA）',
    description: '销售流程自动化，包括报价、合同、审批等',
    category: 'sales',
    effort: '3-4周',
    effortDays: { min: 15, max: 20 },
    estimatedCost: { min: 60000, max: 100000 },
    requiredSkills: ['产品经理', '后端开发'],
    dependencies: ['crm_system'],
    painPointMatch: ['流程低效']
  },
  sales_forecast: {
    id: 'sales_forecast',
    name: 'AI销售预测系统',
    description: '基于历史数据和管道分析的智能销售预测',
    category: 'sales',
    effort: '4-5周',
    effortDays: { min: 20, max: 25 },
    estimatedCost: { min: 100000, max: 150000 },
    requiredSkills: ['数据科学家', 'ML工程师', '后端开发'],
    dependencies: ['crm_system', 'data_platform'],
    painPointMatch: ['管理粗放', '工具落后']
  },

  // ---- 运营 ----
  ops_platform: {
    id: 'ops_platform',
    name: '运营管理平台',
    description: '端到端运营管理，含工单、流程、任务管理',
    category: 'ops',
    effort: '4-6周',
    effortDays: { min: 20, max: 30 },
    estimatedCost: { min: 100000, max: 180000 },
    requiredSkills: ['产品经理', '前后端开发'],
    dependencies: ['data_platform'],
    painPointMatch: ['流程低效', '协作不畅']
  },
  process_auto: {
    id: 'process_auto',
    name: 'RPA流程自动化',
    description: '用RPA自动化高频重复业务流程',
    category: 'ops',
    effort: '2-4周',
    effortDays: { min: 10, max: 20 },
    estimatedCost: { min: 50000, max: 100000 },
    requiredSkills: ['RPA工程师'],
    dependencies: [],
    painPointMatch: ['流程低效', '成本压力']
  },
  quality_mgmt: {
    id: 'quality_mgmt',
    name: '质量管理系统（QMS）',
    description: '数字化质量管理和追溯系统',
    category: 'ops',
    effort: '3-5周',
    effortDays: { min: 15, max: 25 },
    estimatedCost: { min: 80000, max: 130000 },
    requiredSkills: ['产品经理', '后端开发'],
    dependencies: ['ops_platform'],
    painPointMatch: ['管理粗放']
  },

  // ---- 财务 ----
  finance_upgrade: {
    id: 'finance_upgrade',
    name: '财务管理系统升级',
    description: '升级财务系统，实现业财一体化',
    category: 'finance',
    effort: '4-5周',
    effortDays: { min: 20, max: 25 },
    estimatedCost: { min: 80000, max: 150000 },
    requiredSkills: ['财务顾问', '后端开发'],
    dependencies: ['data_platform'],
    painPointMatch: ['工具落后', '数据孤岛']
  },
  finance_bi: {
    id: 'finance_bi',
    name: '财务分析与预算系统',
    description: '财务BI分析、预算管理和现金流预测',
    category: 'finance',
    effort: '3-4周',
    effortDays: { min: 15, max: 20 },
    estimatedCost: { min: 60000, max: 100000 },
    requiredSkills: ['数据分析师', '财务顾问'],
    dependencies: ['finance_upgrade', 'data_bi'],
    painPointMatch: ['管理粗放', '成本压力']
  },

  // ---- 市场 ----
  mkt_platform: {
    id: 'mkt_platform',
    name: '营销自动化平台（MA）',
    description: '多渠道营销自动化，用户触达和培育',
    category: 'marketing',
    effort: '4-6周',
    effortDays: { min: 20, max: 30 },
    estimatedCost: { min: 100000, max: 180000 },
    requiredSkills: ['产品经理', '营销顾问', '开发'],
    dependencies: ['data_platform'],
    painPointMatch: ['获客困难', '工具落后']
  },
  content_ai: {
    id: 'content_ai',
    name: 'AI内容创作平台',
    description: 'AI辅助内容生成、优化和分发管理',
    category: 'marketing',
    effort: '3-4周',
    effortDays: { min: 15, max: 20 },
    estimatedCost: { min: 60000, max: 100000 },
    requiredSkills: ['AI应用工程师', '内容运营'],
    dependencies: [],
    painPointMatch: ['创新不足', '获客困难']
  },

  // ---- HR ----
  hrm_system: {
    id: 'hrm_system',
    name: '一体化HR管理系统',
    description: '覆盖入转调离、考勤、薪酬、绩效的HR平台',
    category: 'hr',
    effort: '4-6周',
    effortDays: { min: 20, max: 30 },
    estimatedCost: { min: 80000, max: 150000 },
    requiredSkills: ['产品经理', '前后端开发'],
    dependencies: ['data_platform'],
    painPointMatch: ['工具落后', '流程低效']
  },
  talent_analytics: {
    id: 'talent_analytics',
    name: '人才数据分析系统',
    description: '人才盘点、流失预测、组织效能分析',
    category: 'hr',
    effort: '3-4周',
    effortDays: { min: 15, max: 20 },
    estimatedCost: { min: 60000, max: 90000 },
    requiredSkills: ['数据分析师', 'HR顾问'],
    dependencies: ['hrm_system', 'data_bi'],
    painPointMatch: ['管理粗放', '人才短缺']
  },

  // ---- AI 智能 ----
  ai_decision: {
    id: 'ai_decision',
    name: 'AI辅助决策系统',
    description: '基于大模型的智能分析决策支持系统',
    category: 'ai',
    effort: '5-8周',
    effortDays: { min: 25, max: 40 },
    estimatedCost: { min: 150000, max: 300000 },
    requiredSkills: ['数据科学家', 'NLP工程师', '全栈开发'],
    dependencies: ['data_platform', 'data_governance'],
    painPointMatch: ['管理粗放', '创新不足']
  },
  ai_chatbot: {
    id: 'ai_chatbot',
    name: '智能客服/问答系统',
    description: '基于LLM的智能客服和内部知识问答系统',
    category: 'ai',
    effort: '3-5周',
    effortDays: { min: 15, max: 25 },
    estimatedCost: { min: 80000, max: 150000 },
    requiredSkills: ['NLP工程师', '前端开发'],
    dependencies: ['data_platform'],
    painPointMatch: ['创新不足', '协作不畅']
  }
};

/** 阶段模板 */
const PHASE_TEMPLATES = [
  {
    id: 'phase1',
    name: '第一阶段：基础建设',
    duration: '第1-2月',
    description: '搭建数字基础设施，包括数据平台和基础系统',
    moduleCategories: ['data'],
    order: 0
  },
  {
    id: 'phase2',
    name: '第二阶段：核心应用',
    duration: '第3-4月',
    description: '实施各业务线核心管理系统',
    moduleCategories: ['sales', 'ops', 'finance', 'marketing', 'hr'],
    order: 1,
    dependenciesOnPhase: ['phase1']
  },
  {
    id: 'phase3',
    name: '第三阶段：智能升级',
    duration: '第5-6月',
    description: 'AI智能化应用和系统深度整合',
    moduleCategories: ['ai'],
    order: 2,
    dependenciesOnPhase: ['phase1', 'phase2']
  },
  {
    id: 'phase4',
    name: '第四阶段：优化运营',
    duration: '第7-8月',
    description: '系统优化、培训和持续改进',
    moduleCategories: [],
    order: 3,
    dependenciesOnPhase: ['phase1', 'phase2', 'phase3']
  }
];

/** 风险模板 */
const RISK_TEMPLATES = [
  {
    risk: '数据迁移风险',
    level: '中',
    mitigation: '制定详细数据迁移计划，包含数据备份、校验和回滚机制，先进行小范围试点'
  },
  {
    risk: '员工适应风险',
    level: '中',
    mitigation: '分阶段培训，设置过渡期并行运行，建立反馈和问题快速响应机制'
  },
  {
    risk: '系统兼容风险',
    level: '低',
    mitigation: '前期充分调研现有系统接口，预留API适配层，选择开放标准的技术方案'
  },
  {
    risk: '项目延期风险',
    level: '中',
    mitigation: '采用敏捷开发模式，设置里程碑检查点，预留10-15%缓冲时间'
  },
  {
    risk: '预算超支风险',
    level: '中',
    mitigation: '分阶段投入，每阶段结束后评估ROI再决定下一阶段投入'
  }
];

/* ======================================================================
   DeliveryEngine 类
   ====================================================================== */
class DeliveryEngine {

  /**
   * 基于分析结果和用户决策生成实施计划
   * @param {object} analysis  - generateReport 的返回结果
   * @param {array}  decisions - 用户选择的关注领域（可选）
   */
  generatePlan(analysis, decisions) {
    if (!analysis) return null;

    const modules = this._selectModules(analysis, decisions);
    const phases = this.generatePhases(modules);
    const sortedPhases = phases.sort((a, b) => a.order - b.order);
    const timeline = this.estimateTimeline(sortedPhases);
    const budget = this.estimateBudget(sortedPhases);
    const dependencies = this.generateDependencies(modules);
    const riskPoints = RISK_TEMPLATES.map(r => ({ ...r }));

    return {
      projectId: analysis.projectId,
      planName: '数字化转型实施计划',
      phases: sortedPhases.map(p => ({
        id: p.id,
        name: p.name,
        duration: p.duration,
        order: p.order,
        modules: p.modules.map(mId => {
          const tmpl = MODULE_TEMPLATES[mId];
          return tmpl ? { ...tmpl } : null;
        }).filter(Boolean)
      })),
      totalTimeline: timeline,
      totalBudget: budget,
      riskPoints,
      dependencies,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * 根据分析结果和决策选择模块
   */
  _selectModules(analysis, decisions) {
    if (!analysis) return [];

    const selectedModules = new Set();
    const painPointCategories = (analysis.painPoints || []).map(p => p.category);
    const roleScores = analysis.roleScores || [];

    // 1. 根据痛点匹配模块
    Object.values(MODULE_TEMPLATES).forEach(tmpl => {
      const matches = tmpl.painPointMatch.filter(p => painPointCategories.includes(p));
      if (matches.length > 0) {
        selectedModules.add(tmpl.id);
      }
    });

    // 2. 根据角色评分（低分部门优先配模块）
    roleScores.forEach(rs => {
      if (rs.score < 60) {
        // 低分部门自动匹配相應模块
        const roleModuleMap = {
          sales: ['crm_system', 'sales_auto'],
          ops: ['ops_platform', 'process_auto'],
          finance: ['finance_upgrade'],
          marketing: ['mkt_platform'],
          hr: ['hrm_system']
        };
        const modules = roleModuleMap[rs.role] || [];
        modules.forEach(m => selectedModules.add(m));
      }
    });

    // 3. 如果用户指定了决策，按决策过滤
    if (decisions && decisions.length > 0) {
      const filtered = new Set();
      decisions.forEach(dec => {
        Object.values(MODULE_TEMPLATES).forEach(tmpl => {
          if (tmpl.category === dec || tmpl.painPointMatch.includes(dec)) {
            filtered.add(tmpl.id);
          }
        });
      });
      if (filtered.size > 0) {
        // 用决策过滤 + 保留依赖
        filtered.forEach(m => {
          selectedModules.add(m);
          // 添加依赖
          const tmpl = MODULE_TEMPLATES[m];
          if (tmpl) {
            tmpl.dependencies.forEach(dep => selectedModules.add(dep));
          }
        });
      }
    }

    // 4. 始终包含数据平台（基础）
    selectedModules.add('data_platform');

    return Array.from(selectedModules);
  }

  /**
   * 将模块分配到阶段
   */
  generatePhases(modules) {
    if (!modules || modules.length === 0) return [];

    const phaseMap = {};
    PHASE_TEMPLATES.forEach(p => {
      phaseMap[p.id] = {
        ...p,
        modules: []
      };
    });

    // 分配模块到阶段
    modules.forEach(modId => {
      const tmpl = MODULE_TEMPLATES[modId];
      if (!tmpl) return;

      // 根据类别分配阶段
      let targetPhase = null;
      if (tmpl.category === 'ai') {
        targetPhase = phaseMap['phase3'];
      } else if (tmpl.category === 'data') {
        targetPhase = phaseMap['phase1'];
      } else {
        targetPhase = phaseMap['phase2'];
      }

      if (targetPhase) {
        targetPhase.modules.push(modId);
      }
    });

    // 添加第四阶段（培训+优化）
    phaseMap['phase4'].modules = ['training_handover'];

    return Object.values(phaseMap).filter(p => p.modules.length > 0);
  }

  /**
   * 估算总体时间线
   */
  estimateTimeline(phases) {
    if (!phases || phases.length === 0) return '0个月';

    // 计算总人天
    let totalDays = 0;
    phases.forEach(p => {
      p.modules.forEach(modId => {
        const tmpl = MODULE_TEMPLATES[modId];
        if (tmpl && tmpl.effortDays) {
          // 取中间值
          const avgDays = Math.round((tmpl.effortDays.min + tmpl.effortDays.max) / 2);
          totalDays += avgDays;
        }
      });
    });

    // 考虑并行（按阶段并行度 0.6-0.7 系数）
    const parallelFactor = 0.65;
    const actualDays = Math.round(totalDays * parallelFactor);
    const months = Math.max(3, Math.ceil(actualDays / 22));

    return months + '个月';
  }

  /**
   * 生成预算估算
   */
  estimateBudget(phases) {
    let totalMin = 0;
    let totalMax = 0;
    const breakdown = [];

    phases.forEach(p => {
      p.modules.forEach(modId => {
        const tmpl = MODULE_TEMPLATES[modId];
        if (tmpl && tmpl.estimatedCost) {
          totalMin += tmpl.estimatedCost.min;
          totalMax += tmpl.estimatedCost.max;
          breakdown.push({
            item: tmpl.name,
            amount: Math.round((tmpl.estimatedCost.min + tmpl.estimatedCost.max) / 2),
            range: { min: tmpl.estimatedCost.min, max: tmpl.estimatedCost.max }
          });
        }
      });
    });

    // 加入培训与运维（15%）
    const trainingCost = Math.round((totalMin + totalMax) / 2 * 0.15);
    breakdown.push({
      item: '培训与运维支持',
      amount: trainingCost,
      range: { min: Math.round(trainingCost * 0.7), max: Math.round(trainingCost * 1.3) }
    });

    return {
      min: totalMin + Math.round(trainingCost * 0.7),
      max: totalMax + Math.round(trainingCost * 1.3),
      currency: 'CNY',
      breakdown,
      note: '以上为项目交付预算，不含第三方软件许可费和硬件成本'
    };
  }

  /**
   * 生成模块依赖关系图
   */
  generateDependencies(modules) {
    if (!modules) return [];

    const deps = [];
    const moduleSet = new Set(modules);

    modules.forEach(modId => {
      const tmpl = MODULE_TEMPLATES[modId];
      if (!tmpl) return;

      tmpl.dependencies.forEach(depId => {
        // 只记录双方都在选中的模块中的依赖
        if (moduleSet.has(depId)) {
          deps.push({
            from: modId,
            fromName: tmpl.name,
            to: depId,
            toName: MODULE_TEMPLATES[depId] ? MODULE_TEMPLATES[depId].name : depId,
            type: 'depends_on'
          });
        }
      });
    });

    return deps;
  }

  /**
   * 格式化为交付文档结构
   */
  formatDeliverable(plan) {
    if (!plan) return null;

    return {
      title: plan.planName,
      version: '1.0',
      generatedAt: plan.generatedAt,
      sections: [
        {
          title: '项目概述',
          type: 'summary',
          content: {
            totalTimeline: plan.totalTimeline,
            totalBudget: `¥${(plan.totalBudget.min / 10000).toFixed(0)}万 ~ ¥${(plan.totalBudget.max / 10000).toFixed(0)}万`,
            phaseCount: plan.phases.length,
            moduleCount: plan.phases.reduce((sum, p) => sum + p.modules.length, 0)
          }
        },
        {
          title: '实施路线图',
          type: 'roadmap',
          content: plan.phases.map(p => ({
            phase: p.name,
            duration: p.duration,
            modules: p.modules.map(m => m.name)
          }))
        },
        {
          title: '预算明细',
          type: 'budget',
          content: plan.totalBudget
        },
        {
          title: '风险评估与应对',
          type: 'risks',
          content: plan.riskPoints
        },
        {
          title: '模块依赖关系',
          type: 'dependencies',
          content: plan.dependencies
        }
      ]
    };
  }
}

module.exports = {
  DeliveryEngine,
  MODULE_TEMPLATES,
  PHASE_TEMPLATES,
  RISK_TEMPLATES
};
