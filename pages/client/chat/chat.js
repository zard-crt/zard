// chat.js v3 - 对话页 (使用 DiagnosisEngine)
const diagnosisEngine = require('../../services/diagnosis');
const API = require('../../services/api');
const { getRoleById, ROLES } = require('../../services/models');

Page({
  data: {
    statusBarHeight: 44,
    currentQuestion: 1,
    totalQuestions: 0,
    inputValue: '',
    inputFocused: false,
    isThinking: false,
    lastMsgId: '',
    messages: [],
    role: null,
    roleName: '',
    roleIcon: ''
  },

  onLoad(options) {
    const sysInfo = wx.getSystemInfoSync();
    const role = (options && options.role) || wx.getStorageSync('diagnosisRole') || 'ceo';
    const roleConfig = getRoleById(role);
    const engine = new diagnosisEngine.DiagnosisEngine();
    const questions = engine.getQuestions(role, null);

    this.engine = engine;
    this.questions = questions;
    this.answers = [];
    this.answeredCount = 0;
    this.role = role;

    this.setData({
      statusBarHeight: sysInfo.statusBarHeight || 44,
      totalQuestions: questions.length,
      role: role,
      roleName: roleConfig ? roleConfig.name : '',
      roleIcon: roleConfig ? roleConfig.icon : '',
      messages: [{
        type: 'system',
        content: '诊断开始 · 预计' + Math.ceil(questions.length / 3) + '分钟完成'
      }]
    }, () => {
      this.showNextQuestion();
    });
  },

  showNextQuestion() {
    const question = this.engine.getCurrentQuestion(this.role, null, this.answeredCount);
    if (!question || this.answeredCount >= this.questions.length) {
      this.completeDiagnosis();
      return;
    }
    this.setData({ currentQuestion: this.answeredCount + 1 });
    const aiMsg = {
      type: 'ai',
      content: question.text,
      choices: question.choices
    };
    const msgs = this.data.messages.concat([aiMsg]);
    this.setData({ messages: msgs, isThinking: false }, () => {
      this.scrollToBottom();
    });
  },

  onChoiceTap(e) {
    if (this.data.isThinking) return;
    const { value } = e.currentTarget.dataset;
    const currentQ = this.engine.getCurrentQuestion(this.role, null, this.answeredCount);
    if (!currentQ) return;

    // Find the label for this choice value from the current question
    var label = value;
    if (currentQ.choices) {
      for (var i = 0; i < currentQ.choices.length; i++) {
        if (currentQ.choices[i].value === value) {
          label = currentQ.choices[i].label;
          break;
        }
      }
    }

    // Record answer
    this.answers.push({
      questionId: currentQ.id,
      question: currentQ,
      answer: value,
      timestamp: new Date().toISOString()
    });

    // Show user message
    var msgs = this.data.messages.concat([{
      type: 'user',
      content: label
    }]);
    this.setData({ messages: msgs }, () => {
      this.scrollToBottom();
      this.advanceQuestion();
    });
  },

  getChoiceLabel(value) {
    // Try to find the label from the last AI message that had choices
    for (var i = this.data.messages.length - 1; i >= 0; i--) {
      var msg = this.data.messages[i];
      if (msg.choices) {
        for (var j = 0; j < msg.choices.length; j++) {
          if (msg.choices[j].value === value) return msg.choices[j].label;
        }
      }
      if (msg.type === 'ai') break;
    }
    return value;
  },

  onInputChange(e) {
    this.setData({ inputValue: e.detail.value });
  },

  onSend() {
    if (this.data.isThinking) return;
    var val = this.data.inputValue.trim();
    if (!val) return;
    var msgs = this.data.messages.concat([{
      type: 'user',
      content: val
    }]);
    this.setData({ messages: msgs, inputValue: '' }, () => {
      this.scrollToBottom();
      this.advanceQuestion();
    });
  },

  advanceQuestion() {
    var currentQ = this.engine.getCurrentQuestion(this.role, null, this.answeredCount);
    if (!currentQ) {
      this.completeDiagnosis();
      return;
    }

    var lastAnswer = this.answers[this.answers.length - 1];
    if (lastAnswer) {
      API.submitAnswer(
        wx.getStorageSync('currentProjectId') || 0,
        this.role,
        { questionId: currentQ.id, answer: lastAnswer.answer }
      );
    }

    // Get AI commentary response
    var aiResponse = this.engine.getNextResponse(
      currentQ,
      lastAnswer ? lastAnswer.answer : null,
      this.answers
    );

    this.answeredCount++;

    // Show typing indicator
    this.setData({ isThinking: true });
    var msgs = this.data.messages.concat([{ type: 'typing' }]);
    this.setData({ messages: msgs }, () => {
      this.scrollToBottom();
    });

    // After delay, show AI response then next question
    setTimeout(function() {
      var filteredMsgs = [];
      for (var i = 0; i < this.data.messages.length; i++) {
        if (this.data.messages[i].type !== 'typing') {
          filteredMsgs.push(this.data.messages[i]);
        }
      }

      if (aiResponse) {
        filteredMsgs.push({ type: 'ai', content: aiResponse });
      }

      this.setData({ messages: filteredMsgs, isThinking: false }, () => {
        this.scrollToBottom();
        setTimeout(() => {
          this.showNextQuestion();
        }, 300);
      });
    }.bind(this), 800);
  },

  completeDiagnosis() {
    var summary = this.engine.generateSummary(this.answers);
    var app = getApp();
    if (!app.globalData.diagnosisResults) {
      app.globalData.diagnosisResults = {};
    }
    app.globalData.diagnosisResults[this.role] = {
      answers: this.answers,
      summary: summary,
      role: this.role,
      completedAt: new Date().toISOString()
    };
    // Store the role so report page knows which role completed
    app.globalData.lastCompletedRole = this.role;

    setTimeout(function() {
      wx.redirectTo({ url: '/pages/client/report/report' });
    }, 800);
  },

  onBack() {
    wx.navigateBack();
  },

  scrollToBottom() {
    var idx = this.data.messages.length - 1;
    this.setData({ lastMsgId: 'msg-' + idx });
  }
});
