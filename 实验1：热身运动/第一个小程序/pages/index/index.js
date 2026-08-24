// index.js
const app=getApp()
Page({
data:{
  wording:'world'
},
onClick:function(){
  this.setData({
    wording: this.data.wording==='world' ? 'boys and girls' : 'world'//实现
  })
}
})
