var common = require('../../utils/common.js')

Page({
  data: {
    isLogin: false,
    src: '',
    nickName: '',
    number: 0,
    newsList: []
  },

  onLoad() {

  },

  onShow() {
    if (this.data.isLogin) {
      this.getMyFavorites()
    } else {
      this.setData({
        newsList: [],
        number: 0
      })
    }
  },

  getUserInfo() {
    wx.getUserProfile({
      desc: '用于展示用户头像和昵称',
      success: (res) => {
        const userInfo = res.userInfo
        this.setData({
          isLogin: true,
          src: userInfo.avatarUrl,
          nickName: userInfo.nickName
        })
        this.getMyFavorites()
      }
    })
  },

  getMyFavorites() {
    const validIds = common.getNewsList().map(item => item.id)
    const info = wx.getStorageInfoSync()
    const myList = []

    info.keys.forEach(key => {
      if (validIds.indexOf(key) !== -1) {
        const obj = wx.getStorageSync(key)
        if (obj && obj.id) {
          myList.push(obj)
        }
      }
    })

    this.setData({
      newsList: myList,
      number: myList.length
    })
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../detail/detail?id=' + id
    })
  }
})
