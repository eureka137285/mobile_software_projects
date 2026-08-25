// index.js
const config = require("../../config")

Page({
  data: {
    appName: config.APP_NAME,
    name: config.NAME,
    school: config.SCHOOL,
    college: config.COLLEGE,
    grade: config.GRADE,
    major: config.MAJOR,
    role1: config.ROLE1,
    role2: config.ROLE2,
    email: config.EMAIL,
    intro: config.INTRO,
    summary: config.SUMMARY
  },

  onLoad() {
    // 让右上角「···」菜单支持“转发给好友”和“分享到朋友圈”
    if (wx.showShareMenu) {
      wx.showShareMenu({
        menus: ["shareAppMessage", "shareTimeline"]
      })
    }
  },

  // 转发给微信好友
  onShareAppMessage() {
    return {
      title: this.data.name + " · " + this.data.school + " 个人介绍",
      path: "/pages/index/index",
      imageUrl: "/assets/share.jpg"
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: this.data.name + " · " + this.data.school + " 个人介绍",
      imageUrl: "/assets/share.jpg"
    }
  },

  copyEmail() {
    wx.setClipboardData({ data: this.data.email })
  }
})
