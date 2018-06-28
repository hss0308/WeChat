let postAPI = require('/utils/api.js');
App({
  onLaunch: function() {
    let obj = this;
    var logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);
    obj.login()
  },
  checkauth: function() {
    let obj = this;
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.userLocation']) {
          obj.showPopup()
        } else {
          obj.login()
        }
      }
    })
  },
  showPopup: function() {
    wx.redirectTo({
      url: '../authpage/authpage',
    })
  },
  login: function() {
    this.getuser()
  },
  authuser: function(sta) {
    if (!sta) {
      this.checkauth()
    }
  },
  getuser: function() {
    let obj = this;
    wx.login({
      success: function(res) {
        postAPI.authPost('tokenApply', {
          code: res.code,
          type: 'person'
        }, obj.getMytoken)
      }
    })
  },
  getAuthSuccess: function(res) {
    let obj = this;
    obj.globalData.userId = res.token;
    wx.setStorageSync('3rd_session', res.token);
    wx.getUserInfo({
      withCredentials: true,
      lang: 'zh_CN',
      success: function(res2) {
        let sessionKey = wx.getStorageSync('3rd_session');
        postAPI.authPost('userInfoUpload', {
          type: 'person',
          encryptedData: res2.encryptedData,
          iv: res2.iv,
          rawData: res2.rawData,
          signature: res2.signature,
          token: obj.globalData.userId
        }, obj.getUserSuccess)
      }
    })
  },
  getMytoken: function(res) {
    if (res.code == 0) {
      this.globalData.userId = res.token;
    }
  },
  getUserSuccess: function(res) {
    console.log(res)
  },
  getFail: function(res) {
    wx.hideLoading();
    this.showResultToast(res, 'warn');
  },
  showResultToast: function(res, iconMsg) {
    wx.showToast({
      title: res.msg,
      icon: iconMsg,
      mask: true,
      duration: 1000
    })
  },
  onShow: function() {},
  setCarStatus: function(res) {
    let that = this;
    this.globalData.sps_info.forEach((item, index) => {
      if (item.type == 'coupon' && item.item.couponId == res.couponId) {
        that.globalData.sps_info[index].item.fetchFlag = true;
        that.globalData.sps_info[index].item.personCouponId = res.personCouponId
      }
    })
  },
  setSpCollected: function(id, value) {
    let that = this;
    this.globalData.sps_info.forEach((item, index) => {
      if (item.type == 'entry' && item.id == id) {
        that.globalData.sps_info[index].follow = value
      }
    })
  },
  globalData: {
    userId: '',
    url: 'https://mp-dev.pickdata.cn/',
    auth_yes_no: false,
    pageLimit: 10,
    sps_info: []
  }
})