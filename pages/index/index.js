let postAPI = require('../../utils/api.js');
const app = getApp();
let sliderWidth = 52;

Page({
  data: {
    refreshFlag: false,
    scrollLeft: 100,
    loadInfo: [],
    tagList: [],
    longitude: '',
    latitude: '',
    scrollHeight: '',
    tabType: '',
    my_shop: [{
      id: "entry",
      name: '单品'
    }, {
      id: "shop",
      name: '商家'
    }],
    my_shop_ck: '单品',
    shop_info: '../shop-detail/shop-detail',
    distanceLabel: '',
    filter_list: [],
    filter_word: '',
    sort_list: [],
    filterLabels: [],
    my_sk_type: 'entry',
    hideBottom: true,
    loadMoreData: '加载更多……',
    rotateIndex: 0,
    animationData: {},
    minTemp: 0,
    allPages: 0,
    pageNo: 0,
    selectItem: true,
    filter_ck: false,
    shop_ck: false,
    sort_ck: false,
    showWords: false,
    activeIndex: 0
  },
  loadMore: function() {
    var self = this;
    if (!this.data.refreshFlag) {
      return
    }
    if (self.data.loadInfo.length == self.data.allPages) {
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
    let mytype = self.data.tabType;
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
      self.getPostUrl(tempCurrentPage, mytype, self.data.longitude, self.data.latitude)
    }, 300)
  },
  refresh: function() {
    var self = this;
    let mytype = self.data.tabType;
    setTimeout(function() {
      self.setData({
        hideHeader: false
      });
      self.getPostUrl(0, mytype, self.data.longitude, self.data.latitude)
    }, 300)
  },
  tabClick: function(e) {
    let mytype = e.currentTarget.id;
    let index = e.currentTarget.dataset.index;
    let ord_num = (index - 2) / 2;
    let mid_num = 0;
    if (index > 2) {
      mid_num = 30
    }
    if (ord_num >= 3) {
      ord_num = 3;
    }
    this.setData({
      resultShow: false,
      loadInfo: [],
      pageNo: 0,
      activeIndex: index,
      tabType: mytype,
      scrollLeft: index * 15 * ord_num + mid_num
    });
    this.getLocationInfo(0)
  },

  myScroll: function(e) {},
  getPostUrl: function(pn, mytype, longitude, latitude) {
    let that = this;
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    postAPI.post('p/recommend/getList', {
      token: app.globalData.userId,
      pageNo: pn,
      tabId: mytype,
      type: this.data.my_sk_type,
      longitude: longitude,
      latitude: latitude,
      distanceLabel: this.data.distanceLabel,
      filterLabels: this.data.filterLabels,
      limit: app.globalData.pageLimit
    }, this.getDataSuccess, this.getDataFail, pn)
  },
  getLocationInfo: function(pn) {
    let mytype = this.data.tabType;
    let that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        that.setData({
          longitude: res.longitude,
          latitude: res.latitude
        });
        that.getPostUrl(pn, mytype, res.longitude, res.latitude)
      },
      fail: function(res) {
        console.log(res)
      }
    })
  },
  getMyAddress: function() {
    let that = this;
    wx.chooseLocation({
      success: function(res) {
        that.setData({
          longitude: res.longitude,
          latitude: res.latitude
        });
      },
      fail: function(res) {
        console.log(res)
      }
    })
  },
  getUserLocation: function() {
    let that = this;
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation']) {
          that.getLocationInfo(0)
        } else {
          wx.redirectTo({
            url: '../authpage/authpage',
          })
        }
      }
    })
  },
  getUserSetting: function() {
    let that = this;
    wx.openSetting({
      success: function(res) {
        if (res.authSetting['scope.userLocation']) {
          that.getLocationInfo(0)
        } else {
          wx.redirectTo({
            url: '../authpage/authpage',
          })
        }
      }
    })
  },
  getDataSuccess: function(res, pn) {
    wx.hideLoading();
    this.stopRefresh();
    if (res.code == 0) {
      if (res.list != null && res.list.length > 0) {
        let list = '';
        if (pn === 0) {
          list = res.list
        } else {
          let oldList = this.data.loadInfo;
          let temp = res.list;
          list = oldList.concat(temp)
        }
        this.setData({
          allPages: res.total,
          refreshFlag: true,
          hideBottom: true,
          loadInfo: list,
          showWords: false,
          pageNo: pn
        })
      } else {
        this.setData({
          showWords: true,
          refreshFlag: true,
          hideBottom: true
        })
      }
    } else {
      this.setData({
        showWords: true,
        refreshFlag: true,
        hideBottom: true
      });
      app.showResultToast(res, 'info')
    }
  },
  getDataFail: function(res) {
    wx.hideLoading();
    this.setData({
      showWords: true,
      refreshFlag: true,
      hideBottom: true
    });
    app.showResultToast(res, 'warn')
  },
  onLoad: function() {
    this.getTabList();
    this.getFilterList();
  },
  getTabList: function() {
    let self = this;
    if (app.globalData.userId) {
      postAPI.authPost('p/recommend/getTabList', {
        token: app.globalData.userId
      }, this.getTabSuccess)
    } else {
      setTimeout(function() {
        self.getTabList()
      }, 1000)
    }
  },
  getFilterList: function() {
    let self = this;
    if (app.globalData.userId) {
      postAPI.authPost('p/filter/getList', {
        token: app.globalData.userId,
        type: 'distance',
        func: 1,
        showDefault: true
      }, this.getFilterSuccess)
    } else {
      setTimeout(function() {
        self.getFilterList()
      }, 1000)
    }
  },
  getTabSuccess: function(res) {
    if (res.code == 0) {
      this.setData({
        tagList: res.list,
        tabType: res.list[0].id
      });
      this.authUser()
    }
  },
  getFilterSuccess: function(res) {
    if (res.code == 0) {
      let list = res.list;
      if (list && list.length > 0) {
        this.setData({
          filter_list: list,
          filter_word: list[0].name,
          distanceLabel: list[0].id
        });
      }
    }
  },
  getSortSuccess: function(res) {
    if (res.code == 0) {
      let list = res.list;
      if (list && list.length > 0) {
        this.setData({
          sort_list: list
        });
      }
    }
  },
  listTap: function(e) {
    this.setData({
      selectItem: true
    })
  },
  getHold: function(e) {},
  onReady: function() {
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
  authUser: function() {
    let that = this;
    wx.getSetting({
      success: res => {
        if (app.globalData.userId) {
          if (!res.authSetting['scope.userLocation']) {
            wx.authorize({
              scope: 'scope.userLocation',
              complete: function() {
                that.getUserLocation()
              }
            })
          } else {
            that.getLocationInfo(0)
          }
        } else {
          setTimeout(function() {
            that.authUser()
          }, 2000)
        }
      }
    })
  },
  getResultPage: function() {
    wx.navigateTo({
      url: '../result/result',
    })
  },
  reflashDowm: function() {
    this.refreshList();
    this.setData({
      loadInfo: [],
      pageNo: 0
    });
    this.refresh()
  },
  refreshList: function() {
    this.timeInterval = setInterval(function() {
      this.data.rotateIndex = this.data.rotateIndex + 1;
      this.animation.rotate(360 * (this.data.rotateIndex)).step()
      this.setData({
        animationData: this.animation.export()
      })
    }.bind(this), 350)
  },
  stopRefresh: function() {
    if (this.timeInterval > 0) {
      clearInterval(this.timeInterval)
      this.timeInterval = 0
    }
  },
  onShow: function() {
    let animation = wx.createAnimation({
      duration: 800,
      timingFunction: "ease"
    })
    this.animation = animation
  },
  mySelect: function(e) {
    let id = e.currentTarget.dataset.my;
    let name = e.currentTarget.dataset.name;
    this.setData({
      loadInfo: [],
      filter_word: name,
      distanceLabel: id,
      filter_ck: false,
      selectItem: true
    });
    this.getLocationInfo(0)
  },
  getFilter: function(e) {
    let flag = this.data.filter_ck
    if (!flag) {
      this.setData({
        filter_ck: true,
        shop_ck: false,
        sort_ck: false,
        selectItem: false
      })
    } else {
      this.setData({
        filter_ck: false,
        shop_ck: false,
        sort_ck: false,
        selectItem: true
      })
    }
  },
  myShop: function(e) {
    let id = e.currentTarget.dataset.my;
    let name = e.currentTarget.dataset.name;
    this.setData({
      loadInfo: [],
      shop_ck: false,
      selectItem: true,
      my_shop_ck: name,
      my_sk_type: id
    })
    this.getLocationInfo(0)
  },
  getShop: function(e) {
    let flag = this.data.shop_ck;
    if (flag) {
      this.setData({
        filter_ck: false,
        shop_ck: false,
        sort_ck: false,
        selectItem: true
      })
    } else {
      this.setData({
        filter_ck: false,
        shop_ck: true,
        sort_ck: false,
        selectItem: false
      })
    }
  },
  getTabSel: function(e) {
    let id = e.currentTarget.dataset.id;
    let filterLabels = this.data.filterLabels;
    if (filterLabels && filterLabels.indexOf(id) != -1) {
      filterLabels.forEach((item, index) => {
        if (item == id) {
          let list = filterLabels.splice(index, 1);
          this.setData({
            filterLabels: list
          });
          return
        }
      })
    } else {
      filterLabels.push(id)
    }
    this.setData({
      filterLabels: filterLabels
    })
  },
  getSort: function() {
    let flag = this.data.sort_ck;
    if (flag) {
      this.setData({
        filter_ck: false,
        shop_ck: false,
        sort_ck: false,
        selectItem: true
      })
    } else {
      postAPI.authPost('p/filter/getList', {
        token: app.globalData.userId,
        type: 'filter',
        showAll: 'false'
      }, this.getSortSuccess)
      this.setData({
        filter_ck: false,
        shop_ck: false,
        sort_ck: true,
        selectItem: false
      })
    }
  },
  getReset: function() {
    this.setData({
      filterLabels: []
    })
  },
  getEnuser: function() {
    this.setData({
      loadInfo: [],
      filter_ck: false,
      shop_ck: false,
      sort_ck: false,
      selectItem: true
    })
    this.getLocationInfo(0)
  }
})