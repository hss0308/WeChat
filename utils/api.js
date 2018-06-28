const COMMONURL = 'https://mp-dev.pickdata.cn/';

function post(url, data, success, failFun, pageNo) {
  let that = this;
  wx.request({
    url: `${COMMONURL}${url}`,
    header: {
      "Content-Type": "application/json"
    },
    method: "POST",
    data: data,
    success: function(res) {
      if (res.statusCode === 200) {
        success(res.data, pageNo)
      } else if (res.statusCode === 500) {
        failFun(res.data);
        errFun('服务器内部错误')
      } else if (res.statusCode === 400) {
        failFun(res.data);
        errFun('请求参数有误')
      } else if (res.statusCode === 401) {
        failFun(res.data);
        errFun('没有权限')
      } else if (res.statusCode === 404) {
        failFun(res.data);
        errFun('未知接口')
      } else if (res.statusCode === 502) {
        failFun(res.data);
        errFun('请求超时')
      } else {
        failFun(res.data);
        errFun('未知错误')
      }
    },
    fail: function(err) {
      console.log(err);
      console.error('fail');
      errFun('连接失败')
    }
  })
}

function errFun(content) {
  wx.hideLoading();
  wx.showToast({
    title: `${content}`,
    image: '/image/yj_kym@3x.png',
    mask: true
  });
  setTimeout(() => {
    wx.hideToast()
  }, 3000)
}

function authPost(url, data, success) {
  let that = this;
  wx.request({
    url: `${COMMONURL}${url}`,
    header: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    method: "POST",
    data: data,
    success: function(res) {
      if (res.statusCode === 200) {
        success(res.data)
      } else if (res.statusCode === 500) {
        errFun('服务器内部错误')
      } else if (res.statusCode === 400) {
        errFun('请求参数有误')
      } else if (res.statusCode === 401) {
        errFun('没有权限')
      } else if (res.statusCode === 404) {
        errFun('未知接口')
      } else if (res.statusCode === 502) {
        errFun('请求超时')
      } else {
        errFun('未知错误')
      }
    },
    fail: function() {
      console.error('fail');
      errFun('连接超时')
    }
  })
}

function checkPost(url, data, success) {
  let that = this;
  wx.request({
    url: `${COMMONURL}${url}`,
    header: {
      "Content-Type": "application/json"
    },
    method: "POST",
    data: data,
    success: function(res) {
      if (res.statusCode === 200) {
        success(res.data)
      }
      console.log(res)
    },
    fail: function() {
      console.error('fail')
    }
  })
}

function randomWord(randomFlag, min, max) {
  let str = "";
  let pos = '';
  let range = min;
  let arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  if (randomFlag) {
    range = Math.round(Math.random() * (max - min)) + min;
  }
  for (var i = 0; i < range; i++) {
    pos = Math.round(Math.random() * (arr.length - 1));
    str += arr[pos];
  }
  return str;
}
module.exports = {
  post,
  checkPost,
  authPost,
  randomWord
}