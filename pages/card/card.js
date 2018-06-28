let postAPI = require('../../utils/api.js');
const app = getApp();
Page({
  data: {
    re_type: '',
    activeIndex: 0,
    refreshFlag: false,
    scrollHeight: '',
    minTemp: 0,
    resultShow: false,
    hideBottom: true,
    loadMoreData: '加载更多……',
    allPages: 0,
    cardInfo: [],
    pageNo: 0
  },
  clickTab: function(e) {
    var that = this;
    let mytype = '';
    if (this.data.activeIndex === e.currentTarget.dataset.current) {
      return false
    }
    if (e.currentTarget.dataset.current == 1) {
      mytype = 'AVAILABLE'
    } else if (e.currentTarget.dataset.current == 2) {
      mytype = 'HISTORY'
    }
    this.setData({
      activeIndex: e.currentTarget.dataset.current,
      re_type: mytype,
      cardInfo: []
    });
    this.getCardList(0)
  },
  onLoad: function(options) {
    this.setData({
      re_type: 'AVAILABLE',
      activeIndex: 1
    });
    this.getCardList(0)
  },
  getCardList: function(NO) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    postAPI.post('p/coupon/getList', {
      token: app.globalData.userId,
      pageNo: NO,
      status: this.data.re_type,
      limit: app.globalData.pageLimit
    }, this.getDataSuccess, this.getDataFail, NO)
  },
  loadMore: function() {
    var self = this;
    if (!this.data.refreshFlag) {
      return
    }
    if (self.data.cardInfo.length == self.data.allPages) {
      self.setData({
        hideBottom: false,
        loadMoreData: '没有更多内容了'
      });
      setTimeout(function() {
        self.setData({
          hideBottom: true
        })
      }, 2000);
      return
    }
    let tempCurrentPage = self.data.pageNo;
    tempCurrentPage = tempCurrentPage + 1;
    let totalPage = Math.ceil(self.data.allPages / app.globalData.pageLimit);
    if (tempCurrentPage >= totalPage) {
      return
    }
    setTimeout(function() {
      self.setData({
        refreshFlag: false,
        hideBottom: false,
        loadMoreData: '加载更多……'
      });
      self.getCardList(tempCurrentPage)
    }, 300)
  },
  getDataSuccess: function(res, pn) {
    wx.hideLoading();
    if (res.code == 0) {
      if (res.list != null && res.list.length > 0) {
        let list = '';
        if (pn === 0) {
          list = res.list
        } else {
          let oldList = this.data.cardInfo;
          list = oldList.concat(res.list)
        }
        this.setData({
          refreshFlag: true,
          resultShow: false,
          allPages: res.total,
          hideBottom: true,
          cardInfo: list,
          pageNo: pn
        })
      } else {
        this.setData({
          refreshFlag: true,
          hideBottom: true,
          resultShow: true
        })
      }
    } else {
      this.setData({
        refreshFlag: true,
        hideBottom: true,
        resultShow: true
      });
      app.showResultToast(res, 'info')
    }
  },
  getDataFail: function(res) {
    wx.hideLoading();
    this.setData({
      refreshFlag: true,
      hideBottom: true,
      resultShow: true
    });
    app.showResultToast(res, 'warn')
  },
  onReady: function() {
    this.getWindowHeigth()
  },
  onShow: function() {},
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
})