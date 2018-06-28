let postAPI = require('../../utils/api.js');
let qr = require("../../utils/qrcode.js");
const app = getApp();
let interval = '';

Page({
  data: {
    cardInfo: '',
  },
  onLoad: function(a) {
    let id = a.id;
    let personId = a.personId;
    this.getCardInfo(id, personId)
  },
  getCardInfo: function(a, b) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    postAPI.post('p/coupon/getDetail', {
      token: app.globalData.userId,
      couponId: a,
      personCouponId: b
    }, this.getDataSuccess, app.getFail, 0)
  },
  getDataSuccess: function(a, b) {
    let that = this;
    wx.hideLoading();
    if (a.code == 0) {
      this.setData({
        cardInfo: a.item
      });
      if (a.item.fetchFlag && a.item.status == 'AVAILABLE') {
        let initUrl = a.item.couponCode;
        this.createQrCode(initUrl, "mycanvas", 120, 120)
        interval = setInterval(function () {
          that.checkCardInfo(a.item.id, a.item.personCouponId);
        }, 2000)
      }
    } else {
      app.showResultToast(a, 'info')
    }
  },
  createQrCode: function(a, b, c, d) {
    qr.api.draw(a, b, c, d);
    setTimeout(() => {
      this.canvasToTempImage()
    }, 1000)
  },
  canvasToTempImage: function() {
    var c = this;
    wx.canvasToTempFilePath({
      canvasId: 'mycanvas',
      success: function(a) {
        var b = a.tempFilePath;
        c.setData({
          imagePath: b,
        })
      },
      fail: function(a) {
        console.log(a)
      }
    })
  },
  onCard: function(a) {
    let id = a.currentTarget.dataset.id;
    wx.showLoading({
      title: '处理中，请耐心等待...',
      mask: true
    });
    this.setData({
      couponId: id
    });
    postAPI.post('p/coupon/fetch', {
      token: app.globalData.userId,
      couponId: id
    }, this.getCardSuccess, app.getFail, 0)
  },
  getCardSuccess: function(a) {
    wx.hideLoading();
    app.showResultToast(a, 'info');
    console.log(a);
    if (a.code == 0) {
      let fetchFlag = 'cardInfo.fetchFlag';
      let personCouponId = 'cardInfo.personCouponId';
      let cardNo = 'cardInfo.couponCode';
      let initUrl = a.item.couponCode;
      this.createQrCode(initUrl, "mycanvas", 120, 120);
      this.setData({
        [fetchFlag]: true,
        [cardNo]: initUrl,
        [personCouponId]: a.item.personCouponId,
        flag_code: true
      })
    }
  },
  checkCardInfo: function (cardId, personId) {
    postAPI.authPost('p/coupon/check', {
      token: app.globalData.userId,
      couponId: cardId,
      personCouponId: personId
    }, this.getCheckCardSuccess)
  },
  getCheckCardSuccess: function (res) {
    if (res.code == 0 && res.item.status == 'CONSUMED') {
      let status = 'cardInfo.status';
      clearInterval(interval);
      this.setData({
        [status]: 'CONSUMED'
      })
    }
  },
  onShow: function() {},
})