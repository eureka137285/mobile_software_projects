var common = require('../../utils/common.js')

Page({
  data: {
    article: {},
    paragraphs: [],
    isAdd: false
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
      wx.showToast({
        title: '新闻不存在',
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
    this.setData({
      article,
      paragraphs,
      isAdd
    })
    if (article.title) {
      wx.setNavigationBarTitle({
        title: article.title
      })
    }
  },

  addFavorites() {
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
    const article = this.data.article
    if (!article || !article.id) {
      return
    }
    wx.removeStorageSync(article.id)
    this.setData({
      isAdd: false
    })
  }
})
