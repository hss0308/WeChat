let postAPI = require('../../utils/api.js');
const app = getApp();
Page({
  data: {
    minTemp: -40,
    refreshFlag: false,
    scrollHeight: 0,
    lodingInfo: [],
    resultInfo: false,
    inputShowed: true,
    showWords: false,
    searchWords: '',
    search_no: false,
    placeholder: '烤鸭',
    hideBottom: true,
    loadMoreData: '加载更多……',
    my_type: 'entry',
    hotWords: [],
    hisWords: [],
    filter_sort_word: '综合排序',
    filter_sort: [],
    sort_ck: false,
    sort_id: '',
    sort_select_id: '',
    filterMoneys: [],
    filterLabels: [],
    my_ck: false,
    my_filter: [],
    recommend: '',
    pageNo: 0,
    allPages: 0,
    shop_info: '../shop-detail/shop-detail',
    shop_ck: false,
    selectPerson: true,
    selectFilter: true,
    longitude: '',
    latitude: ''
  },
  onLoad: function(options) {
    let that = this;
    let name = options.name;
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        if (name && name.length > 0) {
          that.setData({
            showWords: false,
            searchWords: name,
            longitude: res.longitude,
            latitude: res.latitude
          });
          that.setDataHisWord(name);
          that.getSpPostUrl(0)
        } else {
          that.setData({
            showWords: true,
            longitude: res.longitude,
            latitude: res.latitude
          })
        }
      },
      fail: function(res) {
        console.log(res)
      }
    });
    postAPI.post('p/search/recommend', {
      token: app.globalData.userId
    }, this.getRecommendSuccess, this.getRecommendFail, 0);
    this.getMyCreenList()
  },
  getRecommendSuccess: function(res) {
    wx.hideLoading();
    this.setData({
      hisWords: res.item.history,
      hotWords: res.item.recommend
    })
  },
  getRecommendFail: function(res) {
    wx.hideLoading()
  },
  getSpPostUrl: function(NO) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    if (NO == 0) {
      this.setData({
        lodingInfo: []
      })
    }
    postAPI.post('p/search/getList', {
      token: app.globalData.userId,
      search: this.data.searchWords,
      type: this.data.my_type,
      longitude: this.data.longitude,
      latitude: this.data.latitude,
      sort: this.data.sort_id,
      filterMoneys: this.data.filterMoneys,
      filterLabels: this.data.filterLabels,
      pageNo: NO,
      limit: app.globalData.pageLimit
    }, this.getDataSuccess, this.getDataFail, NO)
  },
  getDataSuccess: function(res, pn) {
    wx.hideLoading();
    if (res.code == 0) {
      if (res.list != null && res.list.length > 0) {
        let list = '';
        if (pn === 0) {
          list = res.list
        } else {
          let oldList = this.data.lodingInfo;
          list = oldList.concat(res.list)
        }
        this.setData({
          refreshFlag: true,
          hideBottom: true,
          allPages: res.total,
          lodingInfo: list,
          resultInfo: true,
          pageNo: pn,
          search_no: false,
          showWords: false
        })
      } else {
        this.setData({
          refreshFlag: true,
          hideBottom: true,
          resultInfo: true,
          search_no: true,
          showWords: false
        })
      }
    } else {
      this.setData({
        refreshFlag: true,
        hideBottom: true,
        resultInfo: false,
        search_no: true,
        showWords: false
      });
      app.showResultToast(res, 'info')
    }
  },
  getDataFail: function(res) {
    wx.hideLoading();
    this.setData({
      refreshFlag: true,
      hideBottom: true,
      resultInfo: false,
      search_no: true,
      showWords: true
    });
    app.showResultToast(res, 'warn')
  },
  getHold: function(e) {},
  onShareAppMessage: function() {},
  inputSearch: function(e) {
    if (e.detail.value != '') {
      let myWord = e.detail.value;
      this.setDataHisWord(myWord);
      let num = 0;
      this.getSpPostUrl(num)
    }
  },
  delSameName: function(arr, key) {
    var result = [];
    for (var i = 0; i < arr.length; i++) {
      if (result.indexOf(arr[i]) == -1) {
        result.push(arr[i])
      }
    }
    return result;
  },
  setDataHisWord: function(hisWrod) {
    let word = hisWrod;
    let oldhis = this.data.hisWords;
    oldhis.splice(0, 0, word);
    let newHis = this.delSameName(oldhis, word);
    if (newHis.length >= 8) {
      newHis.splice(7, 1)
    }
    let his = newHis;
    let arr = [...new Set(his)];
    this.setData({
      hisWords: arr
    })
  },
  searchValue: function(e) {
    if (e.detail.value != '') {
      this.setData({
        showWords: false,
        searchWords: e.detail.value
      })
    } else {
      this.setData({
        showWords: true,
        searchWords: ''
      })
    }
  },
  hideInput: function() {
    wx.navigateBack({
      delta: 1
    })
  },
  getSearchInfo: function(e) {
    let value = e.currentTarget.dataset.name;
    let oldhis = this.data.hisWords;
    oldhis.forEach((item, index) => {
      if (item == value) {
        oldhis.splice(index, 1)
      }
    });
    oldhis.splice(0, 0, value);
    this.setData({
      hisWords: oldhis,
      showWords: true,
      searchWords: value
    });
    this.getSpPostUrl(0)
  },
  tapFilter: function(e) {
    switch (e.target.dataset.id) {
      case '1':
        this.data.shops.sort(function(a, b) {
          return a.id - b.id
        });
        break;
      case '2':
        this.data.shops.sort(function(a, b) {
          return b.sales - a.sales
        });
        break;
      case '3':
        this.data.shops.sort(function(a, b) {
          return a.distance - b.distance
        });
        break
    }
    this.setData({
      filterId: e.target.dataset.id,
      shops: this.data.shops
    })
  },
  getMyCreenList: function() {
    postAPI.authPost('p/filter/getList', {
      token: app.globalData.userId,
      type: 'sort',
      showDefault: true
    }, this.getFilterSuccess)
  },
  getFilterSuccess: function(res) {
    if (res.code == 0) {
      let list = res.list;
      if (list && list.length > 0) {
        this.setData({
          filter_sort: list,
          filter_sort_word: list[0].name,
          sort_select_id: list[0].id
        })
      }
    }
  },
  clearInput: function() {
    let list = this.data.filter_sort;
    this.setData({
      shop_ck: false,
      shop_ck: false,
      my_ck: false,
      selectPerson: true,
      selectFilter: true,
      filter_sort_word: list[0].name,
      sort_select_id: list[0].id,
      filterMoneys: [],
      filterLabels: [],
      my_type: 'entry',
      hideBottom: true,
      showWords: true,
      resultInfo: false,
      searchWords: '',
      search_no: false,
      lodingInfo: []
    })
  },
  hisclear: function() {
    let self = this;
    wx.showModal({
      title: '温馨提示',
      content: '是否确定清空历史搜索',
      success: function(res) {
        if (res.confirm) {
          self.DelHisWord();
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  DelHisWord: function() {
    wx.showLoading({
      title: '处理中...',
    });
    postAPI.authPost('p/search/delHistory', {
      token: app.globalData.userId
    }, this.getClaerSuccess)
  },
  getClaerSuccess: function(res) {
    wx.hideLoading();
    if (res.code == 0) {
      this.setData({
        hisWords: []
      })
    }
  },
  onReady: function() {
    this.getWindowHeigth()
  },
  getscreenList: function(e) {
    let flag = this.data.selectPerson;
    this.setData({
      selectPerson: !flag,
      selectFilter: true,
      sort_ck: true,
      shop_ck: false
    })
  },
  getFilterInfo: function() {
    postAPI.authPost('p/filter/getList', {
      token: app.globalData.userId,
      type: "filter",
      func: 2,
      showDefault:false
    }, this.getFilterInfoSuccess)
  },
  getFilterInfoSuccess: function(res) {
    let selectFilter = this.data.selectFilter;
    if (res.code == 0) {
      this.setData({
        my_filter: res.list,
        my_ck: true,
        selectPerson: true,
        selectFilter: !selectFilter
      })
    }
  },
  listTap: function(e) {
    this.setData({
      selectFilter: true,
      selectPerson: true
    })
  },
  mySelect: function(e) {
    let id = e.currentTarget.dataset.my;
    let name = e.currentTarget.dataset.name;
    this.setData({
      my_type: 'entry',
      shop_ck: false,
      filter_sort_word: name,
      sort_id: id,
      sort_select_id: id,
      selectPerson: true
    });
    this.getSpPostUrl(0)
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
  getTabResult: function(e) {
    let name = e.currentTarget.dataset.my;
    this.setData({
      searchWords: name
    });
    this.getSpPostUrl(0)
  },
  loadMore: function() {
    var self = this;
    if (!this.data.refreshFlag) {
      console.log('网络延迟...');
      return
    }
    if (self.data.lodingInfo.length == self.data.allPages) {
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
        hideBottom: false,
        loadMoreData: '加载更多……'
      });
      self.getSpPostUrl(tempCurrentPage)
    }, 300)
  },
  getlow: function(e) {
    let value = e.detail.value;
    let name = 'filterMoneys[0]';
    this.setData({
      [name]: value
    })
  },
  getup: function(e) {
    let value = e.detail.value;
    let low = '';
    let name0 = 'filterMoneys[0]';
    let name = 'filterMoneys[1]';
    if (this.data.filterMoneys.length > 0) {
      low = this.data.filterMoneys[0];
    }
    this.setData({
      [name0]: low,
      [name]: value
    })
  },
  getReset: function() {
    this.setData({
      sort_id: '',
      sort_select_id: '',
      filterMoneys: [],
      filterLabels: []
    })
  },
  getEnuser: function() {
    let low = '';
    let up = '';
    let name0 = 'filterMoneys[0]';
    let name = 'filterMoneys[1]';
    if (this.data.filterMoneys.length == 2) {
      low = parseInt(this.data.filterMoneys[0]);
      up = parseInt(this.data.filterMoneys[1]);
      if (low && up) {
        if (low > up) {
          let temp = low
          low = up;
          up = temp;
        }
      }
      this.setData({
        [name0]: low,
        [name]: up
      })
    } else if (this.data.filterMoneys.length == 1) {
      low = this.data.filterMoneys[0];
      this.setData({
        [name0]: low,
        [name]: ''
      })
    }
    this.setData({
      selectFilter: true
    });
    this.getSpPostUrl(0)
  },
  getshopCk: function() {
    this.setData({
      sort_ck: false,
      sort_id: '',
      sort_select_id: '',
      my_type: 'shop',
      filterMoneys: [],
      filterLabels: [],
      my_ck: false,
      filter_sort_word: this.data.filter_sort[0].name,
      shop_ck: true,
      selectFilter: true,
      selectPerson: true
    });
    this.getSpPostUrl(0)
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