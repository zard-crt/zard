// chat.js
Page({
  data: {
    statusBarHeight: 44,
    currentQuestion: 3,
    totalQuestions: 8,
    inputValue: '',
    inputFocused: false,
    lastMsgId: '',
    messages: [
      {
        type: 'system',
        content: '诊断开始 · 预计3分钟完成'
      },
      {
        type: 'ai',
        content: '你好！我是AI诊断助手。首先请告诉我，你在工作中最常遇到的困难是什么？',
        choices: [
          { label: '流程繁琐，效率低下', value: 'process' },
          { label: '数据分散，难以整合', value: 'data' },
          { label: '重复性工作太多', value: 'repetitive' },
          { label: '缺乏数据支撑决策', value: 'decision' }
        ]
      },
      {
        type: 'user',
        content: '流程繁琐，效率低下'
      },
      {
        type: 'ai',
        content: '了解了。第二个问题，你觉得目前哪些流程最影响团队效率？（可多选）',
        choices: [
          { label: '审批流程', value: 'approval' },
          { label: '信息同步', value: 'sync' },
          { label: '任务分配', value: 'task' },
          { label: '绩效评估', value: 'performance' }
        ]
      },
      {
        type: 'user',
        content: '审批流程、信息同步'
      },
      {
        type: 'ai',
        content: '好的，第3个问题：你所在团队的规模是？',
        choices: [
          { label: '1-5人', value: 'small' },
          { label: '5-20人', value: 'medium' },
          { label: '20-50人', value: 'large' },
          { label: '50人以上', value: 'xlarge' }
        ]
      }
    ]
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 44 });
    this.scrollToBottom();
  },

  onBack() {
    wx.navigateBack();
  },

  onChoiceTap(e) {
    const { value } = e.currentTarget.dataset;
    const label = this.getChoiceLabel(value);
    
    // Add user message
    const msgs = [...this.data.messages, {
      type: 'user',
      content: label || value
    }];
    
    this.setData({ messages: msgs }, () => {
      this.scrollToBottom();
      this.advanceQuestion();
    });
  },

  getChoiceLabel(value) {
    // Find the label from the last AI message's choices
    for (let i = this.data.messages.length - 1; i >= 0; i--) {
      const msg = this.data.messages[i];
      if (msg.choices) {
        const choice = msg.choices.find(c => c.value === value);
        if (choice) return choice.label;
      }
      if (msg.type === 'ai') break;
    }
    return value;
  },

  onInputChange(e) {
    this.setData({ inputValue: e.detail.value });
  },

  onSend() {
    const val = this.data.inputValue.trim();
    if (!val) return;
    
    const msgs = [...this.data.messages, {
      type: 'user',
      content: val
    }];
    
    this.setData({ messages: msgs, inputValue: '' }, () => {
      this.scrollToBottom();
      this.advanceQuestion();
    });
  },

  advanceQuestion() {
    if (this.data.currentQuestion >= this.data.totalQuestions) {
      // Navigate to report
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/client/report/report'
        });
      }, 800);
      return;
    }
    
    this.setData({
      currentQuestion: this.data.currentQuestion + 1
    });
    
    // Mock AI response after delay
    setTimeout(() => {
      this.mockAiResponse();
    }, 600);
  },

  mockAiResponse() {
    const q = this.data.currentQuestion;
    let aiMsg;
    
    if (q <= this.data.totalQuestions) {
      aiMsg = {
        type: 'ai',
        content: `好的，第${q}个问题：你对目前的工具使用情况满意吗？`,
        choices: [
          { label: '非常满意', value: 'very_satisfied' },
          { label: '比较满意', value: 'satisfied' },
          { label: '一般', value: 'neutral' },
          { label: '不满意', value: 'unsatisfied' }
        ]
      };
      
      const msgs = [...this.data.messages, aiMsg];
      this.setData({ messages: msgs }, () => {
        this.scrollToBottom();
      });
    }
  },

  scrollToBottom() {
    const idx = this.data.messages.length - 1;
    this.setData({ lastMsgId: `msg-${idx}` });
  }
});
