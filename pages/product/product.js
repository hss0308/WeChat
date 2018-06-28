let postAPI = require('../../utils/api.js');
const Toptips = require('../../dist/toptips/index');
const app = getApp();

Page({
  data: {
    my_width: 0,
    my_heigth: 0,
    img: '../../image/default-img.png',
    imgBind: false,
    spType: false,
    entryId: '',
    shopId: '',
    spInfo: ''
  },
  onLoad: function(options) {
    this.setData({
      entryId: options.spId,
      shopId: options.shopId
    });
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    postAPI.post('p/shop/getEntryDetail', {
      token: app.globalData.userId,
      shopId: this.data.shopId,
      entryId: this.data.entryId
    }, this.getDataSuccess, this.getDataFail, 0)
  },
  onReady: function() {
    let self = this;
    wx.getSystemInfo({
      success: function(res) {
        self.setData({
          my_width: res.windowWidth,
          my_heigth: res.windowWidth
        })
      }
    })
  },
  getDataSuccess: function(res, pn) {
    wx.hideLoading();
    if (res.code == 0) {
      this.setData({
        spInfo: res.item
      })
    } else {
      app.showResultToast(res, 'info')
    }
  },
  getDataFail: function(res) {
    wx.hideLoading();
    app.showResultToast(res, 'warn')
  },
  goShopInfo: function(e) {
    let shopId = e.currentTarget.dataset.shopid;
    wx.navigateTo({
      url: '../shop-detail/shop-detail?shopId=' + shopId
    })
  },
  goShopInfo: function(e) {
    let shopId = e.currentTarget.dataset.shopid;
    wx.navigateTo({
      url: '../shop-detail/shop-detail?shopId=' + shopId
    })
  },
  onCollected: function(event) {
    let value = event.currentTarget.dataset.value;
    let id = event.currentTarget.dataset.id;
    let shopId = event.currentTarget.dataset.shop;
    wx.showLoading({
      title: '处理中，请耐心等待...',
      mask: true
    });
    if (value) {
      value = false
    } else {
      value = true
    }
    this.setData({
      entryId: id,
      imgBind: value
    });
    postAPI.post('p/follow/entry', {
      token: app.globalData.userId,
      shopId: shopId,
      entryId: id,
      follow: value
    }, this.getEntrySuccess, this.getEntryFail, 0)
  },
  getEntrySuccess: function(res) {
    wx.hideLoading();
    let value = this.data.imgBind;
    if (res.code == 0) {
      let shpValue = 'spInfo.follow';
      this.setData({
        [shpValue]: value,
        spType: true
      })
      if (value){
        this.showTopTips('关注成功');
      }else{
        this.showTopTips('取消关注');
      }
    } else {
      app.showResultToast(res, 'info')
    }
  },
  showTopTips(contents) {
    Toptips({
      duration: 1000,
      content: contents
    })
  },
  getEntryFail: function(res) {
    wx.hideLoading();
    app.showResultToast(res, 'warn')
  },
  setLastPageData: function(value) {
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    let info = prevPage.data.collectInfo;
    let id = this.data.spInfo.id;
    if (info && info.length > 0) {
      info.forEach((item, index) => {
        if (item.id == id) {
          info.splice(index, 1);
          prevPage.changeData(info)
        }
      })
    }
    app.setSpCollected(this.data.entryId, value)
  }
})