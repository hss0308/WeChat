const app = getApp();
let postAPI = require('../../utils/api.js');
let dateTime = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    beginTime: '',
    endTime: '',
    smoney: '',
    emoney: ''

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      beginTime: options.sTime,
      endTime: options.eTime
    })
  },

  bindDateChange: function(e) {
    this.setData({
      beginTime: e.detail.value
    })
  },
  bindEndDateChange: function(e) {
    this.setData({
      endTime: e.detail.value
    })
  },
  getSmoney: function(e) {
    let value = e.detail.value;
    this.setData({
      smoney: value
    })
  },
  getEmoney: function(e) {
    let value = e.detail.value;
    this.setData({
      emoney: value
    })
  },
  getreset: function() {
    let date = new Date();
    let sDate = dateTime.startDate(date);
    let eDate = dateTime.endDate(date);
    this.setData({
      beginTime: sDate,
      endTime: eDate,
      smoney: '',
      emoney: ''
    })
  },

  getEnsure1: function(e) {
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    prevPage.changeData(this.data.beginTime, this.data.endTime, this.data.smoney, this.data.emoney);
    setTimeout(function() {
      wx.navigateBack({

      })
    }, 100)

  },

})