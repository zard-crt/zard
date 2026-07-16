Component({
  properties: {
    data: {
      type: Array,
      value: []
    },
    type: {
      type: String,
      value: 'client'
    }
  },

  data: {
    chartData: []
  },

  observers: {
    'data': function (data) {
      this.updateChart(data);
    }
  },

  attached: function () {
    this.updateChart(this.data.data);
  },

  methods: {
    updateChart: function (data) {
      if (!data || !data.length) {
        this.setData({ chartData: [] });
        return;
      }
      var maxPct = 0;
      for (var i = 0; i < data.length; i++) {
        if (data[i].percentage > maxPct) {
          maxPct = data[i].percentage;
        }
      }
      var chartData = data.map(function (item) {
        var pct = item.percentage;
        var barWidth = maxPct > 0 ? (pct / maxPct) * 100 : 0;
        return {
          name: item.name,
          percentage: Math.round(pct * 10) / 10,
          barWidth: Math.round(barWidth)
        };
      });
      this.setData({ chartData: chartData });
    }
  }
});
