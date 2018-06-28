//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '重新授权',
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (res) {

  },

  onMyAuth: function () {
    let that = this
    wx.openSetting({
      success: function (res1) {
        //获取用户授权设置
        wx.getSetting({
          success: res => {
            if (res.authSetting['scope.userLocation']) {
              wx.switchTab({
                url: '../index/index',
                success: function (e) {
                  var page = getCurrentPages().pop();
                  if (page == undefined || page == null) return;
                  page.onLoad();
                }
              })
            } else {
              that.showPop();
            }
          }
        })
      }
    })
  },

  showPop: function () {
    wx.showModal({
      title: '授权提示',
      content: '小程序需要您的微信授权才能使用哦~ 错过授权页面的处理方法：删除小程序->重新搜索进入->点击授权按钮'
    })
  },


})