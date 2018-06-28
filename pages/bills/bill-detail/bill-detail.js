const app = getApp();
const Toptips = require('../../../dist/toptips/index');
let postAPI = require('../../../utils/api.js');
Page({
  data: {
    basic_height: 504,
    bill_top: 395,
    scroll_h: 30,
    scrollHeight: 150,
    billId: '',
    billInfo: ''
  },
  onLoad: function(options) {
    let id = options.billId;
    let that = this;
    let scrollTop = 0;
    wx.getSystemInfo({
      success: function(res) {
        let my_height = res.windowHeight;
        let height = that.data.bill_top * my_height / that.data.my_height;
        let s_h = that.data.scroll_h * my_height / that.data.my_height;
        that.setData({
          scroll_h: s_h,
          bill_top: height,
          billId: id
        })
      }
    })
  },
  getBillPost: function(id) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    postAPI.post('p/ticket/getDetail', {
      token: app.globalData.userId,
      ticketId: id
    }, this.getDataSuccess, this.getDataFail, 0)
  },
  getDataSuccess: function(res) {
    wx.hideLoading();
    if (res.code == 0) {
      let list = res.item;
      let len = list.goodsList.length;
      if (len > 5) {
        this.setData({
          billInfo: list
        })
      } else {
        let c_h = len * this.data.scroll_h;
        let b_h = (5 - len) * this.data.scroll_h;
        this.setData({
          billInfo: list,
          scrollHeight: c_h,
          bill_top: this.data.bill_top - b_h
        })
      }
    } else {
      app.showResultToast(res, 'info')
    }
  },
  getDataFail: function(res) {
    wx.hideLoading();
    app.showResultToast(res, 'warn')
  },
  reportError: function() {
    let id = this.data.billId;
    let flag = this.data.billInfo.hasErrorFlag;
    if (!flag) {
      wx.navigateTo({
        url: '../../report/report?id=' + id,
      });
      return
    }
    this.showTopTips('您已经上报过了')
  },
  onShow: function() {
    let id = this.data.billId;
    this.getBillPost(id)
  },
  viewTicket: function(event) {
    let imgs = event.currentTarget.dataset.img;
    let preview = new Array();
    preview.push(imgs);
    wx.previewImage({
      urls: preview
    })
  },
  showTopTips(contents) {
    Toptips({
      duration: 1000,
      content: contents
    })
  }
})