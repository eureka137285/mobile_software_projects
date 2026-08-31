var common = require('../../utils/common.js')

Page({
  data: {
    article: {},
    paragraphs: [],
    isAdd: false,
    isLiked: false
  },

  onLoad(options) {
    const id = options.id
    const cachedArticle = wx.getStorageSync(id)
    const result = common.getNewsDetail(id)

    if (result.code === '200') {
      // 优先展示 common.js 中的最新数据
      this.setArticle(result.news, !!(cachedArticle && cachedArticle.id))
    } else if (cachedArticle && cachedArticle.id) {
      // common.js 中已无该新闻时，用收藏缓存兜底
      this.setArticle(cachedArticle, true)
    } else {
      // 反查浏览历史，给出更准确的提示
      const history = wx.getStorageSync('history') || []
      const inHistory = (Array.isArray(history) ? history : [])
        .some(item => item && String(item.id) === String(id))
      wx.showToast({
        title: inHistory ? '该新闻已下线或已删除' : '新闻不存在',
        icon: 'none'
      })
    }
  },

  // 设置文章数据，并按换行拆分成段落
  setArticle(article, isAdd) {
    const paragraphs = (article.content || '')
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0)
    const loggedIn = this.isLoggedIn()
    this.setData({
      article,
      paragraphs,
      // 未登录时不展示收藏/点赞状态
      isAdd: loggedIn && isAdd,
      isLiked: loggedIn && this.isLiked(article.id)
    })
    if (article.title) {
      wx.setNavigationBarTitle({
        title: article.title
      })
    }
    // 只有登录后才记录浏览历史
    if (loggedIn) {
      this.recordHistory(article)
    }
  },

  // 记录观看历史：按id去重，最新浏览的排在最前，最多保留50条
  recordHistory(article) {
    if (!article || !article.id) {
      return
    }
    let history = wx.getStorageSync('history') || []
    if (!Array.isArray(history)) {
      history = []
    }
    history = history.filter(item => item.id !== article.id)
    history.unshift({
      id: article.id,
      title: article.title,
      poster: article.poster,
      add_date: article.add_date,
      view_time: Date.now()
    })
    if (history.length > 50) {
      history = history.slice(0, 50)
    }
    wx.setStorageSync('history', history)
  },

  // 是否已登录
  isLoggedIn() {
    const userInfo = wx.getStorageSync('userInfo')
    return !!(userInfo && userInfo.isLogin)
  },

  // 未登录时的拦截提示，并提供去登录入口
  loginTip() {
    wx.showModal({
      title: '提示',
      content: '登录后才能收藏 / 点赞，并记录浏览历史',
      confirmText: '去登录',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.switchTab({
            url: '../my/my'
          })
        }
      }
    })
  },

  addFavorites() {
    if (!this.isLoggedIn()) {
      this.loginTip()
      return
    }
    const article = this.data.article
    if (!article || !article.id) {
      return
    }
    wx.setStorageSync(article.id, article)
    this.setData({
      isAdd: true
    })
  },

  cancelFavorites() {
    if (!this.isLoggedIn()) {
      this.loginTip()
      return
    }
    const article = this.data.article
    if (!article || !article.id) {
      return
    }
    wx.removeStorageSync(article.id)
    this.setData({
      isAdd: false
    })
  },

  // 判断新闻是否已点赞
  isLiked(id) {
    const likes = wx.getStorageSync('likes') || []
    return Array.isArray(likes) && likes.some(item => item && String(item.id) === String(id))
  },

  addLike() {
    if (!this.isLoggedIn()) {
      this.loginTip()
      return
    }
    const article = this.data.article
    if (!article || !article.id) {
      return
    }
    let likes = wx.getStorageSync('likes') || []
    if (!Array.isArray(likes)) {
      likes = []
    }
    if (!likes.some(item => String(item.id) === String(article.id))) {
      likes.unshift({
        id: article.id,
        title: article.title,
        poster: article.poster,
        add_date: article.add_date,
        like_time: Date.now()
      })
      wx.setStorageSync('likes', likes)
    }
    this.setData({
      isLiked: true
    })
  },

  cancelLike() {
    if (!this.isLoggedIn()) {
      this.loginTip()
      return
    }
    const article = this.data.article
    if (!article || !article.id) {
      return
    }
    let likes = wx.getStorageSync('likes') || []
    if (!Array.isArray(likes)) {
      likes = []
    }
    likes = likes.filter(item => String(item.id) !== String(article.id))
    if (likes.length === 0) {
      wx.removeStorageSync('likes')
    } else {
      wx.setStorageSync('likes', likes)
    }
    this.setData({
      isLiked: false
    })
  }
})
