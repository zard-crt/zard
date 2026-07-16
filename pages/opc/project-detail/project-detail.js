const API = require('../../services/api');
const { ROLES, getRoleById, PROJECT_STATUS } = require('../../services/models');

Page({
  data: {
    statusBarHeight: 44,
    contentHeight: 500,
    project: {},
    projectId: null,
    animatedProgress: 0
  },
  onLoad(options) {
    const sys = wx.getSystemInfoSync();
    const statusHeight = sys.statusBarHeight || 44;
    this.setData({
      statusBarHeight: statusHeight,
      contentHeight: sys.windowHeight - statusHeight - 48,
      projectId: options.id || '1'
    });
    this.loadProjectDetail();
  },
  loadProjectDetail() {
    const self = this;
    API.getProjectDetail(this.data.projectId).then(res => {
      const raw = (res && res.data) || {};
      const statusObj = PROJECT_STATUS[raw.status] || {};

      // Build members array with completion status from ROLES
      const allRoles = Object.values(ROLES);
      const rawMembers = raw.teamMembers || [];
      const members = rawMembers.length > 0
        ? rawMembers.map(m => {
            const roleCfg = getRoleById(m.role) || {};
            return {
              name: m.name || roleCfg.name || m.role,
              role: roleCfg.name || m.role,
              done: m.completed || false
            };
          })
        : allRoles.map(r => ({
            name: r.name,
            role: r.name,
            done: false
          }));

      // Map findings/diagnosis summary to findings array
      const diagnosisSummary = raw.diagnosisSummary || {};
      const findings = (diagnosisSummary.painPoints || []).map(p => ({
        priority: p.severity >= 7 ? 'high' : p.severity >= 5 ? 'medium' : 'low',
        title: p.category || '待识别问题',
        description: p.description || '需要进一步分析',
        severity: p.severity || 0
      }));

      if (findings.length === 0) {
        // Fallback: generate from dimension scores if available
        const dimScores = diagnosisSummary.dimensionScores || [];
        dimScores.forEach(d => {
          if (d.score && d.score < 60) {
            findings.push({
              priority: d.score < 40 ? 'high' : 'medium',
              title: (d.dimension || '') + '待提升',
              description: (d.dimension || '') + '维度得分较低，需要关注',
              severity: Math.round((100 - (d.score || 50)) / 10)
            });
          }
        });
      }

      // If still empty, add a placeholder
      if (findings.length === 0) {
        findings.push({ priority: 'medium', title: '诊断进行中', description: '等待完整诊断数据', severity: 5 });
      }

      const project = {
        id: raw.id || self.data.projectId,
        company: raw.companyName || '未知企业',
        industry: raw.industry || '',
        statusClass: self._mapStatusToClass(raw.status),
        statusText: statusObj.name || raw.status || '未知',
        createDate: raw.startDate || (raw.createdAt || ''),
        endDate: raw.deadline || '',
        progress: raw.progress || 0,
        totalTasks: diagnosisSummary.totalQuestions || (raw.progress ? 100 : 24),
        completedTasks: diagnosisSummary.answeredQuestions || (raw.progress ? Math.round(raw.progress) : 16),
        members: members,
        findings: findings
      };

      self.setData({ project: project });

      // Animate progress circle
      setTimeout(() => {
        self.setData({ animatedProgress: project.progress });
      }, 200);
    }).catch(() => {
      // Fallback to empty state
      self.setData({
        project: {
          company: '加载失败',
          industry: '',
          statusText: '未知',
          progress: 0,
          totalTasks: 0,
          completedTasks: 0,
          members: [],
          findings: []
        }
      });
    });
  },
  _mapStatusToClass(status) {
    const map = {
      'active': 'ongoing',
      'reviewing': 'review',
      'pending': 'pending',
      'ceo_done': 'pending',
      'completed': 'completed',
      'delivered': 'delivered'
    };
    return map[status] || 'ongoing';
  },
  onBack() { wx.navigateBack(); },
  onReview() {
    const app = getApp();
    app.globalData.currentProject = this.data.project;
    wx.navigateTo({ url: '/pages/opc/workspace/workspace' });
  },
  onViewPlan() {
    const app = getApp();
    app.globalData.currentProject = this.data.project;
    wx.navigateTo({ url: '/pages/opc/delivery/delivery' });
  }
});
