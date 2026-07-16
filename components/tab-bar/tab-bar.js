Component({
  properties: {
    type: {
      type: String,
      value: 'client'
    },
    active: {
      type: Number,
      value: 0
    }
  },

  data: {
    tabs: [],
    activeColor: '#0071E3',
    inactiveColor: '#86868B'
  },

  observers: {
    'type': function (newType) {
      this.updateTabs(newType);
    }
  },

  attached: function () {
    this.updateTabs(this.data.type);
  },

  methods: {
    updateTabs: function (type) {
      const clientTabs = [
        { label: '首页', iconPath: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { label: '对话', iconPath: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
        { label: '团队', iconPath: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' }
      ];
      const opcTabs = [
        { label: '项目', iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
        { label: '工作台', iconPath: 'M3.75 6h16.5M3.75 12h16.5m-16.5 6h16.5' },
        { label: '数据', iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
      ];

      const isOpc = type === 'opc';
      this.setData({
        tabs: isOpc ? opcTabs : clientTabs,
        activeColor: isOpc ? '#FF9F0A' : '#0071E3',
        inactiveColor: isOpc ? 'rgba(255,255,255,0.3)' : '#86868B'
      });
    },

    onTabTap: function (e) {
      const index = e.currentTarget.dataset.tabindex;
      if (index !== this.data.active) {
        this.setData({ active: index });
        this.triggerEvent('tap', { tabIndex: index });
      }
    }
  }
});
