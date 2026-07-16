/**
 * analysis.js - 分析引擎
 * 聚合角色答案、识别痛点、生成评分与报告
 * 用于 OPC（知晨科技）端的数据分析展示
 */

/* 各分析维度的权重配置 */
const DIMENSION_WEIGHTS = {
  strategy:     { name: '战略规划',   weight: 0.20, tags: ['goals', 'metrics', 'expectation', 'timeline'] },
  organization: { name: '组织能力',   weight: 0.20, tags: ['team_size', 'collaboration', 'cross_dept', 'talent', 'training'] },
  technology:   { name: '技术基础',   weight: 0.25, tags: ['tools', 'digitalization', 'data_infrastructure', 'ai_adoption', 'data_quality'] },
  data_culture: { name: '数据文化',   weight: 0.20, tags: ['decision_making', 'data_flow', 'analytics', 'data_shared', 'reporting'] },
  process:      { name: '流程效率',   weight: 0.15, tags: ['process', 'automation', 'sales_process', 'standardization', 'approval'] }
};

/* 痛点关键词 → 类别映射 */
const PAIN_POINT_KEYWORDS = [
  { category: '数据孤岛',      keywords: ['data_silo', 'data_scattered', 'data_mismatch', 'data_flow', 'data_shared', 'isolated', 'data_infrastructure'], weight: 1.0 },
  { category: '流程低效',      keywords: ['approval_slow', 'slow_approval', 'manual_work', 'manual_errors', 'process', 'automation', 'auto', 'efficiency'], weight: 1.0 },
  { category: '管理粗放',      keywords: ['management', 'gut', 'experience', 'decision_making', 'budget', 'forecasting', 'forecast'], weight: 0.8 },
  { category: '工具落后',      keywords: ['tools', 'crm', 'satisfaction', 'none', 'manual', 'standalone', 'basic', 'platform'], weight: 0.9 },
  { category: '人才短缺',      keywords: ['talent', 'training', 'skills', 'adoption', 'turnover', 'recruitment'], weight: 0.8 },
  { category: '协作不畅',      keywords: ['collaboration', 'cross_dept', 'communication', 'handoff', 'alignment', 'coordination'], weight: 0.8 },
  { category: '获客困难',      keywords: ['customer_acquisition', 'lead_quality', 'high_cost', 'competition', 'channels', 'marketing'], weight: 0.7 },
  { category: '成本压力',      keywords: ['cost', 'cashflow', 'budget', 'cost_reduction'], weight: 0.6 },
  { category: '创新不足',      keywords: ['innovation', 'ai_adoption', 'product_innovation', 'content'], weight: 0.5 }
];

/* 热力图维度配置 */
const HEATMAP_CONFIG = {
  roles: ['ceo', 'sales', 'ops', 'finance', 'marketing', 'hr'],
  dimensions: [
    { id: 'data_mgmt',     name: '数据管理',     tags: ['data_infrastructure', 'data_quality', 'data_flow', 'data_shared', 'analytics'] },
    { id: 'process_auto',  name: '流程自动化',   tags: ['process', 'automation', 'tools', 'digitalization'] },
    { id: 'collaboration', name: '团队协作',     tags: ['collaboration', 'cross_dept', 'communication'] },
    { id: 'decision',      name: '决策支持',     tags: ['decision_making', 'reporting', 'forecasting', 'metrics'] },
    { id: 'customer',      name: '客户管理',     tags: ['crm', 'customer_insight', 'customer_view', 'lead_management', 'sales_process'] },
    { id: 'finance_int',   name: '业财一体',     tags: ['accounting', 'reconciliation', 'budget', 'cashflow', 'finance'] }
  ]
};

/* ======================================================================
   AnalysisEngine 类
   ====================================================================== */
class AnalysisEngine {

  /**
   * 聚合所有参与者的答案
   * @param {object} allAnswers - { roleId: [answers...] }
   */
  aggregateAnswers(allAnswers) {
    if (!allAnswers) return null;

    const aggregated = {
      roles: {},
      totalAnswers: 0,
      participation: []
    };

    Object.keys(allAnswers).forEach(roleId => {
      const answers = allAnswers[roleId] || [];
      aggregated.roles[roleId] = this._aggregateRole(roleId, answers);
      aggregated.totalAnswers += answers.length;
      aggregated.participation.push({
        role: roleId,
        count: answers.length,
        status: answers.length > 0 ? 'completed' : 'pending'
      });
    });

    return aggregated;
  }

  /**
   * 聚合单个角色的答案
   */
  _aggregateRole(roleId, answers) {
    const result = {
      roleId,
      totalQuestions: answers.length,
      answeredQuestions: answers.filter(a => a.answer !== null && a.answer !== undefined).length,
      score: 0,
      tagScores: {},
      painPoints: [],
      dimensionScores: {}
    };

    if (result.answeredQuestions === 0) return result;

    // 按标签聚合评分
    const tagScoreMap = {};
    const tagCountMap = {};

    answers.forEach(a => {
      const q = a.question || {};
      const tags = q.tags || [];
      let score = 0;

      // 计算单题得分
      if (a.answer !== null && a.answer !== undefined) {
        if (typeof a.answer === 'number') {
          // rating 题：直接归一化
          score = (a.answer / 5) * 100;
        } else if (q.choices) {
          // choice/multi_choice 题
          if (Array.isArray(a.answer)) {
            const chosen = q.choices.filter(c => a.answer.includes(c.value));
            const avgScore = chosen.reduce((s, c) => s + (c.score || 3), 0) / chosen.length;
            score = (avgScore / 5) * 100;
          } else {
            const chosen = q.choices.find(c => c.value === a.answer);
            score = ((chosen ? chosen.score || 3 : 3) / 5) * 100;
          }
        }
      }

      tags.forEach(tag => {
        if (!tagScoreMap[tag]) { tagScoreMap[tag] = 0; tagCountMap[tag] = 0; }
        tagScoreMap[tag] += score;
        tagCountMap[tag]++;
      });
    });

    // 计算各标签平均分
    Object.keys(tagScoreMap).forEach(tag => {
      result.tagScores[tag] = Math.round(tagScoreMap[tag] / tagCountMap[tag]);
    });

    // 计算维度得分
    Object.keys(DIMENSION_WEIGHTS).forEach(dimKey => {
      const dim = DIMENSION_WEIGHTS[dimKey];
      let totalScore = 0;
      let matchedTags = 0;

      dim.tags.forEach(tag => {
        if (result.tagScores[tag] !== undefined) {
          totalScore += result.tagScores[tag];
          matchedTags++;
        }
      });

      result.dimensionScores[dimKey] = {
        name: dim.name,
        score: matchedTags > 0 ? Math.round(totalScore / matchedTags) : 0,
        maxScore: 100,
        matchedTags
      };
    });

    // 综合评分（加权平均）
    let weightedScore = 0;
    let totalWeight = 0;
    Object.keys(DIMENSION_WEIGHTS).forEach(dimKey => {
      const dim = DIMENSION_WEIGHTS[dimKey];
      const dimScore = result.dimensionScores[dimKey];
      if (dimScore && dimScore.matchedTags > 0) {
        weightedScore += dimScore.score * dim.weight;
        totalWeight += dim.weight;
      }
    });
    result.score = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;

    return result;
  }

  /**
   * 从聚合数据中识别痛点
   * @param {object} aggregated - aggregateAnswers 的返回值
   */
  identifyPainPoints(aggregated) {
    if (!aggregated || !aggregated.roles) return [];

    const painPointMap = {};

    Object.keys(aggregated.roles).forEach(roleId => {
      const roleData = aggregated.roles[roleId];

      PAIN_POINT_KEYWORDS.forEach(pp => {
        let severity = 0;
        let matchedTags = 0;

        pp.keywords.forEach(kw => {
          // 检查标签分数低（<60）表示该方面薄弱
          if (roleData.tagScores[kw] !== undefined) {
            matchedTags++;
            const deficiency = 100 - roleData.tagScores[kw];
            severity += deficiency * pp.weight;
          }
          // 检查答案中是否包含该关键词
          // (实际使用中可做更复杂的 NLP 匹配)
        });

        if (matchedTags > 0) {
          const avgSeverity = severity / matchedTags;
          if (avgSeverity > 15) { // 阈值：15分以上视为痛点
            const key = pp.category + '_' + roleId;
            if (!painPointMap[key]) {
              painPointMap[key] = {
                category: pp.category,
                severity: 0,
                roles: [],
                descriptions: []
              };
            }
            painPointMap[key].severity += avgSeverity;
            painPointMap[key].roles.push(roleId);
          }
        }
      });
    });

    // 归一化与排序
    const painPoints = Object.values(painPointMap).map(pp => {
      const avgSeverity = pp.severity / pp.roles.length;
      const normalized = Math.min(10, Math.round((avgSeverity / 100) * 10 * 10) / 10);
      return {
        category: pp.category,
        severity: normalized,
        affectedRoles: [...new Set(pp.roles)],
        description: this._getPainPointDescription(pp.category, normalized)
      };
    });

    return painPoints.sort((a, b) => b.severity - a.severity);
  }

  /**
   * 为指定的痛点生成严重程度分值
   */
  calculateSeverity(painPoint, answers) {
    if (!painPoint || !answers) return 0;
    let severity = painPoint.severity || 0;

    // 如果有多部门数据，加重严重程度
    if (painPoint.affectedRoles && painPoint.affectedRoles.length > 1) {
      severity += (painPoint.affectedRoles.length - 1) * 0.5;
    }

    return Math.min(10, severity);
  }

  /**
   * 生成跨部门影响矩阵
   * @param {array}  painPoints  - 痛點列表
   * @param {array}  departments - 部门列表
   */
  generateImpactMatrix(painPoints, departments) {
    if (!painPoints || !departments) return [];

    return painPoints.map(pp => {
      const row = { category: pp.category, severity: pp.severity };
      departments.forEach(dept => {
        const deptId = typeof dept === 'string' ? dept : (dept.id || dept.roleId || '');
        row[deptId] = pp.affectedRoles && pp.affectedRoles.includes(deptId) ? '●' : '○';
      });
      return row;
    });
  }

  /**
   * 生成结构化的分析报告
   * @param {number} projectId
   * @param {object} allAnswers - { roleId: [answers...] }
   */
  generateReport(projectId, allAnswers) {
    const aggregated = this.aggregateAnswers(allAnswers);
    if (!aggregated) return null;

    const painPoints = this.identifyPainPoints(aggregated);
    const departments = Object.keys(aggregated.roles);
    const impactMatrix = this.generateImpactMatrix(painPoints, departments);
    const heatmapData = this.generateHeatmapData(aggregated);
    const suggestions = this.generateSuggestions(aggregated, painPoints);

    // 计算综合评分
    let overallScore = 0;
    let roleCount = 0;
    departments.forEach(roleId => {
      const roleData = aggregated.roles[roleId];
      if (roleData && roleData.answeredQuestions > 0) {
        overallScore += roleData.score;
        roleCount++;
      }
    });
    overallScore = roleCount > 0 ? Math.round(overallScore / roleCount) : 0;

    // 维度评分
    const dimensionScores = this._calculateDimensionScores(aggregated);

    // 执行摘要
    const executiveSummary = this._generateExecutiveSummary(overallScore, painPoints, departments);

    return {
      projectId,
      overallScore,
      executiveSummary,
      dimensionScores,
      heatmapData,
      painPoints,
      suggestions,
      roleScores: departments.map(roleId => ({
        role: roleId,
        score: aggregated.roles[roleId].score,
        answered: aggregated.roles[roleId].answeredQuestions,
        total: aggregated.roles[roleId].totalQuestions
      })),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 生成热力图数据
   */
  generateHeatmapData(aggregated) {
    if (!aggregated || !aggregated.roles) {
      return { roles: [], dimensions: [], matrix: [] };
    }

    const roles = Object.keys(aggregated.roles);
    const dimensions = HEATMAP_CONFIG.dimensions;

    const matrix = roles.map(roleId => {
      const roleData = aggregated.roles[roleId];
      return dimensions.map(dim => {
        // 从角色标签分中算出该维度的水平（1-5）
        let total = 0;
        let count = 0;
        dim.tags.forEach(tag => {
          if (roleData.tagScores[tag] !== undefined) {
            total += roleData.tagScores[tag];
            count++;
          }
        });
        if (count === 0) return 1; // 无数据默认为低
        const avg = total / count;
        // 映射到 1-5 等级
        if (avg >= 80) return 5;
        if (avg >= 65) return 4;
        if (avg >= 50) return 3;
        if (avg >= 35) return 2;
        return 1;
      });
    });

    return {
      roles: roles.map(r => this._getRoleName(r)),
      dimensions: dimensions.map(d => d.name),
      matrix
    };
  }

  /**
   * 生成优先级改进建议
   */
  generateSuggestions(aggregated, painPoints) {
    if (!painPoints || painPoints.length === 0) return [];

    const suggestions = [];

    // 根据痛点生成对应的建议
    painPoints.forEach((pp, idx) => {
      const suggestion = this._mapPainToSuggestion(pp, idx);
      if (suggestion) suggestions.push(suggestion);
    });

    return suggestions;
  }

  /* ========== 私有辅助方法 ========== */

  _calculateDimensionScores(aggregated) {
    const dimScoreMap = {};

    Object.keys(aggregated.roles).forEach(roleId => {
      const roleData = aggregated.roles[roleId];
      if (roleData.dimensionScores) {
        Object.keys(roleData.dimensionScores).forEach(dimKey => {
          if (!dimScoreMap[dimKey]) {
            dimScoreMap[dimKey] = { total: 0, count: 0 };
          }
          dimScoreMap[dimKey].total += roleData.dimensionScores[dimKey].score;
          dimScoreMap[dimKey].count++;
        });
      }
    });

    return Object.keys(dimScoreMap).map(dimKey => {
      const dim = DIMENSION_WEIGHTS[dimKey];
      const data = dimScoreMap[dimKey];
      const avg = data.count > 0 ? Math.round(data.total / data.count) : 0;
      let level = '薄弱';
      if (avg >= 80) level = '优秀';
      else if (avg >= 65) level = '良好';
      else if (avg >= 50) level = '基础';
      else if (avg >= 35) level = '待提升';

      return {
        dimension: dim ? dim.name : dimKey,
        score: avg,
        maxScore: 100,
        level
      };
    });
  }

  _getRoleName(roleId) {
    const nameMap = {
      ceo: 'CEO/创始人',
      sales: '销售部',
      ops: '运营部',
      finance: '财务部',
      marketing: '市场部',
      hr: '人事部'
    };
    return nameMap[roleId] || roleId;
  }

  _getPainPointDescription(category, severity) {
    const descMap = {
      '数据孤岛': '各部门系统数据不互通，形成信息孤岛，影响整体决策效率',
      '流程低效': '业务流程存在大量手工操作和审批环节，效率有待提升',
      '管理粗放': '管理方式偏经验导向，缺乏数据驱动的精细化管理能力',
      '工具落后': '现有数字化工具功能单一或老旧，难以支撑业务发展需求',
      '人才短缺': '数字化人才储备不足，现有团队数字化能力有待提升',
      '协作不畅': '部门间协作机制不健全，沟通成本高、信息传递不及时',
      '获客困难': '市场获客渠道单一或效果不佳，客户获取成本偏高',
      '成本压力': '企业运营成本持续上升，利润空间受到挤压',
      '创新不足': '产品/服务创新速度滞后于市场变化，缺乏差异化竞争力'
    };
    const base = descMap[category] || '需要进一步分析和改善';
    const levelTag = severity >= 8 ? '（严重）' : severity >= 6 ? '（较严重）' : '';
    return base + levelTag;
  }

  _mapPainToSuggestion(painPoint, idx) {
    const map = {
      '数据孤岛': {
        title: '数据中台建设',
        description: '建立统一的数据平台，打通各业务系统数据，实现数据资产统一管理和共享',
        effort: '3-4个月',
        impact: '高'
      },
      '流程低效': {
        title: '业务流程自动化改造',
        description: '识别高频低效流程，引入RPA和BPM工具实现流程自动化',
        effort: '2-3个月',
        impact: '高'
      },
      '工具落后': {
        title: '核心业务系统升级',
        description: '评估现有系统，制定分阶段系统升级路线图，替换落后工具',
        effort: '3-6个月',
        impact: '高'
      },
      '管理粗放': {
        title: '数据驱动管理体系建设',
        description: '建立关键业务指标体系（KPI/OKR），搭建管理驾驶舱和数据看板',
        effort: '2-3个月',
        impact: '中'
      },
      '人才短缺': {
        title: '数字化人才培养计划',
        description: '制定数字化人才招聘和培养方案，开展分层次数字化技能培训',
        effort: '1-2个月',
        impact: '中'
      },
      '协作不畅': {
        title: '协同办公平台升级',
        description: '引入一体化协同平台，建立跨部门协作机制和标准化流程',
        effort: '1-2个月',
        impact: '中'
      },
      '获客困难': {
        title: '数字化营销体系构建',
        description: '建立全渠道营销体系，引入营销自动化工具，优化获客转化链路',
        effort: '2-4个月',
        impact: '高'
      },
      '成本压力': {
        title: '成本精细化管理',
        description: '建立成本核算和分析体系，通过数据驱动识别降本增效机会',
        effort: '2-3个月',
        impact: '中'
      },
      '创新不足': {
        title: '创新机制与工具引入',
        description: '建立创新孵化机制，引入AI辅助研发和设计工具，加速产品迭代',
        effort: '3-5个月',
        impact: '中'
      }
    };

    const priorityOrder = ['P0', 'P1', 'P2', 'P3'];
    const suggestion = map[painPoint.category];
    if (!suggestion) return null;

    return {
      priority: idx < 2 ? 'P0' : idx < 4 ? 'P1' : 'P2',
      ...suggestion
    };
  }

  _generateExecutiveSummary(overallScore, painPoints, departments) {
    const scoreLevel = overallScore >= 80 ? '较高' : overallScore >= 60 ? '中等' : '有待提升';
    const deptCount = departments.length;
    const topPain = painPoints.slice(0, 3).map(p => p.category).join('、');

    let summary = `本次诊断共有 ${deptCount} 个部门参与，综合评分为 ${overallScore} 分，数字化成熟度${scoreLevel}。`;

    if (painPoints.length > 0) {
      summary += ` 主要痛点集中在：${topPain}。`;
    }

    if (overallScore < 60) {
      summary += ' 建议从基础数字化建设入手，优先解决数据孤岛和基础设施问题。';
    } else if (overallScore < 80) {
      summary += ' 建议在现有基础上有针对性地进行系统升级和流程优化。';
    } else {
      summary += ' 建议在现有优势基础上，探索AI智能化应用，进一步提升竞争力。';
    }

    return summary;
  }
}

module.exports = {
  AnalysisEngine,
  DIMENSION_WEIGHTS,
  PAIN_POINT_KEYWORDS,
  HEATMAP_CONFIG
};
