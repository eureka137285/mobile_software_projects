Page({
  /**
   * 页面的初始数据
   */
  data: {
    levels: []
  },

  /**
   * 生命周期函数--监听页面显示
   * 每次进入选关页时刷新通关状态
   */
  onShow: function() {
    let images = [
      'level01.png',
      'level02.png',
      'level03.png',
      'level04.png'
    ]
    //读取已通关的关卡记录
    let completed = wx.getStorageSync('completedLevels') || []
    let levels = images.map((img, index) => ({
      img: img,
      done: completed.indexOf(index) > -1
    }))
    this.setData({
      levels: levels
    })
  },

  /**
   * 自定义函数--游戏选关跳转
   */
  chooseLevel: function(e){
    let level = e.currentTarget.dataset.level
    wx.navigateTo({
      url:'../game/game?level=' + level
    })
  }
})