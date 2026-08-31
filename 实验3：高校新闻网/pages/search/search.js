var common = require('../../utils/common.js')

Page({
  data: {
    keyword: '',
    results: [],
    searched: false,
    history: []
  },

  onLoad() {
    this.setData({
      history: this.getHistory()
    })
  },

  // 搜索输入
  onInput(e) {
    this.setData({
      keyword: e.detail.value
    })
  },

  // 清空输入框
  clearKeyword() {
    this.setData({
      keyword: ''
    })
  },

  // 执行搜索：模糊匹配（标题 + 正文）
  // 支持：空格拆分多个关键词（每个词都需命中）、连续子串、按字符顺序跳跃（子序列）匹配
  onSearch() {
    const keyword = this.data.keyword.trim()
    if (!keyword) {
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none'
      })
      return
    }
    const kw = keyword.toLowerCase()
    const words = kw.split(/\s+/).filter(w => w.length > 0)
    const list = common.getNewsList()
    const scored = []
    list.forEach(item => {
      const detail = common.getNewsDetail(item.id)
      const content = ((detail.news && detail.news.content) || '').toLowerCase()
      const title = (item.title || '').toLowerCase()
      let total = 0
      let matched = true
      words.forEach(word => {
        const s = this.matchKeyword(word, title, content)
        total += s
        if (s === 0) {
          matched = false
        }
      })
      if (matched) {
        scored.push({ item, score: total })
      }
    })
    // 相关度高的排前面：标题命中 > 正文命中，子串命中 > 子序列命中
    scored.sort((a, b) => b.score - a.score)
    const results = scored.map(s => s.item)
    this.saveHistory(keyword)
    this.setData({
      results,
      searched: true
    })
  },

  // 单个关键词匹配得分：返回 0 表示未命中
  // 分值从高到低：标题子串 > 正文子串 > 标题子序列 > 正文子序列 > 标题数字模糊 > 正文数字模糊
  matchKeyword(word, title, content) {
    if (title.indexOf(word) !== -1) return 8
    if (content.indexOf(word) !== -1) return 7
    if (this.isSubsequence(word, title)) return 6
    if (this.isSubsequence(word, content)) return 5
    if (this.isDigitFuzzyMatch(word, title)) return 3
    if (this.isDigitFuzzyMatch(word, content)) return 2
    return 0
  },

  // 子序列匹配：关键词的字符按顺序出现在文本中即可（允许中间隔其他字）
  isSubsequence(word, text) {
    if (!word) return true
    let i = 0
    for (let j = 0; j < text.length && i < word.length; j++) {
      if (text[j] === word[i]) {
        i++
      }
    }
    return i === word.length
  },

  // 数字模糊匹配：关键词中的每个数字（去重后）在文本中都至少出现一次即可，
  // 不要求连续、不要求个数完全一致（如「666」可命中只含一个「6」的文本）。
  // 若关键词还包含文字，文字部分仍需按序匹配，避免过度降低精准度。
  isDigitFuzzyMatch(word, text) {
    const letters = word.replace(/\d/g, '')
    if (letters && !this.isSubsequence(letters, text)) {
      return false
    }
    const digits = word.replace(/\D/g, '')
    if (!digits) {
      return false
    }
    const unique = []
    for (const ch of digits) {
      if (unique.indexOf(ch) === -1) {
        unique.push(ch)
      }
    }
    for (const ch of unique) {
      if (text.indexOf(ch) === -1) {
        return false
      }
    }
    return true
  },

  // 点击历史关键词直接搜索
  tapHistory(e) {
    const kw = e.currentTarget.dataset.kw
    this.setData({
      keyword: kw
    }, () => this.onSearch())
  },

  // 读取搜索历史
  getHistory() {
    let history = wx.getStorageSync('searchHistory') || []
    return Array.isArray(history) ? history : []
  },

  // 记录搜索历史：去重、最新在前、最多 10 条
  saveHistory(keyword) {
    let history = this.getHistory()
    history = history.filter(k => k !== keyword)
    history.unshift(keyword)
    history = history.slice(0, 10)
    wx.setStorageSync('searchHistory', history)
    this.setData({
      history
    })
  },

  // 清空搜索历史
  clearHistory() {
    wx.removeStorageSync('searchHistory')
    this.setData({
      history: []
    })
    wx.showToast({
      title: '已清空搜索历史',
      icon: 'none'
    })
  },

  // 跳转新闻详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../detail/detail?id=' + id,
      animationType: 'slide-in-bottom',
      animationDuration: 350
    })
  }
})
