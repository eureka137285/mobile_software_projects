var common = require('../../utils/common.js')

// 微信官方默认头像
const DEFAULT_AVATAR = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    isLogin: false,
    src: '',
    nickName: '',
    userType: '', // 登录方式：wx（微信）或 anon（匿名）
    avatarUrl: DEFAULT_AVATAR, // 登录表单中选中的头像
    inputNickname: '', // 登录表单中填写的昵称
    number: 0,
    newsList: [],
    likedList: [],
    likedCount: 0,
    historyList: [],
    historyCount: 0,
    slideKey: '' // 当前左滑展开删除按钮的条目标识（如 'fav-0' / 'like-1'），'' 表示无
  },

  onLoad() {
    // 恢复上次登录状态
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo && userInfo.isLogin) {
      this.setData({
        isLogin: true,
        src: userInfo.src || '',
        nickName: userInfo.nickName || '',
        userType: userInfo.userType || 'wx'
      })
    }
  },

  onShow() {
    if (this.data.isLogin) {
      this.getMyFavorites()
      this.getMyLikes()
      this.getHistory()
    } else {
      this.setData({
        newsList: [],
        number: 0,
        likedList: [],
        likedCount: 0,
        historyList: [],
        historyCount: 0
      })
    }
  },

  // 获取观看历史
  getHistory() {
    let history = wx.getStorageSync('history') || []
    if (!Array.isArray(history)) {
      history = []
    }
    // 过滤掉已不在新闻列表中的失效记录（旧 id 等），并同步清理缓存
    const validIds = common.getNewsList().map(item => item.id)
    history = history.filter(item => item && validIds.indexOf(item.id) !== -1)
    if (history.length === 0) {
      wx.removeStorageSync('history')
    } else {
      wx.setStorageSync('history', history)
    }
    history = history.map(item => {
      item.viewTimeText = this.formatTime(item.view_time)
      return item
    })
    this.setData({
      historyList: history,
      historyCount: history.length
    })
  },

  // 左滑删除：记录触摸起点
  onTouchStart(e) {
    this._startX = e.touches[0].clientX
    this._startY = e.touches[0].clientY
  },

  onTouchMove(e) {
    this._moveX = e.touches[0].clientX
    this._moveY = e.touches[0].clientY
  },

  onTouchEnd(e) {
    const deltaX = (this._moveX || 0) - this._startX
    const deltaY = (this._moveY || 0) - this._startY
    const type = e.currentTarget.dataset.type
    const index = e.currentTarget.dataset.index
    // 水平滑动且幅度明显大于垂直滑动时才判定为左滑；
    // 用「列表类型 + 下标」唯一标识条目，收藏与点赞互不影响
    if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX < -40) {
      this.setData({ slideKey: type + '-' + index })
    } else if (deltaX > 40) {
      this.setData({ slideKey: '' })
    }
  },

  // 删除收藏的新闻
  deleteFavorite(e) {
    const id = e.currentTarget.dataset.id
    wx.removeStorageSync(id)
    this.setData({ slideKey: '' })
    this.getMyFavorites()
    wx.showToast({
      title: '已删除',
      icon: 'none'
    })
  },

  // 删除点赞的新闻
  deleteLike(e) {
    const id = e.currentTarget.dataset.id
    let likes = wx.getStorageSync('likes') || []
    if (!Array.isArray(likes)) {
      likes = []
    }
    likes = likes.filter(item => String(item.id) !== String(id))
    if (likes.length === 0) {
      wx.removeStorageSync('likes')
    } else {
      wx.setStorageSync('likes', likes)
    }
    this.setData({ slideKey: '' })
    this.getMyLikes()
    wx.showToast({
      title: '已删除',
      icon: 'none'
    })
  },

  // 删除单条观看历史
  deleteHistoryItem(e) {
    const id = e.currentTarget.dataset.id
    let history = wx.getStorageSync('history') || []
    if (!Array.isArray(history)) {
      history = []
    }
    history = history.filter(item => String(item.id) !== String(id))
    if (history.length === 0) {
      wx.removeStorageSync('history')
    } else {
      wx.setStorageSync('history', history)
    }
    this.getHistory()
    wx.showToast({
      title: '已删除',
      icon: 'none'
    })
  },

  // 清空观看历史（二次确认）
  clearHistory() {
    wx.showModal({
      title: '提示',
      content: '确定要清空全部浏览历史吗？',
      confirmText: '清空',
      cancelText: '取消',
      confirmColor: '#e64340',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('history')
          this.setData({
            historyList: [],
            historyCount: 0
          })
          wx.showToast({
            title: '已清空浏览历史',
            icon: 'none'
          })
        }
      }
    })
  },

  // 格式化时间戳为 yyyy-MM-dd HH:mm
  formatTime(ts) {
    if (!ts) {
      return ''
    }
    const d = new Date(ts)
    const pad = n => (n < 10 ? '0' + n : '' + n)
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  },

  // 选择头像（官方头像昵称填写能力）
  onChooseAvatar(e) {
    this.setData({
      avatarUrl: e.detail.avatarUrl
    })
  },

  // 填写昵称（input type="nickname"，键盘上方可直接选用微信昵称）
  onNicknameBlur(e) {
    this.setData({
      inputNickname: e.detail.value
    })
  },

  // 确认登录：使用用户选择的头像和填写的昵称登录。
  // 说明：微信已不再向 getUserProfile 返回真实头像昵称（一律返回匿名数据），
  // 无法再弹出「微信账号授权」，因此改为「先填好头像昵称 → 确认登录」。
  confirmLogin() {
    const nickName = (this.data.inputNickname || '').trim()
    if (!nickName) {
      wx.showToast({
        title: '请先填写昵称',
        icon: 'none'
      })
      return
    }
    const src = this.data.avatarUrl || DEFAULT_AVATAR
    this.doLogin(src, nickName, 'wx')
  },

  // 匿名登录：随机昵称，无头像（显示占位样式）
  anonLogin() {
    const nickName = '匿名用户' + Math.floor(Math.random() * 10000)
    this.doLogin('', nickName, 'anon')
  },

  // 统一登录逻辑：更新状态 + 持久化 + 刷新收藏
  doLogin(src, nickName, userType) {
    this.setData({
      isLogin: true,
      src,
      nickName,
      userType
    })
    wx.setStorageSync('userInfo', {
      isLogin: true,
      src,
      nickName,
      userType
    })
    this.getMyFavorites()
    wx.showToast({
      title: '登录成功',
      icon: 'success'
    })
  },

  // 退出登录
  logout() {
    wx.removeStorageSync('userInfo')
    this.setData({
      isLogin: false,
      src: '',
      nickName: '',
      userType: '',
      newsList: [],
      number: 0,
      likedList: [],
      likedCount: 0,
      historyList: [],
      historyCount: 0
    })
    wx.showToast({
      title: '已退出登录',
      icon: 'none'
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

  // 获取我的点赞
  getMyLikes() {
    const validIds = common.getNewsList().map(item => item.id)
    let likes = wx.getStorageSync('likes') || []
    if (!Array.isArray(likes)) {
      likes = []
    }
    likes = likes.filter(item => item && validIds.indexOf(item.id) !== -1)
    this.setData({
      likedList: likes,
      likedCount: likes.length
    })
  },

  goToDetail(e) {
    // 若有条目处于左滑展开状态，先收起，避免误跳转
    if (this.data.slideKey !== '') {
      this.setData({ slideKey: '' })
      return
    }
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../detail/detail?id=' + id,
      animationType: 'slide-in-bottom',
      animationDuration: 350
    })
  }
})
