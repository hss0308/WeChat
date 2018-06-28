let postAPI = require('../../utils/api.js');
//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    ticketId: ''
  },

  /**
   * 页面加载的时候使用
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '拾票票'
    })
    var ticketId = decodeURIComponent(options.scene)

    if (ticketId != null && ticketId != "undefined") {

      this.setData({
        ticketId: ticketId
      });

      //查询小票信息：根据scene
      this.getTicketPost();
    }
  },

  getTicketPost: function () {
    let that = this
    if (app.globalData.userId && app.globalData.userId != '') {
      this.getTicketInfo()
    } else {
      setTimeout(function () {
        that.getTicketPost();
      }, 2000)
    }
  },

  getDataSuccess: function (res) {
    wx.hideLoading();
    app.showResultToast(res, 'info')
  },
  getDataFail: function (res) {
    wx.hideLoading();
    app.showResultToast(res, 'warn')
  },

  /**
   * 查询并且获取
   */
  getTicketInfo: function () {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    postAPI.post('p/ticket/bind',
      {
        token: app.globalData.userId,
        ticketId: this.data.ticketId,
        bind: true
      },
      this.getDataSuccess, this.getDataFail, 0
    )
  },
  getDataSuccess: function (res) {
    wx.hideLoading();
    app.showResultToast(res, 'info');
    setTimeout(function(){
      wx.switchTab({
        url: '../bills/bills',
      })
    },1500)
  },
  getDataFail: function (res) {
    wx.hideLoading();
    app.showResultToast(res, 'warn');
  }
})
