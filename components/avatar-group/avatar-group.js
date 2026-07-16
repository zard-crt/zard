const AVATAR_COLORS = ['blue', 'green', 'orange', 'red', 'purple', 'teal', 'pink', 'gray'];

Component({
  properties: {
    members: {
      type: Array,
      value: []
    },
    max: {
      type: Number,
      value: 5
    },
    size: {
      type: String,
      value: 'md'
    }
  },

  data: {
    displayMembers: [],
    overflow: 0,
    overlapOffset: '0px'
  },

  observers: {
    'members, max, size': function () {
      this.updateDisplay();
    }
  },

  attached: function () {
    this.updateDisplay();
  },

  methods: {
    updateDisplay: function () {
      var members = this.data.members || [];
      var max = this.data.max;
      var size = this.data.size;
      var overlapPx = size === 'sm' ? '-8px' : '-10px';

      var display = [];
      var overflow = 0;

      if (members.length > max) {
        overflow = members.length - max;
        display = members.slice(0, max);
      } else {
        display = members;
      }

      display = display.map(function (m, index) {
        var name = m.name || '';
        var initial = '';
        if (name.length > 0) {
          initial = name.charAt(0).toUpperCase();
        }
        return {
          name: name,
          initial: initial,
          color: AVATAR_COLORS[index % AVATAR_COLORS.length]
        };
      });

      this.setData({
        displayMembers: display,
        overflow: overflow,
        overlapOffset: overlapPx
      });
    }
  }
});
