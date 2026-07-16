/**
 * diagnosis.js - AI 诊断引擎
 * 问题树管理、答案收集、进度追踪
 * 每个角色拥有 10-15 道专业问题，分两阶段
 * 注意：这是一个参考文件路径
 * 所有问题均为中文企业诊断场景设计
 */

const QUESTION_TYPES = {
  CHOICE: 'choice',
  MULTI_CHOICE: 'multi_choice',
  RATING: 'rating',
  OPEN: 'open',
  CONFIRM: 'confirm'
};

/* ======================================================================
   CEO / 创始人 问题树（15题）
   Phase 1: 企业基本面（8题）
   Phase 2: 深度洞察（7题）
   ====================================================================== */
const CEO_QUESTIONS = [
  // ---- Phase 1 ----
  {
    id: 'ceo_01', phase: 1, type: QUESTION_TYPES.CHOICE,
    text: '贵公司目前处于哪个发展阶段？',
    choices: [
      { label: '初创期（0-3年）', value: 'startup', score: 1 },
      { label: '成长期（3-10年）', value: 'growth', score: 2 },
      { label: '成熟期（10年以上）', value: 'mature', score: 3 },
      { label: '转型期', value: 'transforming', score: 2 }
    ],
    tags: ['company_info', 'stage']
  },
  {
    id: 'ceo_02', phase: 1, type: QUESTION_TYPES.CHOICE,
    text: '贵公司目前的团队规模是？',
    choices: [
      { label: '10人以下', value: 'micro', score: 1 },
      { label: '10-50人', value: 'small', score: 2 },
      { label: '50-200人', value: 'medium', score: 3 },
      { label: '200-500人', value: 'large', score: 4 },
      { label: '500人以上', value: 'enterprise', score: 5 }
    ],
    tags: ['company_info', 'scale']
  },
  {
    id: 'ceo_03', phase: 1, type: QUESTION_TYPES.CHOICE,
    text: '贵公司所属行业是？',
    choices: [
      { label: '制造业', value: 'manufacturing' },
      { label: '零售/电商', value: 'retail' },
      { label: '专业服务/咨询', value: 'professional' },
      { label: '医疗健康', value: 'medical' },
      { label: '科技/互联网', value: 'tech' },
      { label: '教育', value: 'education' },
      { label: '金融', value: 'finance' },
      { label: '其他', value: 'other' }
    ],
    tags: ['company_info', 'industry']
  },
  {
    id: 'ceo_04', phase: 1, type: QUESTION_TYPES.MULTI_CHOICE,
    text: '贵公司目前已使用哪些数字化工具/系统？（可多选）',
    choices: [
      { label: 'OA/办公系统', value: 'oa' },
      { label: 'ERP系统', value: 'erp' },
      { label: 'CRM系统', value: 'crm' },
      { label: '财务软件', value: 'finance_tool' },
      { label: 'HR系统', value: 'hr_tool' },
      { label: '数据分析平台', value: 'analytics' },
      { label: '项目管理工具', value: 'project_mgmt' },
      { label: '基本没有数字化工具', value: 'none' }
    ],
    tags: ['tools', 'digitalization']
  },
  {
    id: 'ceo_05', phase: 1, type: QUESTION_TYPES.MULTI_CHOICE,
    text: '目前企业经营中遇到的主要挑战是什么？（可多选）',
    choices: [
      { label: '获客成本高、增长乏力', value: 'customer_acquisition' },
      { label: '内部管理效率低下', value: 'efficiency' },
      { label: '数据分散、无法辅助决策', value: 'data_silo' },
      { label: '人才招聘和管理困难', value: 'talent' },
      { label: '成本控制压力大', value: 'cost' },
      { label: '市场竞争激烈', value: 'competition' },
      { label: '现金流/融资问题', value: 'cashflow' },
      { label: '产品/服务创新不足', value: 'innovation' }
    ],
    tags: ['challenges', 'pain_points'],
    followUp: {
      id: 'ceo_05_followup',
      type: QUESTION_TYPES.RATING,
      text: '在这些挑战中，哪个对您来说最为紧迫？请打分（1=不紧迫，5=非常紧迫）',
      condition: null,
      tags: ['challenges', 'priority']
    }
  },
  {
    id: 'ceo_06', phase: 1, type: QUESTION_TYPES.CHOICE,
    text: '公司的关键决策通常是如何做出的？',
    choices: [
      { label: '完全凭创始人/CEO个人经验', value: 'gut', score: 1 },
      { label: '主要靠管理层讨论、经验判断', value: 'experience', score: 2 },
      { label: '部分参考数据报表', value: 'data_some', score: 3 },
      { label: '以数据分析驱动决策', value: 'data_driven', score: 5 }
    ],
    tags: ['decision_making', 'management']
  },
  {
    id: 'ceo_07', phase: 1, type: QUESTION_TYPES.CHOICE,
    text: '贵公司每年在信息化/数字化上的预算大约是多少？',
    choices: [
      { label: '几乎没有预算', value: 'none', score: 1 },
      { label: '5万元以下', value: 'tiny', score: 2 },
      { label: '5-20万元', value: 'small', score: 3 },
      { label: '20-100万元', value: 'medium', score: 4 },
      { label: '100万元以上', value: 'large', score: 5 }
    ],
    tags: ['budget', 'digitalization']
  },
  {
    id: 'ceo_08', phase: 1, type: QUESTION_TYPES.CHOICE,
    text: '您对这次企业诊断和数字化升级的期望是？',
    choices: [
      { label: '先了解现状，不急于行动', value: 'explore' },
      { label: '找到1-2个快速改善点', value: 'quick_win' },
      { label: '制定完整的数字化转型规划', value: 'full_plan' },
      { label: '希望直接采购/实施解决方案', value: 'solution' }
    ],
    tags: ['expectation', 'goals']
  },

  // ---- Phase 2 ----
  {
    id: 'ceo_09', phase: 2, type: QUESTION_TYPES.RATING,
    text: '您认为公司各部门之间的协作效率如何？（1=很差，5=非常好）',
    choices: [
      { label: '1分 - 严重割裂', value: 1, score: 1 },
      { label: '2分 - 沟通不畅', value: 2, score: 2 },
      { label: '3分 - 一般', value: 3, score: 3 },
      { label: '4分 - 较顺畅', value: 4, score: 4 },
      { label: '5分 - 高效协同', value: 5, score: 5 }
    ],
    tags: ['collaboration', 'cross_dept']
  },
  {
    id: 'ceo_10', phase: 2, type: QUESTION_TYPES.CHOICE,
    text: '公司目前的数据基础设施状况如何？',
    choices: [
      { label: '基本没有数据管理，靠Excel和纸质记录', value: 'none', score: 1 },
      { label: '部分系统有数据，但相互不打通', value: 'isolated', score: 2 },
      { label: '有统一的数据平台，但使用率不高', value: 'platform_low', score: 3 },
      { label: '建立了完善的数据体系，日常使用', value: 'mature', score: 5 }
    ],
    tags: ['data_infrastructure', 'digitalization']
  },
  {
    id: 'ceo_11', phase: 2, type: QUESTION_TYPES.MULTI_CHOICE,
    text: '贵公司之前是否尝试过引入AI/智能化方案？（可多选）',
    choices: [
      { label: '从未尝试过', value: 'never' },
      { label: '尝试过自动化流程（RPA等）', value: 'rpa' },
      { label: '使用过AI客服/聊天机器人', value: 'chatbot' },
      { label: '尝试过智能数据分析', value: 'ai_analytics' },
      { label: '引入过AI辅助决策系统', value: 'ai_decision' },
      { label: '正在规划中', value: 'planning' }
    ],
    tags: ['ai_adoption', 'innovation']
  },
  {
    id: 'ceo_12', phase: 2, type: QUESTION_TYPES.CHOICE,
    text: '如果对痛点进行排序，您认为最需要解决的是？',
    choices: [
      { label: '市场与销售问题', value: 'sales_marketing' },
      { label: '运营效率问题', value: 'operations' },
      { label: '财务管理问题', value: 'finance' },
      { label: '人才与组织问题', value: 'talent_org' },
      { label: '产品与创新问题', value: 'product_innovation' }
    ],
    tags: ['priority', 'pain_points']
  },
  {
    id: 'ceo_13', phase: 2, type: QUESTION_TYPES.CHOICE,
    text: '您衡量数字化转型成功的核心指标是什么？',
    choices: [
      { label: '营收增长', value: 'revenue' },
      { label: '运营效率提升', value: 'efficiency' },
      { label: '客户满意度提升', value: 'satisfaction' },
      { label: '成本降低', value: 'cost_reduction' },
      { label: '员工生产力提升', value: 'productivity' }
    ],
    tags: ['metrics', 'goals']
  },
  {
    id: 'ceo_14', phase: 2, type: QUESTION_TYPES.CHOICE,
    text: '您预期的数字化升级时间周期是？',
    choices: [
      { label: '1-3个月（短期见效）', value: 'short' },
      { label: '3-6个月（中期规划）', value: 'medium' },
      { label: '6-12个月（年度规划）', value: 'long' },
      { label: '1年以上（长期战略）', value: 'strategic' }
    ],
    tags: ['timeline', 'planning']
  },
  {
    id: 'ceo_15', phase: 2, type: QUESTION_TYPES.MULTI_CHOICE,
    text: '对于企业数字化升级，您主要的顾虑是什么？（可多选）',
    choices: [
      { label: '投入成本过高，ROI不清晰', value: 'cost' },
      { label: '员工接受度和执行力不足', value: 'adoption' },
      { label: '缺乏专业人才和团队', value: 'talent' },
      { label: '担心系统选型错误', value: 'wrong_choice' },
      { label: '数据安全和隐私问题', value: 'security' },
      { label: '停工期对业务的影响', value: 'downtime' },
      { label: '供应商后期服务不到位', value: 'vendor_support' }
    ],
    tags: ['concerns', 'risks']
  }
];

/* ======================================================================
   销售部 问题树（12题）
   ====================================================================== */
const SALES_QUESTIONS = [
  {
    id: 'sales_01', phase: 1, type: QUESTION_TYPES.CHOICE,
    text: '贵公司销售团队有多少人？',
    choices: [
      { label: '3人以下', value: 'tiny', score: 1 },
      { label: '3-10人', value: 'small', score: 2 },
      { label: '10-30人', value: 'medium', score: 3 },
      { label: '30-100人', value: 'large', score: 4 },
      { label: '100人以上', value: 'enterprise', score: 5 }
    ],
    tags: ['team_size', 'sales']
  },
  {
    id: 'sales_02', phase: 1, type: QUESTION_TYPES.CHOICE,
    text: '目前使用什么工具管理客户信息和销售过程？',
    choices: [
      { label: 'Excel/纸质记录', value: 'manual', score: 1 },
      { label: '简单的通讯录/笔记工具', value: 'basic', score: 2 },
      { label: '免费/轻量级CRM工具', value: 'light_crm', score: 3 },
      { label: '专业CRM系统', value: 'pro_crm', score: 4 },
      { label: 'CRM+BI分析一体化', value: 'crm_bi', score: 5 }
    ],
    tags: ['tools', 'crm']
  },
  {
    id: 'sales_03', phase: 1, type: QUESTION_TYPES.CHOICE,
    text: '销售线索（Leads）的获取和管理方式？',
    choices: [
      { label: '被动等客户上门，无系统化管理', value: 'passive', score: 1 },
      { label: '有市场推广但线索收集靠人工', value: 'semi_manual', score: 2 },
      { label: '有线索管理系统，但分配和跟进不规范', value: 'loose', score: 3 },
      { label: '有完整的线索到成交管理流程', value: 'structured', score: 4 },
      { label: '数据驱动的智能线索评分和分配', value: 'smart', score: 5 }
    ],
    tags: ['lead_management', 'sales_process']
  },
  {
    id: 'sales_04', phase: 1, type: QUESTION_TYPES.RATING,
    text: '销售数据的及时性和准确性如何？（1=很差，5=非常好）',
    choices: [
      { label: '1分', value: 1, score: 1 },
      { label: '2分', value: 2, score: 2 },
      { label: '3分', value: 3, score: 3 },
      { label: '4分', value: 4, score: 4 },
      { label: '5分', value: 5, score: 5 }
    ],
    tags: ['data_quality', 'reporting']
  },
  {
    id: 'sales_05', phase: 1, type: QUESTION_TYPES.CHOICE,
    text: '销售预测是如何做的？',
    choices: [
      { label: '不做正式预测', value: 'none', score: 1 },
      { label: '凭销售主管个人经验估算', value: 'gut', score: 2 },
      { label: '使用简单公式计算', value: 'simple', score: 3 },
      { label: '基于历史数据和管道分析', value: 'pipeline', score: 4 },
      { label: 'AI辅助预测与实时更新', value: 'ai', score: 5 }
    ],
    tags: ['forecasting', 'management']
  },
  {
    id: 'sales_06', phase: 1, type: QUESTION_TYPES.MULTI_CHOICE,
    text: '销售团队定期需要输出哪些报表？（可多选）',
    choices: [
      { label: '日报/周报', value: 'daily_weekly' },
      { label: '销售漏斗报表', value: 'funnel' },
      { label: '业绩达成报表', value: 'performance' },
      { label: '客户分析报表', value: 'customer_analysis' },
      { label: '产品/服务销售分析', value: 'product_analysis' },
      { label: '回款/应收账款报表', value: 'receivable' },
      { label: '基本不做报表', value: 'none' }
    ],
    tags: ['reporting', 'management']
  },
  {
    id: 'sales_07', phase: 1, type: QUESTION_TYPES.CHOICE,
    text: '客户数据在公司内部是如何共享的？',
    choices: [
      { label: '各自管理自己的客户，不共享', value: 'no_share', score: 1 },
      { label: '通过群聊/邮件口头共享', value: 'chat', score: 2 },
      { label: '有共享文档但更新不及时', value: 'doc_outdated', score: 3 },
      { label: '系统内可查看但权限不精细', value: 'system_loose', score: 4 },
      { label: '系统化管理，权限清晰、实时更新', value: 'system_mature', score: 5 }
    ],
    tags: ['data_sharing', 'collaboration']
  },
  {
    id: 'sales_08', phase: 2, type: QUESTION_TYPES.CHOICE,
    text: '销售流程的标准化程度如何？',
    choices: [
      { label: '没有标准流程，各做各的', value: 'none', score: 1 },
      { label: '有口头约定但未文档化', value: 'verbal', score: 2 },
      { label: '有书面流程但执行不严格', value: 'loose', score: 3 },
      { label: '有SOP并严格执行', value: 'strict', score: 4 },
      { label: 'SOP结合系统自动流转', value: 'automated', score: 5 }
    ],
    tags: ['sales_process', 'standardization']
  },
  {
    id: 'sales_09', phase: 2, type: QUESTION_TYPES.RATING,
    text: '您对现有的销售工具体验满意吗？（1=非常不满意，5=非常满意）',
    choices: [
      { label: '1分', value: 1, score: 1 },
      { label: '2分', value: 2, score: 2 },
      { label: '3分', value: 3, score: 3 },
      { label: '4分', value: 4, score: 4 },
      { label: '5分', value: 5, score: 5 }
    ],
    tags: ['tools', 'satisfaction']
  },
  {
    id: 'sales_10', phase: 2, type: QUESTION_TYPES.MULTI_CHOICE,
    text: '销售工作中最困扰您的问题是什么？（可多选）',
    choices: [
      { label: '线索质量差、转化率低', value: 'lead_quality' },
      { label: '手动录入数据工作量大', value: 'manual_work' },
      { label: '缺乏客户360度视图', value: 'customer_view' },
      { label: '报价/合同审批流程慢', value: 'approval_slow' },
      { label: '与市场部线索交接不畅', value: 'handoff' },
      { label: '销售人员流动导致客户流失', value: 'turnover' },
      { label: '缺乏移动办公能力', value: 'mobile' }
    ],
    tags: ['pain_points', 'sales']
  },
  {
    id: 'sales_11', phase: 2, type: QUESTION_TYPES.CHOICE,
    text: '销售团队最希望改善的方面是？',
    choices: [
      { label: '更好的客户数据管理', value: 'data_mgmt' },
      { label: '销售自动化减少手动工作', value: 'automation' },
      { label: '更精准的销售预测', value: 'forecasting' },
      { label: '更好的团队协作工具', value: 'collaboration' },
      { label: '移动端销售支持', value: 'mobile' }
    ],
    tags: ['improvement', 'priority']
  },
  {
    id: 'sales_12', phase: 2, type: QUESTION_TYPES.CONFIRM,
    text: '如果有一套新的销售管理系统，您愿意推动团队全面使用吗？',
    choices: [
      { label: '愿意，并愿意亲自推动', value: 'strong_yes', score: 5 },
      { label: '愿意，但需要看到实际效果', value: 'conditional', score: 3 },
      { label: '不确定，担心团队抵触', value: 'unsure', score: 2 },
      { label: '不愿意，现有方式够用', value: 'no', score: 1 }
    ],
    tags: ['adoption', 'change_management']
  }
];

/* ======================================================================
   运营部 问题树（11题）
   ====================================================================== */
const OPS_QUESTIONS = [
  {
    id: 'ops_01', phase: 1, type: QUESTION_TYPES.CHOICE,
    text: '目前公司的核心业务流程是否有文档化记录？',
    choices: [
      { label: '基本没有，靠老员工口口相传', value: 'none', score: 1 },
      { label: '部分流程有简单文档', value: 'partial', score: 2 },
      { label: '大部分流程已文档化', value: 'most', score: 3 },
      { label: '全部流程已标准化并定期更新', value: 'all', score: 4 },
      { label: '流程文档与系统深度绑定', value: 'system_binding', score: 5 }
    ],
    tags: ['process', 'standardization']
  },
  {
    id: 'ops_02', phase: 1, type: QUESTION_TYPES.CHOICE,
    text: '业务流程的自动化程度如何？',
    choices: [
      { label: '几乎全部手工操作', value: 'manual', score: 1 },
      { label: '少量使用Excel公式等基础工具', value: 'basic', score: 2 },
      { label: '部分核心流程有系统支持', value: 'partial_auto', score: 3 },
      { label: '大部分流程已系统化', value: 'mostly_auto', score: 4 },
      { label: '高度自动化，人工仅做例外处理', value: 'highly_auto', score: 5 }
    ],
    tags: ['automation', 'process']
  },
  {
    id: 'ops_03', phase: 1, type: QUESTION_TYPES.MULTI_CHOICE,
    text: '运营管理中使用了哪些系统/工具？（可多选）',
    choices: [
      { label: 'ERP系统', value: 'erp' },
      { label: 'WMS/仓储管理系统', value: 'wms' },
      { label: '项目管理工具', value: 'project' },
      { label: 'OA审批系统', value: 'oa' },
      { label: 'BI/数据分析工具', value: 'bi' },
      { label: '协同文档工具', value: 'collab_doc' },
      { label: '基本没有', value: 'none' }
    ],
    tags: ['tools', 'digitalization']
  },
  {
    id: 'ops_04', phase: 1, type: QUESTION_TYPES.RATING,
    text: '各部门之间数据和信息的流通顺畅程度？（1=严重阻塞，5=完全畅通）',
    choices: [
      { label: '1分', value: 1, score: 1 },
      { label: '2分', value: 2, score: 2 },
      { label: '3分', value: 3, score: 3 },
      { label: '4分', value: 4, score: 4 },
      { label: '5分', value: 5, score: 5 }
    ],
    tags: ['data_flow', 'collaboration']
  },
  {
    id: 'ops_05', phase: 1, type: QUESTION_TYPES.CHOICE,
    text: '运营报表通常多久出一次？',
    choices: [
      { label: '不做定期报表', value: 'none', score: 1 },
      { label: '月度报表', value: 'monthly', score: 2 },
      { label: '周报', value: 'weekly', score: 3 },
      { label: '日报', value: 'daily', score: 4 },
      { label: '实时仪表盘', value: 'realtime', score: 5 }
    ],
    tags: ['reporting', 'management']
  },
  {
    id: 'ops_06', phase: 1, type: QUESTION_TYPES.CHOICE,
    text: '库存/供应链管理的现状？',
    choices: [
      { label: '不涉及库存管理', value: 'na', score: 3 },
      { label: '手工记录库存，误差较大', value: 'manual', score: 1 },
      { label: '使用简单进销存软件', value: 'basic', score: 2 },
      { label: '有完整ERP管理', value: 'erp', score: 3 },
      { label: 'ERP+WMS+智能补货', value: 'smart', score: 5 }
    ],
    tags: ['inventory', 'supply_chain']
  },
  {
    id: 'ops_07', phase: 2, type: QUESTION_TYPES.CHOICE,
    text: '质量控制是如何管理的？',
    choices: [
      { label: '无系统性质检流程', value: 'none', score: 1 },
      { label: '人工抽检，记录在纸质单据', value: 'manual', score: 2 },
      { label: '有质检标准和电子记录', value: 'digital', score: 3 },
      { label: '系统化质检流程，数据分析', value: 'system', score: 4 },
      { label: 'AI辅助质检+实时监控', value: 'ai', score: 5 }
    ],
    tags: ['quality', 'management']
  },
  {
    id: 'ops_08', phase: 2, type: QUESTION_TYPES.RATING,
    text: '对现有运营管理工具的满意度？（1=非常不满，5=非常满意）',
    choices: [
      { label: '1分', value: 1, score: 1 },
      { label: '2分', value: 2, score: 2 },
      { label: '3分', value: 3, score: 3 },
      { label: '4分', value: 4, score: 4 },
      { label: '5分', value: 5, score: 5 }
    ],
    tags: ['tools', 'satisfaction']
  },
  {
    id: 'ops_09', phase: 2, type: QUESTION_TYPES.MULTI_CHOICE,
    text: '运营管理中的主要痛点是什么？（可多选）',
    choices: [
      { label: '流程繁琐、审批周期长', value: 'slow_approval' },
      { label: '数据分散、统计困难', value: 'data_scattered' },
      { label: '跨部门协作效率低', value: 'cross_dept' },
      { label: '缺乏实时监控和预警', value: 'no_monitoring' },
      { label: '手工操作多易出错', value: 'manual_errors' },
      { label: '系统操作复杂，学习成本高', value: 'complex' }
    ],
    tags: ['pain_points', 'operations']
  },
  {
    id: 'ops_10', phase: 2, type: QUESTION_TYPES.CHOICE,
    text: '运营部门最希望优先解决的问题？',
    choices: [
      { label: '流程自动化，减少手工操作', value: 'auto' },
      { label: '数据整合与可视化', value: 'data' },
      { label: '跨部门协同平台', value: 'collab' },
      { label: '数字化质量管理', value: 'quality' },
      { label: '供应链智能化', value: 'scm' }
    ],
    tags: ['priority', 'improvement']
  },
  {
    id: 'ops_11', phase: 2, type: QUESTION_TYPES.CONFIRM,
    text: '如果有一套端到端的运营管理平台，您评估团队能快速上手吗？',
    choices: [
      { label: '能，团队成员数字化基础好', value: 'easy', score: 5 },
      { label: '大部分可以，少部分需要培训', value: 'partial', score: 3 },
      { label: '挑战较大，需要系统性的培训', value: 'hard', score: 2 },
      { label: '很难，团队普遍抗拒数字化工具', value: 'very_hard', score: 1 }
    ],
    tags: ['adoption', 'capability']
  }
];

/* ======================================================================
   财务部 问题树（11题）
   ====================================================================== */
const FINANCE_QUESTIONS = [
  {
    id: 'finance_01', phase: 1, type: QUESTION_TYPES.CHOICE,
    text: '目前使用什么工具进行会计核算和财务管理？',
    choices: [
      { label: '手工记账/Excel', value: 'manual', score: 1 },
      { label: '单机版财务软件', value: 'standalone', score: 2 },
      { label: '在线财务SaaS', value: 'saas', score: 3 },
      { label: 'ERP集成财务模块', value: 'erp', score: 4 },
      { label: '智能财务系统（AI辅助）', value: 'smart', score: 5 }
    ],
    tags: ['tools', 'accounting']
  },
  {
    id: 'finance_02', phase: 1, type: QUESTION_TYPES.CHOICE,
    text: '财务报告周期通常是？',
    choices: [
      { label: '半年/年度出报表', value: 'yearly', score: 1 },
      { label: '季度出报表', value: 'quarterly', score: 2 },
      { label: '月度出报表', value: 'monthly', score: 3 },
      { label: '周度出报表', value: 'weekly', score: 4 },
      { label: '实时可查看', value: 'realtime', score: 5 }
    ],
    tags: ['reporting', 'finance']
  },
  {
    id: 'finance_03', phase: 1, type: QUESTION_TYPES.RATING,
    text: '财务数据的准确性和一致性如何？（1=经常出错，5=完全准确）',
    choices: [
      { label: '1分', value: 1, score: 1 },
      { label: '2分', value: 2, score: 2 },
      { label: '3分', value: 3, score: 3 },
      { label: '4分', value: 4, score: 4 },
      { label: '5分', value: 5, score: 5 }
    ],
    tags: ['data_quality', 'accuracy']
  },
  {
    id: 'finance_04', phase: 1, type: QUESTION_TYPES.CHOICE,
    text: '预算管理的现状？',
    choices: [
      { label: '不做正式预算', value: 'none', score: 1 },
      { label: '年度一次性编制预算', value: 'yearly', score: 2 },
      { label: '年度预算+季度调整', value: 'quarterly', score: 3 },
      { label: '滚动预算管理', value: 'rolling', score: 4 },
      { label: '全面预算+实时执行监控', value: 'comprehensive', score: 5 }
    ],
    tags: ['budget', 'management']
  },
  {
    id: 'finance_05', phase: 1, type: QUESTION_TYPES.CHOICE,
    text: '财务与其他部门的数据对账方式？',
    choices: [
      { label: '没有正式对账流程', value: 'none', score: 1 },
      { label: '纸质单据线下核对', value: 'paper', score: 2 },
      { label: 'Excel导出后手工比对', value: 'excel', score: 3 },
      { label: '系统间部分自动对账', value: 'semi_auto', score: 4 },
      { label: '系统自动对账+异常提醒', value: 'auto', score: 5 }
    ],
    tags: ['reconciliation', 'cross_dept']
  },
  {
    id: 'finance_06', phase: 2, type: QUESTION_TYPES.MULTI_CHOICE,
    text: '在合规与审计方面，面临的挑战是？（可多选）',
    choices: [
      { label: '票据/凭证管理混乱', value: 'voucher' },
      { label: '税务申报流程复杂', value: 'tax' },
      { label: '审计准备周期长、工作量大', value: 'audit' },
      { label: '多公司/多实体合并对账困难', value: 'consolidation' },
      { label: '法规变化跟踪不及时', value: 'compliance' },
      { label: '目前没有显著问题', value: 'none' }
    ],
    tags: ['compliance', 'audit']
  },
  {
    id: 'finance_07', phase: 2, type: QUESTION_TYPES.CHOICE,
    text: '财务分析的深度如何？',
    choices: [
      { label: '仅做基础记账和报税', value: 'basic', score: 1 },
      { label: '能做基础财务报表分析', value: 'standard', score: 2 },
      { label: '能做预算执行分析', value: 'budget_analysis', score: 3 },
      { label: '能做多维度经营分析', value: 'multi_dim', score: 4 },
      { label: '有预测模型和决策支持', value: 'predictive', score: 5 }
    ],
    tags: ['analytics', 'capability']
  },
  {
    id: 'finance_08', phase: 2, type: QUESTION_TYPES.CHOICE,
    text: '现金流预测和管理方式？',
    choices: [
      { label: '不做现金流预测', value: 'none', score: 1 },
      { label: '凭经验大致估算', value: 'gut', score: 2 },
      { label: '简单Excel模型预测', value: 'excel', score: 3 },
      { label: '系统化现金流管理', value: 'system', score: 4 },
      { label: '智能化现金流预测与预警', value: 'smart', score: 5 }
    ],
    tags: ['cashflow', 'forecasting']
  },
  {
    id: 'finance_09', phase: 2, type: QUESTION_TYPES.MULTI_CHOICE,
    text: '财务工作中的主要痛点？（可多选）',
    choices: [
      { label: '数据录入工作量大、重复性高', value: 'manual_work' },
      { label: '业财数据不一致', value: 'data_mismatch' },
      { label: '报表出具周期过长', value: 'slow_reporting' },
      { label: '缺乏有效的经营分析工具', value: 'no_analytics' },
      { label: '与业务部门沟通困难', value: 'communication' },
      { label: '合规要求越来越高，压力大', value: 'compliance' }
    ],
    tags: ['pain_points', 'finance']
  },
  {
    id: 'finance_10', phase: 2, type: QUESTION_TYPES.CHOICE,
    text: '财务部门最希望改善的是？',
    choices: [
      { label: '财务自动化（记账、报表自动生成）', value: 'auto' },
      { label: '业财一体化', value: 'integration' },
      { label: '智能预算与预测', value: 'budget_forecast' },
      { label: '合规与审计数字化', value: 'compliance' },
      { label: '经营分析BI工具', value: 'bi' }
    ],
    tags: ['improvement', 'priority']
  },
  {
    id: 'finance_11', phase: 2, type: QUESTION_TYPES.RATING,
    text: '您对现有财务管理工具的满意度？（1=非常不满，5=非常满意）',
    choices: [
      { label: '1分', value: 1, score: 1 },
      { label: '2分', value: 2, score: 2 },
      { label: '3分', value: 3, score: 3 },
      { label: '4分', value: 4, score: 4 },
      { label: '5分', value: 5, score: 5 }
    ],
    tags: ['tools', 'satisfaction']
  }
];

/* ======================================================================
   市场部 问题树（11题）
   ====================================================================== */
const MARKETING_QUESTIONS = [
  {
    id: 'mkt_01', phase: 1, type: QUESTION_TYPES.MULTI_CHOICE,
    text: '目前公司使用哪些营销渠道？（可多选）',
    choices: [
      { label: '线上广告（百度/头条/抖音等）', value: 'online_ads' },
      { label: '社交媒体运营（公众号/小红书/抖音等）', value: 'social' },
      { label: '内容营销（博客/视频/白皮书）', value: 'content' },
      { label: '线下活动/展会', value: 'offline' },
      { label: '渠道合作/代理商', value: 'partner' },
      { label: '邮件/短信营销', value: 'email' },
      { label: '口碑/转介绍', value: 'referral' }
    ],
    tags: ['channels', 'marketing']
  },
  {
    id: 'mkt_02', phase: 1, type: QUESTION_TYPES.CHOICE,
    text: '营销活动效果如何追踪和分析？',
    choices: [
      { label: '基本不追踪效果', value: 'none', score: 1 },
      { label: '凭感觉/经验判断', value: 'gut', score: 2 },
      { label: '使用各平台自带分析工具', value: 'platform', score: 3 },
      { label: '有专门的UTM和归因管理', value: 'attribution', score: 4 },
      { label: '全链路数据追踪+AI分析', value: 'ai', score: 5 }
    ],
    tags: ['analytics', 'measurement']
  },
  {
    id: 'mkt_03', phase: 1, type: QUESTION_TYPES.CHOICE,
    text: '内容创作的方式？',
    choices: [
      { label: '没有系统化内容输出', value: 'none', score: 1 },
      { label: '团队成员兼职创作', value: 'parttime', score: 2 },
      { label: '有专人负责但工具简陋', value: 'dedicated', score: 3 },
      { label: '有专业团队和内容管理系统', value: 'professional', score: 4 },
      { label: 'AI辅助创作+数据驱动内容策略', value: 'ai', score: 5 }
    ],
    tags: ['content', 'marketing']
  },
  {
    id: 'mkt_04', phase: 1, type: QUESTION_TYPES.RATING,
    text: '对客户画像和客户洞察的掌握程度？（1=几乎不了解，5=非常了解）',
    choices: [
      { label: '1分', value: 1, score: 1 },
      { label: '2分', value: 2, score: 2 },
      { label: '3分', value: 3, score: 3 },
      { label: '4分', value: 4, score: 4 },
      { label: '5分', value: 5, score: 5 }
    ],
    tags: ['customer_insight', 'analytics']
  },
  {
    id: 'mkt_05', phase: 1, type: QUESTION_TYPES.CHOICE,
    text: '营销活动从策划到执行的流程管理？',
    choices: [
      { label: '没有固定流程，临时组织', value: 'ad_hoc', score: 1 },
      { label: '有简单计划但执行松散', value: 'loose', score: 2 },
      { label: '有项目管理流程', value: 'project', score: 3 },
      { label: '使用工具进行排期和协作', value: 'tool_supported', score: 4 },
      { label: '系统化管理、自动化执行', value: 'automated', score: 5 }
    ],
    tags: ['campaign', 'management']
  },
  {
    id: 'mkt_06', phase: 1, type: QUESTION_TYPES.CHOICE,
    text: 'ROI追踪和分析能力？',
    choices: [
      { label: '不算ROI', value: 'none', score: 1 },
      { label: '粗略估算投入产出比', value: 'rough', score: 2 },
      { label: '分渠道计算基础ROI', value: 'channel', score: 3 },
      { label: '多触点归因分析', value: 'multi_touch', score: 4 },
      { label: '全生命周期价值（LTV）分析', value: 'ltv', score: 5 }
    ],
    tags: ['roi', 'analytics']
  },
  {
    id: 'mkt_07', phase: 2, type: QUESTION_TYPES.MULTI_CHOICE,
    text: '目前使用的营销工具包括？（可多选）',
    choices: [
      { label: '营销自动化平台（MA）', value: 'ma' },
      { label: '广告投放管理工具', value: 'ad_platform' },
      { label: 'SEO/ASO工具', value: 'seo' },
      { label: '社交媒体管理工具', value: 'social_tool' },
      { label: '数据分析工具（友盟/神策等）', value: 'analytics_tool' },
      { label: 'A/B测试工具', value: 'ab_test' },
      { label: '没有使用专业工具', value: 'none' }
    ],
    tags: ['tools', 'marketing']
  },
  {
    id: 'mkt_08', phase: 2, type: QUESTION_TYPES.MULTI_CHOICE,
    text: '营销工作中的主要痛点？（可多选）',
    choices: [
      { label: '获客成本持续上升', value: 'high_cost' },
      { label: '营销效果难以衡量', value: 'hard_measure' },
      { label: '内容创作效率低', value: 'content_efficiency' },
      { label: '各渠道数据无法打通', value: 'data_silo' },
      { label: '与销售线索交接不畅', value: 'handoff' },
      { label: '个性化营销能力不足', value: 'personalization' },
      { label: '团队专业技能不足', value: 'skills' }
    ],
    tags: ['pain_points', 'marketing']
  },
  {
    id: 'mkt_09', phase: 2, type: QUESTION_TYPES.CHOICE,
    text: '市场部最希望改善的是？',
    choices: [
      { label: '全渠道数据分析平台', value: 'analytics' },
      { label: '营销自动化系统', value: 'automation' },
      { label: '内容创作能力提升', value: 'content' },
      { label: '客户数据平台（CDP）', value: 'cdp' },
      { label: '销售-市场协同效率', value: 'alignment' }
    ],
    tags: ['improvement', 'priority']
  },
  {
    id: 'mkt_10', phase: 2, type: QUESTION_TYPES.CONFIRM,
    text: '如果引入AI营销工具（AI内容生成、智能投放等），团队接受度如何？',
    choices: [
      { label: '非常欢迎，主动学习使用', value: 'eager', score: 5 },
      { label: '愿意尝试，需要培训', value: 'willing', score: 3 },
      { label: '比较保守，需验证效果', value: 'cautious', score: 2 },
      { label: '不太接受，担心替代人工', value: 'resistant', score: 1 }
    ],
    tags: ['ai_adoption', 'innovation']
  },
  {
    id: 'mkt_11', phase: 2, type: QUESTION_TYPES.RATING,
    text: '对现有营销工具的满意度？（1=非常不满，5=非常满意）',
    choices: [
      { label: '1分', value: 1, score: 1 },
      { label: '2分', value: 2, score: 2 },
      { label: '3分', value: 3, score: 3 },
      { label: '4分', value: 4, score: 4 },
      { label: '5分', value: 5, score: 5 }
    ],
    tags: ['tools', 'satisfaction']
  }
];

/* ======================================================================
   人事部 问题树（11题）
   ====================================================================== */
const HR_QUESTIONS = [
  {
    id: 'hr_01', phase: 1, type: QUESTION_TYPES.CHOICE,
    text: '目前使用什么工具进行员工信息管理？',
    choices: [
      { label: 'Excel/纸质档案', value: 'manual', score: 1 },
      { label: '简单人事软件', value: 'basic', score: 2 },
      { label: '专业HRM系统', value: 'professional', score: 3 },
      { label: 'HRM+OA一体化平台', value: 'integrated', score: 4 },
      { label: '智能化HR管理平台', value: 'smart', score: 5 }
    ],
    tags: ['tools', 'hr']
  },
  {
    id: 'hr_02', phase: 1, type: QUESTION_TYPES.CHOICE,
    text: '招聘流程的管理方式是？',
    choices: [
      { label: '全靠人工沟通和记录', value: 'manual', score: 1 },
      { label: '使用招聘网站后台管理', value: 'platform', score: 2 },
      { label: '有简单的招聘跟踪表', value: 'tracker', score: 3 },
      { label: '使用ATS招聘系统', value: 'ats', score: 4 },
      { label: 'ATS+AI简历筛选+人才库', value: 'ai', score: 5 }
    ],
    tags: ['recruitment', 'hr']
  },
  {
    id: 'hr_03', phase: 1, type: QUESTION_TYPES.CHOICE,
    text: '员工绩效考核方式？',
    choices: [
      { label: '没有正式考核', value: 'none', score: 1 },
      { label: '年度一次考核', value: 'yearly', score: 2 },
      { label: '半年度/季度考核', value: 'quarterly', score: 3 },
      { label: '月度+季度+年度综合考核', value: 'comprehensive', score: 4 },
      { label: 'OKR+KPI+360度评估', value: 'multi', score: 5 }
    ],
    tags: ['performance', 'management']
  },
  {
    id: 'hr_04', phase: 1, type: QUESTION_TYPES.CHOICE,
    text: '薪酬和算薪方式？',
    choices: [
      { label: '手工计算薪资', value: 'manual', score: 1 },
      { label: '使用Excel公式', value: 'excel', score: 2 },
      { label: '财务软件薪酬模块', value: 'finance_module', score: 3 },
      { label: '专业薪酬系统', value: 'payroll_system', score: 4 },
      { label: '自动化算薪+社保公积金自动申报', value: 'auto', score: 5 }
    ],
    tags: ['payroll', 'hr']
  },
  {
    id: 'hr_05', phase: 1, type: QUESTION_TYPES.CHOICE,
    text: '员工培训和发展管理方式？',
    choices: [
      { label: '没有系统化培训', value: 'none', score: 1 },
      { label: '不定期安排线下培训', value: 'occasional', score: 2 },
      { label: '有年度培训计划', value: 'planned', score: 3 },
      { label: '有线上学习平台', value: 'lms', score: 4 },
      { label: 'AI个性化学习路径+培训效果评估', value: 'smart', score: 5 }
    ],
    tags: ['training', 'development']
  },
  {
    id: 'hr_06', phase: 2, type: QUESTION_TYPES.RATING,
    text: '公司整体的员工满意度如何？（1=很低，5=很高）',
    choices: [
      { label: '1分', value: 1, score: 1 },
      { label: '2分', value: 2, score: 2 },
      { label: '3分', value: 3, score: 3 },
      { label: '4分', value: 4, score: 4 },
      { label: '5分', value: 5, score: 5 }
    ],
    tags: ['engagement', 'culture']
  },
  {
    id: 'hr_07', phase: 2, type: QUESTION_TYPES.MULTI_CHOICE,
    text: '人力资源管理中的主要痛点？（可多选）',
    choices: [
      { label: '招聘效率低、人才难找', value: 'recruitment' },
      { label: '员工流失率高', value: 'turnover' },
      { label: '绩效考核流于形式', value: 'review_formality' },
      { label: '人事事务重复繁琐', value: 'admin_work' },
      { label: '数据统计和分析能力弱', value: 'data_weak' },
      { label: '员工培训效果差', value: 'training' },
      { label: '跨部门沟通协调困难', value: 'communication' }
    ],
    tags: ['pain_points', 'hr']
  },
  {
    id: 'hr_08', phase: 2, type: QUESTION_TYPES.MULTI_CHOICE,
    text: '目前使用的HR工具有哪些？（可多选）',
    choices: [
      { label: '考勤系统', value: 'attendance' },
      { label: '薪资计算工具', value: 'payroll' },
      { label: '招聘管理工具', value: 'recruit_tool' },
      { label: '绩效管理系统', value: 'performance_tool' },
      { label: '学习管理系统（LMS）', value: 'lms' },
      { label: '员工福利平台', value: 'benefits' },
      { label: '没有专业HR工具', value: 'none' }
    ],
    tags: ['tools', 'digitalization']
  },
  {
    id: 'hr_09', phase: 2, type: QUESTION_TYPES.CHOICE,
    text: 'HR部门最希望改善的是？',
    choices: [
      { label: '一体化HR管理平台', value: 'all_in_one' },
      { label: '招聘数字化（AI筛选、人才库）', value: 'recruit_digital' },
      { label: '绩效管理优化', value: 'performance' },
      { label: '员工体验提升', value: 'experience' },
      { label: 'HR数据分析与洞察', value: 'analytics' }
    ],
    tags: ['improvement', 'priority']
  },
  {
    id: 'hr_10', phase: 2, type: QUESTION_TYPES.CONFIRM,
    text: '是否愿意引入AI辅助人力资源管理（如AI面试、智能排班等）？',
    choices: [
      { label: '非常愿意，积极拥抱新技术', value: 'eager', score: 5 },
      { label: '愿意尝试，但需谨慎评估', value: 'cautious', score: 3 },
      { label: '暂时不考虑，有顾虑', value: 'hesitant', score: 2 },
      { label: '不愿意，HR领域不适合AI', value: 'resistant', score: 1 }
    ],
    tags: ['ai_adoption', 'innovation']
  },
  {
    id: 'hr_11', phase: 2, type: QUESTION_TYPES.RATING,
    text: '对现有HR管理工具的满意度？（1=非常不满，5=非常满意）',
    choices: [
      { label: '1分', value: 1, score: 1 },
      { label: '2分', value: 2, score: 2 },
      { label: '3分', value: 3, score: 3 },
      { label: '4分', value: 4, score: 4 },
      { label: '5分', value: 5, score: 5 }
    ],
    tags: ['tools', 'satisfaction']
  }
];

/* ======================================================================
   问题树索引：industry → role → questions
   ====================================================================== */
const QUESTION_TREES = {
  default: {
    ceo:      CEO_QUESTIONS,
    sales:    SALES_QUESTIONS,
    ops:      OPS_QUESTIONS,
    finance:  FINANCE_QUESTIONS,
    marketing: MARKETING_QUESTIONS,
    hr:       HR_QUESTIONS
  }
};

/* ======================================================================
   AI 随答反馈（根据用户答案动态生成）
   ====================================================================== */
const AI_RESPONSES = {
  ceo: {
    positive: [
      '非常有远见的判断！数据驱动是企业可持续发展的基石。',
      '很好的认知！这说明您已经走在了正确的轨道上。',
      '清楚了解自身短板，是提升的第一步。',
      '这个选择显示您对行业趋势有敏锐的洞察力。'
    ],
    neutral: [
      '理解，很多优秀的企业家都有类似的思考。',
      '这是一个很务实的选择，我们来深入分析一下。',
      '好的，这个信息很有价值，让我们继续了解其他方面。',
      '明白了，我们再看看接下来的问题如何能帮您梳理得更清楚。'
    ],
    concerned: [
      '这确实是很多企业面临的挑战，我们会在报告中重点分析。',
      '这个问题如果不解决，可能会成为增长的瓶颈。',
      '您提到的这一点很关键，后续方案中我们会针对性地提出建议。'
    ]
  },
  sales: {
    positive: [
      '销售团队的数据意识很好，这是数字化转型的基础。',
      '很棒的销售管理思路！系统化是提升转化率的关键。',
      '高效的销售流程是企业增长的核心引擎。'
    ],
    neutral: [
      '了解了，这是很多销售团队当前的真实状态。',
      '好的，我们记录下这个情况。',
      '销售工具的选择确实需要结合团队的具体情况。'
    ],
    concerned: [
      '手动工作占比过高确实会影响销售团队的整体效率。',
      '线索质量问题是影响业绩的重要因素，我们会在报告中深入分析。',
      '销售预测不准会导致资源配置错配，这是很多公司的痛点。'
    ]
  },
  ops: {
    positive: [
      '运营流程清晰高效，是企业稳健运营的保障。',
      '自动化程度高意味着团队可以聚焦在更有价值的工作上。',
      '数据流转顺畅说明公司的数字化基础打得不错。'
    ],
    neutral: [
      '运营管理的优化空间往往隐藏在细节中。',
      '理解了，很多公司的运营流程都在逐步完善中。',
      '这个阶段最重要的是找到优先级最高的改善点。'
    ],
    concerned: [
      '手工操作多不仅效率低，还容易出错，是我们重点关注的改善方向。',
      '跨部门协作不畅会直接影响整体运营效率。',
      '缺乏实时监控意味着问题往往暴露得比较晚。'
    ]
  },
  finance: {
    positive: [
      '财务管理规范是企业健康度的晴雨表。',
      '财务数据准确及时，为决策提供了可靠依据。',
      '好的财务管理能有效支持企业的战略发展。'
    ],
    neutral: [
      '财务工具的升级可以显著提升工作效率。',
      '理解，财务管理水平的提升是一个渐进的过程。',
      '这些信息有助于我们全面评估企业的财务健康状况。'
    ],
    concerned: [
      '业财数据不一致会导致决策偏差，是需要优先解决的问题。',
      '报表出具周期过长会影响管理决策的时效性。',
      '手工对账不仅耗时，还容易遗漏，建议尽快系统化。'
    ]
  },
  marketing: {
    positive: [
      '多渠道布局很好，关键是要做好效果归因。',
      '对数据敏感的市场团队往往能取得更好的ROI。',
      '内容驱动的营销策略是长期竞争力的核心。'
    ],
    neutral: [
      '营销效果衡量确实是行业难题，我们来帮您梳理。',
      '明白了，工欲善其事必先利其器。',
      '这些信息有助于我们评估您的营销体系成熟度。'
    ],
    concerned: [
      '获客成本持续上升是普遍挑战，需要精准营销策略来应对。',
      '各渠道数据不通会成为精细化运营的障碍。',
      '内容创作效率低会制约营销活动的频次和质量。'
    ]
  },
  hr: {
    positive: [
      '重视人才管理的企业通常有更好的发展韧性。',
      '系统化的HR管理是组织能力建设的基础。',
      'HR数字化能显著提升员工体验和管理效率。'
    ],
    neutral: [
      '人力资源管理往往是企业容易被忽视但很重要的环节。',
      '了解了，HR工具的升级可以带来显著的效率提升。',
      '这些信息有助于我们评估组织的健康度。'
    ],
    concerned: [
      '员工流失率高会影响组织的稳定性和知识积累。',
      '绩效考核流于形式会削弱团队的动力和方向感。',
      'HR事务繁琐会占用大量时间，影响战略性工作。'
    ]
  }
};

/* ======================================================================
   DiagnosisEngine 类
   ====================================================================== */
class DiagnosisEngine {
  constructor() {
    this.questionTrees = QUESTION_TREES;
    this.aiResponses = AI_RESPONSES;
  }

  /**
   * 获取指定角色和行业的问题列表（支持行业差异化扩展）
   * @param {string} role     - 角色 ID
   * @param {string} industry - 行业 ID（目前使用默认树）
   */
  getQuestions(role, industry) {
    // 未来可根据 industry 加载不同行业的问题树
    const tree = this.questionTrees.default || {};
    return tree[role] || [];
  }

  /**
   * 根据已答数量获取当前应展示的问题
   * @param {string} role          - 角色 ID
   * @param {string} industry      - 行业 ID
   * @param {number} answeredCount - 已答题目数量
   */
  getCurrentQuestion(role, industry, answeredCount) {
    const questions = this.getQuestions(role, industry);
    // 边界保护
    if (answeredCount >= questions.length) return null;
    return questions[answeredCount] || null;
  }

  /**
   * 根据用户答案生成 AI 的下一条反馈
   * @param {object} currentQuestion - 当前问题对象
   * @param {*}      answer          - 用户的选择值
   * @param {array}  allAnswers      - 已收集的所有答案
   */
  getNextResponse(currentQuestion, answer, allAnswers) {
    const role = this._inferRoleFromAnswers(allAnswers);
    const responses = this.aiResponses[role] || this.aiResponses.ceo;

    // 根据答案推断用户倾向
    let tone = 'neutral';
    if (typeof answer === 'object' && answer !== null) {
      const values = Array.isArray(answer) ? answer : Object.values(answer);
      // 如果选了多个积极选项
      if (values.length >= 3) tone = 'positive';
    }
    // rating 题：高分为积极
    else if (typeof answer === 'number') {
      if (answer >= 4) tone = 'positive';
      else if (answer <= 2) tone = 'concerned';
    }
    // choice 题：根据 score 判断
    else if (currentQuestion.choices) {
      const choice = currentQuestion.choices.find(c => c.value === answer);
      if (choice) {
        if (choice.score >= 4) tone = 'positive';
        else if (choice.score <= 2) tone = 'concerned';
      }
    }

    const pool = responses[tone] || responses.neutral;
    // 轮询避免重复
    const idx = (allAnswers ? allAnswers.length : 0) % pool.length;
    return pool[idx] || '';
  }

  /**
   * 判断诊断是否完成
   * @param {string} role          - 角色 ID
   * @param {number} answeredCount - 已答数量
   */
  isComplete(role, answeredCount) {
    const questions = this.getQuestions(role, null);
    return answeredCount >= questions.length;
  }

  /**
   * 生成所有答案的摘要
   * @param {array} answers - 答案数组 [{ questionId, question, answer, timestamp }]
   */
  generateSummary(answers) {
    if (!answers || answers.length === 0) {
      return { total: 0, summary: '暂无数据', details: [] };
    }

    const details = answers.map(a => {
      const q = a.question || {};
      const choiceLabels = [];
      if (q.choices && a.answer !== null && a.answer !== undefined) {
        if (Array.isArray(a.answer)) {
          // 多选
          a.answer.forEach(val => {
            const c = q.choices.find(ch => ch.value === val);
            if (c) choiceLabels.push(c.label);
          });
        } else {
          const c = q.choices.find(ch => ch.value === a.answer);
          if (c) choiceLabels.push(c.label);
        }
      }
      return {
        questionId: a.questionId,
        questionText: q.text || '',
        answer: a.answer,
        answerLabel: choiceLabels.join('、') || String(a.answer),
        tags: q.tags || []
      };
    });

    // 按标签聚合
    const tagAgg = {};
    details.forEach(d => {
      (d.tags || []).forEach(tag => {
        if (!tagAgg[tag]) tagAgg[tag] = { tag, count: 0, questions: [] };
        tagAgg[tag].count++;
        tagAgg[tag].questions.push(d.questionText);
      });
    });

    return {
      total: answers.length,
      summary: `共完成 ${answers.length} 道题的诊断`,
      details,
      tagAggregation: Object.values(tagAgg).sort((a, b) => b.count - a.count)
    };
  }

  /**
   * 从已有答案推断角色
   */
  _inferRoleFromAnswers(allAnswers) {
    if (!allAnswers || allAnswers.length === 0) return 'ceo';
    // 从最早的问题 ID 推断角色
    const firstQ = allAnswers[0];
    if (firstQ && firstQ.questionId) {
      const prefix = firstQ.questionId.split('_')[0];
      const roleMap = { ceo: 'ceo', sales: 'sales', ops: 'ops', finance: 'finance', mkt: 'marketing', hr: 'hr' };
      return roleMap[prefix] || 'ceo';
    }
    return 'ceo';
  }
}

module.exports = {
  DiagnosisEngine,
  CEO_QUESTIONS,
  SALES_QUESTIONS,
  OPS_QUESTIONS,
  FINANCE_QUESTIONS,
  MARKETING_QUESTIONS,
  HR_QUESTIONS,
  QUESTION_TREES,
  AI_RESPONSES
};
