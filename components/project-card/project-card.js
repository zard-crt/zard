Component({
  properties: {
    companyName: {
      type: String,
      value: ''
    },
    status: {
      type: String,
      value: 'pending'
    },
    statusText: {
      type: String,
      value: ''
    },
    progress: {
      type: Number,
      value: 0
    },
    members: {
      type: Array,
      value: []
    }
  },

  data: {
    companyInitial: '',
    memberList: []
  },

  observers: {
    'companyName': function (name) {
      if (name) {
        this.setData({ companyInitial: name.charAt(0) });
      }
    },
    'members': function (members) {
      this.setData({
        memberList: members.map(function (m) {
          if (typeof m === 'string') {
            return { name: m };
          }
          return m;
        })
      });
    }
  },

  methods: {
    onTap: function () {
      this.triggerEvent('tap');
    }
  }
});
