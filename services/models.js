/**
 * models.js - 数据模型与常量
 * 定义角色、行业、项目状态、问题类型等常量及数据类
 */

/* ========== 角色定义 ========== */
const ROLES = {
  CEO:      { id: 'ceo',      name: 'CEO/创始人', icon: '👑', order: 0, color: '#0071E3' },
  SALES:    { id: 'sales',    name: '销售部',     icon: '💼', order: 1, color: '#34C759' },
  OPERATIONS: { id: 'ops',    name: '运营部',     icon: '⚙️', order: 2, color: '#FF9500' },
  FINANCE:  { id: 'finance',  name: '财务部',     icon: '💰', order: 3, color: '#AF52DE' },
  MARKETING: { id: 'marketing', name: '市场部',   icon: '📊', order: 4, color: '#FF3B30' },
  HR:       { id: 'hr',       name: '人事部',     icon: '👥', order: 5, color: '#5AC8FA' }
};

const ROLE_LIST = Object.values(ROLES);

/** 根据角色 ID 获取角色配置 */
function getRoleById(roleId) {
  return ROLE_LIST.find(r => r.id === roleId) || null;
}

/* ========== 行业定义 ========== */
const INDUSTRIES = {
  MANUFACTURING: { id: 'manufacturing', name: '制造业', icon: '🏭' },
  RETAIL:        { id: 'retail',        name: '零售',   icon: '🏪' },
  PROFESSIONAL:  { id: 'professional',  name: '专业服务', icon: '📋' },
  MEDICAL:       { id: 'medical',       name: '医疗',   icon: '🏥' }
};

const INDUSTRY_LIST = Object.values(INDUSTRIES);

/** 根据行业 ID 获取行业配置 */
function getIndustryById(industryId) {
  return INDUSTRY_LIST.find(i => i.id === industryId) || null;
}

/* ========== 项目状态 ========== */
const PROJECT_STATUS = {
  PENDING:    { id: 'pending',    name: '待开始',   emoji: '📋', color: '#86868B', order: 0 },
  CEO_DONE:   { id: 'ceo_done',  name: 'CEO已完成', emoji: '👑', color: '#0071E3', order: 1 },
  ACTIVE:     { id: 'active',    name: '进行中',   emoji: '⏳', color: '#FF9500', order: 2 },
  COMPLETED:  { id: 'completed', name: '已完成',   emoji: '✅', color: '#34C759', order: 3 },
  REVIEWING:  { id: 'reviewing', name: '评审中',   emoji: '🔍', color: '#AF52DE', order: 4 },
  DELIVERED:  { id: 'delivered', name: '已交付',   emoji: '🚀', color: '#0071E3', order: 5 }
};

const STATUS_LIST = Object.values(PROJECT_STATUS);

function getStatusById(statusId) {
  return STATUS_LIST.find(s => s.id === statusId) || null;
}

/* ========== 问题类型 ========== */
const QUESTION_TYPES = {
  CHOICE:      { id: 'choice',      name: '单选题'  },
  MULTI_CHOICE: { id: 'multi_choice', name: '多选题' },
  RATING:      { id: 'rating',     name: '评分题'  },
  OPEN:        { id: 'open',       name: '开放题'  },
  CONFIRM:     { id: 'confirm',    name: '确认题'  }
};

/* ========== 严重程度等级 ========== */
const SEVERITY_LEVELS = {
  LOW:      { id: 'low',      name: '低',     score: 2, color: '#34C759' },
  MEDIUM:   { id: 'medium',   name: '中',     score: 5, color: '#FF9500' },
  HIGH:     { id: 'high',     name: '高',     score: 8, color: '#FF3B30' },
  CRITICAL: { id: 'critical', name: '严重',   score: 10, color: '#FF2D55' }
};

/* ========== 分析维度 ========== */
const ANALYSIS_DIMENSIONS = [
  { id: 'strategy',      name: '战略规划',   short: '战略' },
  { id: 'organization',  name: '组织能力',   short: '组织' },
  { id: 'technology',    name: '技术基础',   short: '技术' },
  { id: 'data_culture',  name: '数据文化',   short: '文化' },
  { id: 'process',       name: '流程效率',   short: '流程' }
];

const HEATMAP_DIMENSIONS = [
  { id: 'data_mgmt',     name: '数据管理' },
  { id: 'process_auto',  name: '流程自动化' },
  { id: 'collaboration', name: '团队协作' },
  { id: 'decision',      name: '决策支持' },
  { id: 'customer',      name: '客户管理' },
  { id: 'finance_int',   name: '业财一体' }
];

/* ========== 数据类 ========== */

/**
 * 项目实例
 */
class Project {
  constructor(data = {}) {
    this.id = data.id || 0;
    this.companyName = data.companyName || '';
    this.industry = data.industry || '';
    this.size = data.size || '';
    this.status = data.status || PROJECT_STATUS.PENDING.id;
    this.progress = data.progress || 0;
    this.startDate = data.startDate || '';
    this.deadline = data.deadline || '';
    this.teamMembers = (data.teamMembers || []).map(m => new TeamMember(m));
    this.diagnosisSummary = data.diagnosisSummary || { answeredRoles: [], totalQuestions: 0, answeredQuestions: 0 };
  }

  /** 获取状态对象 */
  getStatusObj() {
    return getStatusById(this.status);
  }

  /** 获取状态名称 */
  getStatusName() {
    return this.getStatusObj()?.name || '未知';
  }

  /** 是否所有角色都已完成 */
  isAllComplete() {
    return this.teamMembers.every(m => m.completed);
  }

  /** 已完成的角色数量 */
  getCompletedCount() {
    return this.teamMembers.filter(m => m.completed).length;
  }

  /** 角色总数 */
  getTotalCount() {
    return this.teamMembers.length;
  }
}

/**
 * 团队成员
 */
class TeamMember {
  constructor(data = {}) {
    this.id = data.id || 0;
    this.name = data.name || '';
    this.role = data.role || '';
    this.roleId = data.roleId || '';
    this.avatar = data.avatar || '';
    this.completed = data.completed || false;
    this.answeredAt = data.answeredAt || null;
  }

  /** 获取角色配置 */
  getRoleConfig() {
    return getRoleById(this.roleId);
  }

  /** 获取角色图标 */
  getIcon() {
    return this.getRoleConfig()?.icon || '👤';
  }
}

/**
 * 诊断结果
 */
class DiagnosisResult {
  constructor(data = {}) {
    this.projectId = data.projectId || 0;
    this.overallScore = data.overallScore || 0;
    this.roleScores = (data.roleScores || []).map(rs => new RoleScore(rs));
    this.painPoints = (data.painPoints || []).map(pp => new PainPoint(pp));
    this.timestamp = data.timestamp || '';
  }

  /** 获取总体评级 */
  getOverallLevel() {
    if (this.overallScore >= 85) return { label: '优秀', color: '#34C759' };
    if (this.overallScore >= 70) return { label: '良好', color: '#0071E3' };
    if (this.overallScore >= 55) return { label: '待提升', color: '#FF9500' };
    return { label: '薄弱', color: '#FF3B30' };
  }
}

class RoleScore {
  constructor(data = {}) {
    this.role = data.role || '';
    this.name = data.name || '';
    this.score = data.score || 0;
    this.answered = data.answered || 0;
    this.total = data.total || 0;
  }

  getRoleConfig() {
    return getRoleById(this.role);
  }
}

class PainPoint {
  constructor(data = {}) {
    this.id = data.id || '';
    this.category = data.category || '';
    this.severity = data.severity || 0;
    this.description = data.description || '';
    this.affectedRoles = data.affectedRoles || [];
  }

  /** 获取严重程度等级 */
  getSeverityLevel() {
    if (this.severity >= 8) return SEVERITY_LEVELS.CRITICAL;
    if (this.severity >= 6) return SEVERITY_LEVELS.HIGH;
    if (this.severity >= 4) return SEVERITY_LEVELS.MEDIUM;
    return SEVERITY_LEVELS.LOW;
  }

  /** 获取影响角色名称列表 */
  getAffectedRoleNames() {
    return this.affectedRoles.map(roleId => {
      const role = getRoleById(roleId);
      return role ? role.name : roleId;
    });
  }
}

/**
 * 分析报告
 */
class AnalysisReport {
  constructor(data = {}) {
    this.projectId = data.projectId || 0;
    this.companyName = data.companyName || '';
    this.industry = data.industry || '';
    this.reportDate = data.reportDate || '';
    this.executiveSummary = data.executiveSummary || '';
    this.dimensionScores = (data.dimensionScores || []).map(d => new DimensionScore(d));
    this.heatmapData = data.heatmapData || null;
    this.suggestions = (data.suggestions || []).map(s => new Suggestion(s));
  }

  /** 获取综合评分（维度平均） */
  getOverallScore() {
    if (this.dimensionScores.length === 0) return 0;
    const total = this.dimensionScores.reduce((sum, d) => sum + d.score, 0);
    return Math.round(total / this.dimensionScores.length);
  }
}

class DimensionScore {
  constructor(data = {}) {
    this.dimension = data.dimension || '';
    this.score = data.score || 0;
    this.maxScore = data.maxScore || 100;
    this.level = data.level || '';
  }
}

class Suggestion {
  constructor(data = {}) {
    this.priority = data.priority || 'P2';
    this.title = data.title || '';
    this.description = data.description || '';
    this.effort = data.effort || '';
    this.impact = data.impact || '';
  }

  /** 获取优先级序号 */
  getPriorityOrder() {
    const map = { 'P0': 0, 'P1': 1, 'P2': 2, 'P3': 3 };
    return map[this.priority] !== undefined ? map[this.priority] : 99;
  }
}

/**
 * 交付方案
 */
class DeliveryPlan {
  constructor(data = {}) {
    this.projectId = data.projectId || 0;
    this.planName = data.planName || '';
    this.phases = (data.phases || []).map(p => new Phase(p));
    this.totalTimeline = data.totalTimeline || '';
    this.totalBudget = data.totalBudget || null;
    this.riskPoints = (data.riskPoints || []).map(r => new RiskPoint(r));
  }

  /** 获取总阶段数 */
  getPhaseCount() {
    return this.phases.length;
  }

  /** 获取总模块数 */
  getModuleCount() {
    return this.phases.reduce((sum, p) => sum + p.modules.length, 0);
  }
}

class Phase {
  constructor(data = {}) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.duration = data.duration || '';
    this.modules = (data.modules || []).map(m => new Module(m));
  }
}

class Module {
  constructor(data = {}) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.status = data.status || 'planned';
    this.effort = data.effort || '';
    this.dependencies = data.dependencies || [];
  }
}

class RiskPoint {
  constructor(data = {}) {
    this.risk = data.risk || '';
    this.level = data.level || '低';
    this.mitigation = data.mitigation || '';
  }
}

/**
 * 问题模型（用于 diagnosis.js）
 */
class Question {
  constructor(data = {}) {
    this.id = data.id || '';
    this.type = data.type || QUESTION_TYPES.CHOICE.id;
    this.text = data.text || '';
    this.choices = data.choices || [];
    this.followUp = data.followUp || null;
    this.skipCondition = data.skipCondition || null;
    this.tags = data.tags || [];
    this.phase = data.phase || 1;
  }
}

/* ========== 工具函数 ========== */

/**
 * 计算百分比
 */
function calcPercent(value, total) {
  if (!total) return 0;
  return Math.min(100, Math.round((value / total) * 100));
}

/**
 * 获取角色完成状态
 */
function getRoleCompletionStatus(members) {
  const total = members.length;
  const completed = members.filter(m => m.completed).length;
  return { total, completed, percent: calcPercent(completed, total) };
}

module.exports = {
  // 常量
  ROLES, ROLE_LIST, getRoleById,
  INDUSTRIES, INDUSTRY_LIST, getIndustryById,
  PROJECT_STATUS, STATUS_LIST, getStatusById,
  QUESTION_TYPES,
  SEVERITY_LEVELS,
  ANALYSIS_DIMENSIONS,
  HEATMAP_DIMENSIONS,
  // 数据类
  Project,
  TeamMember,
  DiagnosisResult, RoleScore, PainPoint,
  AnalysisReport, DimensionScore, Suggestion,
  DeliveryPlan, Phase, Module, RiskPoint,
  Question,
  // 工具
  calcPercent,
  getRoleCompletionStatus
};
