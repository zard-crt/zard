// report.js v3 - 报告页 (使用 AnalysisEngine)
const app = getApp(); const analysisEngine = app.services.AnalysisEngine;

Page({
  data: {
    statusBarHeight: 44,
    tabBarHeight: 80,
    loading: true,
    company: {
      id: 0,
      name: '',
      logoText: '',
      color: '#0071E3',
      colorLight: '#4B9EFF',
      date: '',
      status: '诊断完成',
      impactScore: 0
    },
    heatmap: {
      columns: [],
      rows: []
    },
    findings: {
      topDepartment: '',
      topIssue: '',
      topIssuePercent: 0,
      avgScore: 0,
      avgScoreDesc: ''
    }
  },

  onLoad(options) {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 44 });

    var projectId = (options && options.id) || 0;
    if (!projectId && app.globalData.currentProject) {
      projectId = app.globalData.currentProject.id;
    }

    // Try loading from app globalData first, then fetch
    var diagnosisResults = app.globalData.diagnosisResults;
    if (diagnosisResults && Object.keys(diagnosisResults).length > 0) {
      this.processLocalResults(diagnosisResults, projectId, app);
    } else if (projectId) {
      this.loadReportFromAPI(projectId);
    } else {
      this.setData({ loading: false });
    }
  },

  processLocalResults(diagnosisResults, projectId, app) {
    var engine = new analysisEngine.AnalysisEngine();
    var allAnswers = {};

    Object.keys(diagnosisResults).forEach(function(roleId) {
      var result = diagnosisResults[roleId];
      if (result && result.answers) {
        allAnswers[roleId] = result.answers;
      }
    });

    var aggregated = engine.aggregateAnswers(allAnswers);
    var reportData = engine.generateReport(projectId, allAnswers);
    var heatmapData = engine.generateHeatmapData(aggregated);

    var companyName = (app.globalData.currentProject && app.globalData.currentProject.companyName) || '企业诊断';

    this.buildViewFromData(companyName, aggregated, heatmapData, reportData);
  },

  loadReportFromAPI(projectId) {
    var self = this;
    API.getDiagnosisResult(projectId).then(function(res) {
      if (res && res.code === 0 && res.data) {
        var data = res.data;
        var engine = new analysisEngine.AnalysisEngine();
        var allAnswers = data.roleAnswers || {};
        var aggregated = engine.aggregateAnswers(allAnswers);
        var reportData = data.report || engine.generateReport(projectId, allAnswers);
        var heatmapData = data.heatmapData || engine.generateHeatmapData(aggregated);

        self.buildViewFromData(
          data.companyName || '企业诊断',
          aggregated,
          heatmapData,
          reportData
        );
      } else {
        self.setData({ loading: false });
      }
    }).catch(function() {
      self.setData({ loading: false });
    });
  },

  buildViewFromData(companyName, aggregated, heatmapData, reportData) {
    // Extract columns and rows from heatmapData
    var columns = [];
    var rows = [];

    if (heatmapData && heatmapData.columns) {
      columns = heatmapData.columns;
    } else {
      columns = ['数据管理', '流程自动化', '团队协作', '决策支持', '客户管理', '业财一体'];
    }

    if (heatmapData && heatmapData.rows) {
      rows = heatmapData.rows;
    }

    // Build findings
    var findings = {
      topDepartment: '',
      topIssue: '',
      topIssuePercent: 0,
      avgScore: 0,
      avgScoreDesc: ''
    };

    if (reportData) {
      if (reportData.painPoints && reportData.painPoints.length > 0) {
        findings.topIssue = reportData.painPoints[0].category || '';
        var sev = reportData.painPoints[0].severity || 5;
        findings.topIssuePercent = Math.round((sev / 10) * 100);
      }

      if (reportData.dimensionScores && reportData.dimensionScores.length > 0) {
        var total = 0;
        for (var i = 0; i < reportData.dimensionScores.length; i++) {
          total += reportData.dimensionScores[i].score || 0;
        }
        findings.avgScore = Math.round(total / reportData.dimensionScores.length) / 10;
      }
    }

    // Determine top department from heatmap rows
    if (rows.length > 0) {
      findings.topDepartment = rows[0].name || '';
    }

    // Build description based on score
    if (findings.avgScore >= 4) {
      findings.avgScoreDesc = '较高，需重点关注改善';
    } else if (findings.avgScore >= 2.5) {
      findings.avgScoreDesc = '中等偏高，需重点关注';
    } else {
      findings.avgScoreDesc = '偏低，建议及早干预';
    }

    // Build rows with severity labels if missing
    if (rows.length > 0) {
      for (var r = 0; r < rows.length; r++) {
        if (rows[r].values) {
          for (var c = 0; c < rows[r].values.length; c++) {
            var sv = rows[r].values[c].severity || 1;
            if (!rows[r].values[c].label) {
              rows[r].values[c].label = sv >= 4 ? '高' : sv >= 2 ? '中' : '低';
            }
          }
        }
      }
    } else {
      // Build empty rows from aggregated participation
      if (aggregated && aggregated.participation) {
        rows = aggregated.participation.map(function(p) {
          var roleCfg = getRoleById(p.role);
          return {
            name: roleCfg ? roleCfg.name : p.role,
            values: columns.map(function() {
              return { severity: 1, label: '低' };
            })
          };
        });
      }
    }

    this.setData({
      loading: false,
      company: {
        id: 0,
        name: companyName,
        logoText: companyName.charAt(0),
        color: '#0071E3',
        colorLight: '#4B9EFF',
        date: '诊断报告',
        status: '诊断完成',
        impactScore: findings.avgScore || 0
      },
      heatmap: {
        columns: columns.map(function(c) {
          return typeof c === 'string' ? c : (c.name || '');
        }),
        rows: rows
      },
      findings: findings
    });
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
