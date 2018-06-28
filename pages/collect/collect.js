let postAPI = require('../../utils/api.js');
const Toptips = require('../../dist/toptips/index');
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
    del_id: [],
    del_length: 0,
    allPages: 0,
    collectInfo: [],
    pageNo: 0
  },
  onLoad: function(options) {
    this.setData({
      re_type: 'entry',
      activeIndex: 1
    });
    this.getShopPost(0)
  },
  clickTab: function(e) {
    var that = this;
    let mytype = '';
    if (this.data.activeIndex === e.currentTarget.dataset.current) {
      return false
    }
    if (e.currentTarget.dataset.current == 1) {
      mytype = 'entry'
    } else if (e.currentTarget.dataset.current == 2) {
      mytype = 'shop'
    }
    this.setData({
      resultShow: false,
      del_length: 0,
      del_id: [],
      activeIndex: e.currentTarget.dataset.current,
      re_type: mytype,
      collectInfo: []
    });
    this.getShopPost(0)
  },
  onReady: function() {
    this.getWindowHeigth()
  },
  getShopPost: function(NO) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    postAPI.post('p/follow/getList', {
      token: app.globalData.userId,
      type: this.data.re_type,
      pageNo: NO,
      limit: app.globalData.pageLimit
    }, this.getDataSuccess, this.getDataFail, NO)
  },
  onShow: function() {},
  getDataSuccess: function(res, pn) {
    wx.hideLoading();
    console.log(res)
    if (res.code == 0) {
      if (res.list != null && res.list.length > 0) {
        let list = '';
        if (pn === 0) {
          list = res.list
        } else {
          let oldList = this.data.collectInfo;
          let newList = res.list;
          list = oldList.concat(newList)
        }
        this.setData({
          hideBottom: true,
          refreshFlag: true,
          resultShow: false,
          allPages: res.total,
          collectInfo: list,
          pageNo: pn
        })
      } else {
        this.setData({
          hideBottom: true,
          refreshFlag: true,
          resultShow: true
        })
      }
    } else {
      this.setData({
        refreshFlag: true,
        hideBottom: true,
        hideBottom: true
      });
      app.showResultToast(res, 'info')
    }
  },
  deleteMyshop: function(e) {
    let id = e.currentTarget.dataset.id;
    let self = this;
    wx.showActionSheet({
      itemList: ['取消关注'],
      success: function(res) {
        wx.showModal({
          title: '提示',
          content: '确定取消关注吗？',
          success: function(res) {
            if (res.confirm) {
              self.unShopfollow(id);
            } else if (res.cancel) {
              console.log('点击取消了');
              return false;
            }
          }
        })
      },
      fail: function(res) {
        console.log(res.errMsg)
      }
    })
  },
  deleteImage: function(e) {
    let id = e.currentTarget.dataset.id;
    let shopId = e.currentTarget.dataset.shopid;
    let self = this;
    wx.showActionSheet({
      itemList: ['取消关注'],
      success: function(res) {
        wx.showModal({
          title: '提示',
          content: '确定取消关注吗？',
          success: function(res) {
            if (res.confirm) {
              self.unfollow(id, shopId);
            } else if (res.cancel) {
              console.log('点击取消了');
              return false;
            }
          }
        })
      },
      fail: function(res) {
        console.log(res.errMsg)
      }
    })
  },
  unShopfollow: function(id) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    postAPI.authPost('p/follow/shop', {
      token: app.globalData.userId,
      shopId: id,
      follow: false
    }, this.getEntrySuccess)
    let delId = this.data.del_id;
    let ids = delId.concat(id);
    this.setData({
      del_id: ids
    })
  },
  unfollow: function(id, shopId) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    postAPI.authPost('p/follow/entry', {
      token: app.globalData.userId,
      shopId: shopId,
      entryId: id,
      follow: false
    }, this.getEntrySuccess)
    let delId = this.data.del_id;
    let ids = delId.concat(id);
    this.setData({
      del_id: ids
    })
  },
  getEntrySuccess: function(res) {
    wx.hideLoading();
    if (res.code == 0) {
      let info_len = this.data.collectInfo.length;
      let del_len = this.data.del_id.length;
      if (info_len == del_len) {
        this.setData({
          resultShow: true,
          del_length: 0,
        })
      } else {
        this.setData({
          resultShow: false,
          del_length: del_len
        })
      }

      this.showTopTips('取消关注');
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
  loadMore: function() {
    var self = this;
    if (!this.data.refreshFlag) {
      return
    }
    if (self.data.collectInfo.length == self.data.allPages) {
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
      self.getShopPost(tempCurrentPage)
    }, 300)
  },
  getDataFail: function(res) {
    wx.hideLoading();
    this.setData({
      refreshFlag: true,
      hideBottom: true,
      hideBottom: true
    });
    app.showResultToast(res, 'warn')
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
})