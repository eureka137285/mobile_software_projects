// pages/index/index.js
var common = require('../../utils/common.js') //引用公共JS文件
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //幻灯片素材（顺序与下方新闻列表一一对应，携带 id 与标题，可点击跳转）
    swiperImg: [
      {id: '305674', src: 'https://news.ouc.edu.cn/_upload/article/images/83/47/75d4ca9c44458941226f24393cd8/78960f5f-0a33-4fc8-99f4-07aff11860f4.jpg', title: '中国海洋大学迎来2026级本科生'},
      {id: '304083', src: 'https://news.ouc.edu.cn/_upload/article/images/e0/1a/0f1277ee4eb8afe3cc2f9fb37777/dba374ab-3182-4713-bb7b-bf2621b9db4f.jpg', title: '中国船舶集团有限公司董事长、党组书记徐鹏来校调研'},
      {id: '264698', src: 'https://news.ouc.edu.cn/_upload/article/images/30/6b/13f1209e40608a955d175ac5dd02/f24f725e-9573-4bc8-a65b-bb7717917c1d.jpg', title: '山东省人民政府副省长、党组成员闫剑波来校调研'},
      {id: '305670', src: 'https://news.ouc.edu.cn/_upload/article/images/dc/f8/06c1b91d4f12876219c149ce1f4f/b2b9662a-1b49-4650-ba3d-093ab20ad9bd.jpg', title: '中国海洋大学2026级研究生开学典礼举行'}
    ],
    newsList: [],
    newsCount: 0
  },

  /**
   * 自定义函数--跳转新页面浏览新闻内容
   */
  goToDetail: function(e) {
    //获取携带的data-id数据
    let id = e.currentTarget.dataset.id;
    //携带新闻id进行页面跳转，slide-in-bottom 从底部滑入
    wx.navigateTo({
      url: '../detail/detail?id=' + id,
      animationType: 'slide-in-bottom',
      animationDuration: 350
    })
  },

  /**
   * 自定义函数--跳转搜索页
   */
  goToSearch: function() {
    wx.navigateTo({
      url: '../search/search',
      animationType: 'slide-in-bottom',
      animationDuration: 350
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //获取新闻列表
    let list = common.getNewsList()
    //更新列表数据
    this.setData({
      newsList: list,
      newsCount: list.length
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作*/
  
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})
