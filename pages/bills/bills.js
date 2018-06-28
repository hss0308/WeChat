const app = getApp();
let postAPI = require('../../utils/api.js');
let dateTime = require('../../utils/util.js');
let moveXList = [0, 0];
Page({
  data: {
    minTemp: 0,
    refreshFlag: false,
    hideBottom: true,
    my_ck: false,
    selectPerson: true,
    loadMoreData: '加载更多……',
    scrollHeight: 0,
    panel_heigth: 0,
    isTouchMove: false,
    inputShowed: false,
    resultShow: false,
    allPages: 0,
    billUrl: 'bill-detail/bill-detail',
    pageNo: 0,
    billInfo: [],
    sDate: '',
    eDate: '',
    smoney: '',
    emoney: '',
    searchWords: ''
  },
  bindDateChange: function(e) {
    this.setData({
      sDate: e.detail.value
    })
  },
  bindEndDateChange: function(e) {
    this.setData({
      eDate: e.detail.value
    })
  },
  getlow: function(e) {
    let value = e.detail.value;
    this.setData({
      smoney: value
    })
  },
  getup: function(e) {
    let value = e.detail.value;
    this.setData({
      emoney: value
    })
  },
  getReset: function() {
    this.anew();
    this.getBillPost(0);
  },
  getEnuser: function() {
    let s = this.data.smoney;
    let e = this.data.emoney;
    if (s && e) {
      if (s > e) {
        let temp = s;
        s = e;
        e = temp;
        this.setData({
          smoney: s,
          emoney: e
        })
      }
    }
    this.setData({
      selectPerson: true
    })
    this.getBillPost(0);
  },
  onLoad: function(options) {
    this.anew();
  },
  getHold: function(e) {},
  anew: function() {
    let date = new Date();
    let sDate = dateTime.startDate(date);
    let eDate = dateTime.endDate(date);
    this.setData({
      searchWords: '',
      sDate: sDate,
      eDate: eDate,
      smoney: '',
      emoney: '',
      billInfo: []
    })
  },
  listTap: function (e) {
    this.setData({
      selectPerson: true
    })
  },
  onShow: function() {
    this.getBillPost(0)
  },
  changeData: function(beginTime, endTime, smoney, emoney) {
    this.setData({
      sDate: beginTime,
      eDate: endTime,
      smoney: smoney,
      emoney: emoney
    });
  },
  onReady: function() {
    let that = this;
    let scrollTop = 0;
    wx.getSystemInfo({
      success: function(res) {
        wx.createSelectorQuery().selectAll('.myTop').boundingClientRect(function(rects) {
          rects.forEach(function(rect) {
            scrollTop = rect.height + scrollTop;
            that.setData({
              scrollHeight: res.windowHeight - scrollTop,
              panel_heigth: scrollTop
            })
          })
        }).exec()
      }
    })
  },
  getBillPost: function(NO) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    postAPI.post('p/ticket/getList', {
      token: app.globalData.userId,
      pageNo: NO,
      search: this.data.searchWords,
      beginTime: this.data.sDate,
      endTime: this.data.eDate,
      minAmount: this.data.smoney,
      maxAmount: this.data.emoney
    }, this.getDataSuccess, this.getDataFail, NO)
  },
  getDataSuccess: function(res, pn) {
    wx.hideLoading();
    console.log(res);
    if (res.code == 0) {
      if (res.list && res.list != null && res.list.length > 0) {
        let list = '';
        if (pn === 0) {
          list = res.list
        } else {
          let oldList = this.data.billInfo;
          list = oldList.concat(res.list)
        }
        this.setData({
          refreshFlag: true,
          hideBottom: true,
          resultShow: false,
          allPages: res.total,
          billInfo: list,
          pageNo: pn
        })
      } else {
        this.setData({
          refreshFlag: true,
          hideBottom: true,
          resultShow: true,
          billInfo: [],
          pageNo: 0
        })
      }
    } else {
      this.setData({
        refreshFlag: true,
        hideBottom: true,
        resultShow: true,
        billInfo: [],
        pageNo: 0
      });
      app.showResultToast(res, 'info')
    }
  },
  getDataFail: function(res) {
    wx.hideLoading();
    this.setData({
      refreshFlag: true,
      hideBottom: true,
      resultShow: true,
      billInfo: [],
      pageNo: 0
    });
    app.showResultToast(res, 'warn')
  },
  inputSearch: function(e) {
    if (e.detail.value != '') {
      this.setData({
        searchWords: e.detail.value
      })
    } else {
      this.setData({
        searchWords: ''
      })
    }
    let num = 0;
    this.getBillPost(num)
  },
  searchValue: function(e) {
    if (e.detail.value != '') {
      this.setData({
        searchWords: e.detail.value
      })
    } else {
      this.setData({
        searchWords: ''
      })
    }
  },
  clearInput: function() {
    this.setData({
      refreshFlag: true,
      hideBottom: true,
      searchWords: ''
    });
    this.getBillPost(0)
  },
  refresh: function() {
    this.onPullDownRefresh()
  },
  onPullDownRefresh: function() {
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    let num = 0;
    this.getBillPost(num);
    wx.stopPullDownRefresh()
  },
  loadMore: function() {
    let self = this;
    if (!this.data.refreshFlag) {
      console.log('网络延迟....');
      return
    }
    let pn = this.data.pageNo;
    let tempCurrentPage = this.data.pageNo;
    tempCurrentPage = tempCurrentPage + 1;
    let totalPage = Math.ceil(this.data.allPages / 10);
    if (tempCurrentPage >= totalPage) {
      this.setData({
        hideBottom: false,
        loadMoreData: '没有更多内容了'
      });
      setTimeout(function() {
        self.setData({
          hideBottom: true
        })
      }, 1500);
      return
    }
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    setTimeout(function() {
      self.setData({
        refreshFlag: false,
        hideBottom: false,
        loadMoreData: '加载更多……'
      });
      self.getBillPost(tempCurrentPage)
    }, 300)
  },
  tapBackDelBtn: function(e) {
    var matIndex = e.currentTarget.dataset.matindex;
    this.backDelBtn(matIndex)
  },
  backDelBtn: function(matIndex) {
    let that = this;
    that.data.billInfo.forEach(function(item, index) {
      if (index != matIndex) {
        item.moveLeft = 0
      }
    })
  },
  billDetail: function(e) {
    let that = this;
    console.log(e);
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: that.data.billUrl + '?billId=' + id
    })
  },
  touchMoveToDel: function(e) {
    let that = this;
    if (e.touches.length != 1) {
      return
    }
    if (moveXList[1] == 0) {
      moveXList.shift();
      moveXList.push(e.touches[0].clientX);
      return
    }
    let matIndex = e.currentTarget.dataset.matindex;
    let moveLeft = that.data.billInfo[matIndex].moveLeft;
    this.backDelBtn(matIndex);
    if ((moveLeft <= 0) || (moveLeft > -64)) {
      let dis = moveXList[1] - moveXList[0];
      moveLeft = parseInt(moveLeft ? moveLeft : 0) + parseInt(dis);
      moveLeft = moveLeft < -64 ? -64 : moveLeft;
      moveLeft = moveLeft > 0 ? 0 : moveLeft;
      moveXList.shift();
      moveXList.push(e.touches[0].clientX);
      that.data.billInfo[matIndex].moveLeft = moveLeft;
      that.setData({
        billInfo: that.data.billInfo
      })
    }
  },
  touchEndToDel: function(e) {
    var matIndex = e.currentTarget.dataset.matindex;
    var moveLeft = this.data.billInfo[matIndex].moveLeft;
    if (moveLeft < -32) {
      this.data.billInfo[matIndex].moveLeft = -64
    } else {
      this.data.billInfo[matIndex].moveLeft = 0
    }
    this.setData({
      billInfo: this.data.billInfo
    })
  },
  touchStartToDel: function(e) {
    moveXList = [0, 0]
  },
  del: function(e) {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '是否确定删除账单',
      success: function(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '处理中...',
          });
          that.bindBill(e.currentTarget.dataset.id, e.currentTarget.dataset.matindex)
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  bindBill: function(id, No) {
    postAPI.post('p/ticket/bind', {
      token: app.globalData.userId,
      bind: false,
      ticketId: id
    }, this.getBindSuccess, this.getDataFail, No)
  },
  getMoreScreen: function() {
    let flag = this.data.selectPerson;
    this.setData({
      selectPerson: !flag,
      my_ck: true
    })
  },
  getBindSuccess: function(res, n) {
    wx.hideLoading();
    if (res.code == 0) {
      this.data.billInfo.splice(n, 1);
      this.setData({
        billInfo: this.data.billInfo
      })
    }
  }
})