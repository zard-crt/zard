Component({
  properties: {
    content: {
      type: String,
      value: ''
    },
    type: {
      type: String,
      value: 'ai'
    },
    time: {
      type: String,
      value: ''
    },
    options: {
      type: Array,
      value: []
    }
  },

  methods: {
    onOptionTap: function (e) {
      var value = e.currentTarget.dataset.value;
      this.triggerEvent('optiontap', { value: value });
    }
  }
});
