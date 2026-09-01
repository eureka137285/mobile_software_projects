//引入公共地图数据
var data = require('../../utils/data.js')

//地图图层数据
var map=[
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0]
]
//箱子图层数据
var box=[
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0]
]
//方块的宽度
var w=40
//初始化游戏主角(小鸟)的行与列
var row=0
var col=0
//通关弹窗是否已弹出（防止重复弹出）
var winShown=false

Page({
  /**
   * 页面的初始数据
   */
  data:{
    level:1,
    steps:0,
    total:4,
    showWinModal:false,
    hasPrev:false,
    hasNext:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //获取关卡
    let level = options.level
    let levelNum = parseInt(level) + 1
    //更新页面关卡标题
    this.setData({
      level: levelNum,
      steps: 0,
      total: data.maps.length,
      //首关无"上一关"，末关无"下一关"
      hasPrev: levelNum > 1,
      hasNext: levelNum < data.maps.length
    })
    //显示游戏规则弹窗（首次或用户未选"不再提示"）
    let hideRuleTip = wx.getStorageSync('hideRuleTip')
    if (!hideRuleTip) {
      wx.showModal({
        title: '游戏规则',
        content: '把全部箱子推到小猪的位置即可过关\n捣蛋猪可触碰',
        confirmText: '知道了',
        cancelText: '不再提示',
        success: (res) => {
          if (res.cancel) {
            wx.setStorageSync('hideRuleTip', true)
          }
        }
      })
    }
    //创建画布上下文 canvas-id="myCanvas"
    this.ctx = wx.createCanvasContext('myCanvas')
    //初始化地图数据
    this.initMap(level)
    //绘制画布内容
    this.drawCanvas()
  },

  /**
   * 自定义函数--初始化地图数据
   */
  initMap: function(level){
    //读取原始的游戏地图数据
    let mapData = data.maps[level]
    //使用双重for循环记录地图数据
    for (var i=0;i<8;i++){
      for (var j=0;j<8;j++){
        box[i][j]=0
        map[i][j]=mapData[i][j]
        if(mapData[i][j]==4){
          box[i][j]=4
          map[i][j]=2
        }else if (mapData[i][j]==5){
          map[i][j]=2
          //记录小鸟的当前行和列
          row=i
          col=j
        }
      }
    }
  },

  /**
   * 自定义函数--绘制地图
   */
  drawCanvas: function(){
    let ctx=this.ctx
    //清空画布
    ctx.clearRect(0, 0, 320, 320)
    //使用双重for循环绘制8x8的地图
    for(var i=0;i<8;i++){
      for (var j=0;j<8;j++){
        //默认是道路
        let img='ice'
        if(map[i][j]==1){
          img='stone'
        } else if (map[i][j]==3){
          img='pig'
        }
        //绘制地图底图
        ctx.drawImage('/images/icons/'+img+'.png',j*w,i*w,w,w)

        if(box[i][j]==4){
          //叠加绘制箱子
          ctx.drawImage('/images/icons/box.png',j*w,i*w,w,w)
        }
      }
    }
    //叠加绘制小鸟
    ctx.drawImage('/images/icons/bird.png',col* w,row* w,w,w)
    ctx.draw()
  },

  /**
   * 自定义函数--方向键：上
   */
  up: function(){
    //记录移动前的位置
    let lastRow = row
    let lastCol = col
    //不在最顶端才考虑上移
    if(row>0){
      //如果上方不是墙或箱子，可以移动小鸟
      if (map[row -1][col]!= 1 && box[row - 1][col]!= 4){
        row=row-1
      }
      //如果上方是箱子
      else if (box[row - 1][col] == 4) {
        //箱子不在最顶端才能考虑推动
        if(row-1>0){
          //如果箱子上方不是墙或箱子
          if (map[row -2][col]!= 1 && box[row-2][col]!=4){
            box[row -2][col]=4
            box[row -1][col]=0
            //更新当前小鸟的坐标
            row= row-1
          }
        }
      }
      //只有真正移动了才累计步数
      if (row != lastRow || col != lastCol){
        this.addStep()
      }
      //重新绘制地图
      this.drawCanvas()
      //检查游戏是否成功
      this.checkWin()
    }
  },

  /**
   * 自定义函数--方向键：下
   */
  down: function(){
    //记录移动前的位置
    let lastRow = row
    let lastCol = col
    //不在最底端才考虑下移
    if(row<7){
      //如果下方不是墙或箱子，可以移动小鸟
      if (map[row + 1][col]!=1 && box[row + 1][col]!=4){
        row=row+1
      }
      //如果下方是箱子
      else if (box[row + 1][col]==4){
        //箱子不在最底端才能考虑推动
        if (row +1<7){
          //如果箱子下方不是墙或箱子
          if (map[row + 2][col]!= 1 && box[row + 2][col]!=4) {
            box[row + 2][col]=4
            box[row + 1][col]=0
            //更新当前小鸟的坐标
            row= row+1
          }
        }
      }
      //只有真正移动了才累计步数
      if (row != lastRow || col != lastCol){
        this.addStep()
      }
      //重新绘制地图
      this.drawCanvas()
      this.checkWin()
    }
  },

  /**
   * 自定义函数--方向键：左
   */
  left: function(){
    //记录移动前的位置
    let lastRow = row
    let lastCol = col
    //不在最左侧才考虑左移
    if(col>0){
      //如果左侧不是墙或箱子，可以移动小鸟
      if (map[row][col -1]!= 1 && box[row][col -1]!=4){
        col=col-1
      }
      //如果左侧是箱子
      else if (box[row][col - 1] == 4){
        //箱子不在最左侧才能考虑推动
        if(col-1>0){
          //如果箱子左侧不是墙或箱子
          if (map[row][col - 2]!= 1 && box[row][col- 2]!=4){
            box[row][col-2]=4
            box[row][col-1]=0
            //更新当前小鸟的坐标
            col= col-1
          }
        }
      }
      //只有真正移动了才累计步数
      if (row != lastRow || col != lastCol){
        this.addStep()
      }
      //重新绘制地图
      this.drawCanvas()
      this.checkWin()
    }
  },

  /**
   * 自定义函数--方向键：右
   */
  right: function(){
    //记录移动前的位置
    let lastRow = row
    let lastCol = col
    //不在最右侧才考虑右移
    if(col<7){
      //如果右侧不是墙或箱子，可以移动小鸟
      if (map[row][col+1]!= 1 && box[row][col+1]!=4){
        col=col+1
      }
      //如果右侧是箱子
      else if (box[row][col + 1] == 4) {
        //箱子不在最右侧才能考虑推动
        if(col+1<7){
          //如果箱子右侧不是墙或箱子
          if (map[row][col +2]!= 1 && box[row][col+2]!=4){
            box[row][col+2]=4
            box[row][col+1]=0
            col = col+1
          }
        }
      }
      //只有真正移动了才累计步数
      if (row != lastRow || col != lastCol){
        this.addStep()
      }
      this.drawCanvas()
      this.checkWin()
    }
  },

  /**
   * 自定义函数--判断游戏是否成功
   */
  isWin: function(){
    //使用双重for循环遍历整个数组
    for (var i=0;i<8;i++){
      for (var j=0;j<8;j++){
        //如果有箱子没在终点
        if (box[i][j]==4 && map[i][j]!=3){
          //返回false，表示游戏尚未成功
          return false
        }
      }
    }
    //返回true，表示游戏成功
    return true
  },

  /**
   * 自定义函数--游戏成功处理
   */
  checkWin: function(){
    //通关弹窗只弹出一次
    if (this.isWin() && !winShown){
      winShown = true
      //记录已通关的关卡
      let levelIndex = this.data.level - 1
      let completed = wx.getStorageSync('completedLevels') || []
      if (completed.indexOf(levelIndex) === -1){
        completed.push(levelIndex)
        wx.setStorageSync('completedLevels', completed)
      }
      //显示通关弹窗（首关无"上一关"，末关无"下一关"）
      this.setData({
        showWinModal: true,
        hasPrev: this.data.level > 1,
        hasNext: this.data.level < this.data.total
      })
    }
  },

  /**
   * 自定义函数--关闭通关弹窗（点击遮罩）
   */
  closeWinModal: function(){
    this.setData({
      showWinModal: false
    })
  },

  /**
   * 自定义函数--点击弹窗内容（阻止冒泡）
   */
  noop: function(){},

  /**
   * 自定义函数--切换关卡
   */
  switchLevel: function(level){
    winShown = false
    let levelNum = level + 1
    this.setData({
      showWinModal: false,
      level: levelNum,
      steps: 0,
      //首关无"上一关"，末关无"下一关"
      hasPrev: levelNum > 1,
      hasNext: levelNum < data.maps.length
    })
    this.initMap(level)
    this.drawCanvas()
  },

  /**
   * 自定义函数--进入上一关
   */
  goPrev: function(){
    this.switchLevel(this.data.level - 2)
  },

  /**
   * 自定义函数--进入下一关
   */
  goNext: function(){
    this.switchLevel(this.data.level)
  },

  /**
   * 自定义函数--返回选关页面
   */
  goHome: function(){
    wx.navigateBack()
  },

  /**
   * 自定义函数--累计步数
   */
  addStep: function(){
    this.setData({
      steps: this.data.steps + 1
    })
  },

  /**
   * 自定义函数--重新开始游戏
   */
  restartGame: function(){
    //重置通关弹窗标记
    winShown = false
    //初始化地图数据
    this.initMap(this.data.level - 1)
    //重置步数
    this.setData({
      steps: 0,
      showWinModal: false
    })
    //绘制画布内容
    this.drawCanvas()
  }
})