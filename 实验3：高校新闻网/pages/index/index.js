// pages/index/index.js
var common = require('../../utils/common.js') //引用公共JS文件
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //幻灯片素材
    swiperImg: [
      {src: 'https://news.ouc.edu.cn/_upload/article/images/30/6b/13f1209e40608a955d175ac5dd02/f24f725e-9573-4bc8-a65b-bb7717917c1d.jpg'},
      {src: 'https://news.ouc.edu.cn/_upload/article/images/e0/1a/0f1277ee4eb8afe3cc2f9fb37777/dba374ab-3182-4713-bb7b-bf2621b9db4f.jpg'},
      {src: 'https://news.ouc.edu.cn/_upload/article/images/dc/f8/06c1b91d4f12876219c149ce1f4f/b2b9662a-1b49-4650-ba3d-093ab20ad9bd.jpg'}
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
    //携带新闻id进行页面跳转
    wx.navigateTo({
      url: '../detail/detail?id=' + id
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
