let postAPI = require('../../utils/api.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    minTemp: 0,
    scrollHeight: 0,
    first_id_ck: '',
    scrollTop: 0,
    firstInfo: [],
    f_total: 0,
    f_limit: 15,
    secondInfo: [],
    s_total: 0,
    s_limit: 30
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getFistInfo();
  },

  myScroll: function(e) {
  },

  getFistInfo: function() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    postAPI.authPost('p/category/getList', {
        token: app.globalData.userId
      },
      this.myFirstResult)
  },

  myFirstResult: function(res) {
    if (res.code == 0) {
      let list = res.list;
      if (list && list.length > 0) {
        this.setData({
          f_total: res.total,
          firstInfo: list,
          first_id_ck: list[0].id
        })
        this.getSecondInfo(this.data.first_id_ck)
      }
    }
  },
  getSecondInfo: function(id) {
    postAPI.authPost('p/category/getList', {
        token: app.globalData.userId,
        categoryId: id
      },
      this.mySecondResult)
  },
  mySecondResult: function(res) {
    wx.hideLoading();
    if (res.code == 0) {
      let list = res.list;
      if (list && list.length > 0) {
        this.setData({
          secondInfo: list,
          s_total: res.total
        })
      }
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },
  onReady: function() {
    this.getWindowHeigth();
  },
  getWindowHeigth: function() {
    let that = this;
    let scrollTop = 0;
    wx.getSystemInfo({
      success: function(res) {
        wx.createSelectorQuery().selectAll('.myTop').boundingClientRect(function(rects) {
          rects.forEach(function(rect) {
            scrollTop = rect.height + scrollTop;
            that.setData({
              scrollHeight: res.windowHeight - scrollTop
            })
          })
        }).exec()
      }
    })
  },
  getResultPage: function(e) {
    let name = e.currentTarget.dataset.name;
    if (name && name.length > 0) {
      name = name.replace(/\s+/g, '');
      wx.navigateTo({
        url: '../result/result?name=' + name,
      })
    } else {
      wx.navigateTo({
        url: '../result/result',
      })
    }

  },
  getmyFirstCk: function(e) {
    let id = e.currentTarget.dataset.id;
    let index = e.currentTarget.dataset.index;
    this.setData({
      first_id_ck: id,
      scrollTop:(index -4)*30,
      SecondInfo: []
    })
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    this.getSecondInfo(id)
  },
})