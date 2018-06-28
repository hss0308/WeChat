let postAPI = require('../../utils/api.js');
const Toptips = require('../../dist/toptips/index');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    minTemp: 0,
    refreshFlag: false,
    resultShow: false,
    hideBottom: true,
    loadMoreData: '加载更多……',
    scrollHeight: 0,
    activeIndex: 0,
    third_index: 0,
    spCollected: '',
    myTabsel: '',
    couponId: '',
    shopId: '',
    shopInfo: '',
    tabs: ['卡券', '商家'],
    itemList: [],
    drawIds: [],
    pageNo: 0,
    allPages: 0,

    filter_sort: [],
    filterLabel: '',
    sort_select_id: '',
    selectItem: true,

    marqueePace: 1, //滚动速度
    marqueeDistance: 0, //初始滚动距离
    size: 14,
    orientation: 'left', //滚动方向
    interval: 20 // 时间间隔
  },

  marquee: function() {
    let vm = this;
    let length = vm.data.shopInfo.activity.length * vm.data.size;
    let windowWidth = wx.getSystemInfoSync().windowWidth;
    vm.setData({
      length: length,
      windowWidth: windowWidth,
    });
    vm.run1();
  },

  run1: function() {
    var vm = this;
    var interval = setInterval(function() {
      if (-vm.data.marqueeDistance < vm.data.length) {
        vm.setData({
          marqueeDistance: vm.data.marqueeDistance - vm.data.marqueePace,
        });
      } else {
        clearInterval(interval);
        vm.setData({
          marqueeDistance: vm.data.windowWidth
        });
        vm.run1();
      }
    }, vm.data.interval);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    that.setData({
      shopId: options.shopId,
    })
    that.getMyCreenList();
    that.getShopPost();
  },
  getSuccess: function(res) {
    wx.hideLoading();
    let newCollected = this.data.spCollected;
    if (res.code == 0) {
      let fetchFlag = 'shopInfo.follow';
      this.setData({
        [fetchFlag]: newCollected
      });
      wx.showToast({
        title: newCollected ? "关注成功" : "取消关注",
        duration: 1500
      })
    } else {
      app.showResultToast(res, 'info')
    }
  },
  getShopPost: function() {
    postAPI.post('p/shop/getDetail', {
      token: app.globalData.userId,
      shopId: this.data.shopId
    }, this.getDataSuccess, this.getDataFail, 0)
  },
  getDataSuccess: function(res, pn) {
    if (res.code == 0) {
      if (res.item != null) {
        let index = this.data.activeIndex;
        let my_type = this.getMySelType(index);

        this.setData({
          shopInfo: res.item,
          myTabsel: my_type
        })
        this.getShopInfo(0)
        this.marquee();
      }
    }
  },
  getMySelType: function(index) {
    let my_type = '';
    if (index == 0) {
      my_type = 'entry';
    }
    if (index == 1) {
      my_type = 'coupon';
    }
    if (index == 2) {
      my_type = 'activity';
    }
    return my_type;
  },
  getDataFail: function(res) {
    wx.hideLoading();
    app.showResultToast(res, 'warn')
  },
  getMyTabCk: function(e) {
    let id = e.currentTarget.dataset.id;
    let flag = this.data.selectItem;
    let index = this.data.activeIndex;
    if (!flag) {
      this.setData({
        third_index: index,
        selectItem: !flag
      })
    } else {
      this.setData({
        third_index: id,
        selectItem: !flag
      })
    }

  },
  getTabCk: function(e) {
    let id = e.currentTarget.dataset.id;
    let my_type = this.getMySelType(id);
    let filterLabels = this.data.filter_sort
    this.setData({
      selectItem: true,
      resultShow: false,
      itemList: [],
      pageNo: 0,
      allPages: 0,
      activeIndex: id,
      third_index: id,
      filterLabel: '',
      myTabsel: my_type
    })
    this.getShopInfo(0)
  },
  mySelect: function(e) {
    let id = e.currentTarget.dataset.my;
    let name = e.currentTarget.dataset.name;
    let my_type = this.getMySelType(0);
    let tabs = this.data.tabs;
    tabs.splice(0, 1);
    tabs.splice(0, 0, name);
    this.setData({
      activeIndex: 0,
      third_index: 0,
      sort_select_id: id,
      myTabsel: my_type,
      tabs: tabs,
      itemList: [],
      selectItem: true
    });
    this.getShopInfo(0)
  },
  listTap: function(e) {
    this.setData({
      selectItem: true
    })
  },
  getHold: function(e) {},
  getShopInfo: function(pn) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    postAPI.post('p/shop/getItemList', {
      token: app.globalData.userId,
      shopId: this.data.shopId,
      type: this.data.myTabsel,
      filterLabel: this.data.filterLabel,
      pageNo: pn,
      limit: app.globalData.pageLimit
    }, this.getItemSuccess, this.getFail, pn)
  },
  getItemSuccess: function(res, pn) {
    wx.hideLoading();
    if (res.code == 0) {
      if (res.list != null && res.list.length > 0) {
        let list = '';
        if (pn === 0) {
          list = res.list;
        } else {
          let oldList = this.data.itemList;
          let temp = res.list;
          list = oldList.concat(temp)
        }
        this.setData({
          allPages: res.total,
          refreshFlag: true,
          resultShow: false,
          hideBottom: true,
          itemList: list,
          pageNo: pn
        })
      } else {
        this.setData({
          itemList: [],
          resultShow: true,
          refreshFlag: true,
          hideBottom: true
        })
      }
    } else {
      this.setData({
        itemList: [],
        resultShow: true,
        refreshFlag: true,
        hideBottom: true
      })
      app.showResultToast(res, 'info')
    }
  },
  seeAddress: function() {
    let that = this;
    wx.openLocation({
      name: that.data.shopInfo.name,
      address: that.data.shopInfo.address,
      longitude: that.data.shopInfo.longitude,
      latitude: that.data.shopInfo.latitude,
      scale: 28
    })
  },
  menuPhone: function() {
    let num;
    if (this.data.shopInfo.mobile) {
      num = this.data.shopInfo.mobile
    } else {
      num = '4008618089'
    }
    wx.makePhoneCall({
      phoneNumber: num
    })
  },
  getSearch: function() {
    this.setData({
      selectItem: true
    })
    wx.navigateTo({
      url: '../shop-result/shop-result?id=' + this.data.shopInfo.id,
    })
  },
  onCard: function(e) {
    let id = e.currentTarget.dataset.id;
    wx.showLoading({
      title: '处理中，请耐心等待...',
      mask: true
    });
    this.setData({
      couponId: id
    });
    postAPI.authPost('p/coupon/fetch', {
      token: app.globalData.userId,
      couponId: id
    }, this.getCardSuccess)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.getWindowHeigth()
  },
  loadMore: function() {
    var self = this;
    if (!this.data.refreshFlag) {
      return;
    }
    if (self.data.itemList.length == self.data.allPages) {
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
      self.getShopInfo(tempCurrentPage)
    }, 300)
  },
  showTopTips(contents) {
    Toptips({
      duration: 1000,
      content: contents
    })
  },
  getMyCreenList: function() {
    postAPI.authPost('p/filter/getList', {
      token: app.globalData.userId,
      type: "filter",
      func: 3,
      showDefault: true
    }, this.getFilterSuccess)
  },
  getFilterSuccess: function(res) {
    if (res.code == 0) {
      let list = res.list;
      if (list && list.length > 0) {
        let oldItem = this.data.tabs;
        oldItem.splice(0, 0, list[0].name);
        this.setData({
          tabs: oldItem,
          filter_sort: list,
          filterLabel: list[0].id,
          sort_select_id: list[0].id
        })
      }
    }
  },
  onShopCollected: function(event) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    var value = event.currentTarget.dataset.value;
    if (value) {
      value = false
    } else {
      value = true
    }
    this.setData({
      spCollected: value
    });
    postAPI.post('p/follow/shop', {
      token: app.globalData.userId,
      shopId: this.data.shopId,
      follow: value
    }, this.getSuccess, app.getFail, 0)
  },
  getCardSuccess: function(res) {
    let that = this;
    wx.hideLoading();
    if (res.code == 0) {
      let id = this.data.couponId;
      if (res.item.status == 'UNAVAILABLE') {
        let ids = this.data.drawIds;
        ids = ids.concat(id);
        this.setData({
          drawIds: ids
        })
      } else {
        this.showTopTips(res.msg)
      }
    } else {
      this.showTopTips(res.msg)
    }
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
        }).exec();
      }
    });
  },

})