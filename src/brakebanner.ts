import gsap from "gsap"
import { Application, Container, Graphics, Loader, Sprite } from "pixi.js"

  enum Images {
    BRAKE_BIKE = "brake_bike.png",
    BRAKE_HANDLERBAR = "brake_handlerbar.png",
    BRAKE_LEVER = "brake_lever.png",
    BTN_CIRCLE = "btn_circle.png",
    BTN = "btn.png",
  }

export class BrakeBanner {
  // pixi 实例
  private app: Application
  // 加载器
  private loader: Loader
  // banner 容器
  private breakBannerContainer: Container = new Container()
  // 所有的雨滴
  private raindrops: any[] = []
  //雨滴数量
  private raindropCount: number = 20
  // 车容器
  private bycyleContainer: Container = new Container()
  // 刹车
  private brake_lever: Sprite | null = null
  // 车身
  private brake_bike: Sprite | null = null
  // 按钮容器
  private btnContainer: Container = new Container()
  // 车速
  private speed: number = 0
  // 缩放大小
  private scale: number = 0.6
  //循环方法
  private loop = this._loop.bind(this)

  constructor() {
    this.app = new Application({
      width: window.innerWidth,
      height: window.innerHeight,
      resizeTo: window,
      backgroundColor: 0xffffff,
    })

    this.loader = new Loader()

    this._init()
  }

  private async _init() {
    // 加载所有资源
    await this._loadResources()
    // 初始化车
    this._initBycycle()
    // 初始化雨滴
    this._initRaindrops()
    // 让雨滴动起来
    this._raindropsRun()
    // 初始化按钮
    this._initBtn()
    // 添加事件
    this._addEvents()
    
    this.breakBannerContainer.scale.x = this.breakBannerContainer.scale.y = this.scale
    this.app.stage.addChild(this.breakBannerContainer)

    // resize
    this._resize()
  }

  private _addEvents() {
    // 按下按钮时
    this.btnContainer.on("pointerdown", () => {
      // 降低车身透明度
      gsap.to(this.brake_bike, { alpha: 1, duration: 0.3 })

      // 改变刹车角度，形成刹车动画
      gsap.to(this.brake_lever, {
        rotation: (-35 * Math.PI) / 180,
        duration: 0.1,
        ease: "easeInOut",
      })
      // 将车容器偏移
      gsap.to(this.bycyleContainer, {
        y: this.bycyleContainer.height * 0.1,
        duration: 0.1,
        ease: "easeInOut",
      })

      // 隐藏按钮
      gsap.to(this.btnContainer, { alpha: 0, duration: 0.5 })

      // 停止粒子动画
      this._raindropsPause()
    })

    // 松开按钮时
    this.btnContainer.on("pointerup", () => {
      // 恢复刹车角度
      gsap.to(this.brake_lever, {
        rotation: (-20 * Math.PI) / 180,
        duration: 0.8,
        ease: "easeInOut",
      })
      // 恢复车身透明度
      gsap.to(this.brake_bike, { alpha: 0.3, duration: 0.2 })

      // 恢复车容器偏移
      gsap.to(this.bycyleContainer, {
        x: 0,
        y: 0,
        duration: 0.8,
        ease: "easeInOut",
      })

      // 显示按钮
      gsap.to(this.btnContainer, { alpha: 1, duration: 1 })

      this._raindropsRun()
    })
  }

  private _loop() {
    this.speed += 0.5
    this.speed = Math.min(40, this.speed)

    this.raindrops.forEach((v) => {
      v.gr.scale.y = 20
      v.gr.scale.x = 0.05

      v.gr.y += this.speed
      if (v.gr.y > window.innerHeight) {
        v.gr.y = 0
      }
    })
  }

  private _raindropsRun() {
    gsap.ticker.add(this.loop)
  }

  private _raindropsPause() {
    gsap.ticker.remove(this.loop)

    this.speed = 0

    this.raindrops.forEach((v) => {
      v.gr.scale.y = 1
      v.gr.scale.x = 1
      gsap.to(v.gr, { x: v.x, y: v.y, duration: 0.3, ease: "elastic" })
    })
  }

  private _initRaindrops() {
    const raindropContainer = new Container()

    const colors = [0x34495e, 0xffe720]

    for(let i = 0; i < this.raindropCount; i++) {
      const gr = new Graphics()

      const grItem = {
        x: Math.random() * window.innerWidth + this.bycyleContainer!.x,
        y: Math.random() * window.innerHeight + this.bycyleContainer!.y,
        gr,
      }

      gr.x = grItem.x
      gr.y = grItem.y

      gr.beginFill(colors[Math.floor(Math.random() * colors.length)])
      gr.drawCircle(0, 0, 6).endFill()

      raindropContainer.addChild(gr)

      raindropContainer.pivot.x = window.innerWidth / 2 - 1000
      raindropContainer.pivot.y = window.innerHeight / 2
      raindropContainer.rotation = (35 * Math.PI) / 180

      this.raindrops.push(grItem)
    }

    this.app.stage.addChild(raindropContainer)
  }

  private _initBtn() {
    const btnContainer = this.btnContainer

    const btn = new Sprite(this.loader.resources[Images.BTN].texture)
    const btnCircle = new Sprite(this.loader.resources[Images.BTN_CIRCLE].texture)

    btnCircle.pivot.x = btnCircle.pivot.y = btnCircle.width / 2
    btnCircle.scale.x = btnCircle.scale.y = 0.8
    
    btn.pivot.x = btn.pivot.y = btn.width / 2
    btnContainer.x = 600
    btnContainer.y = 700

    btnContainer.buttonMode = true
    btnContainer.interactive = true

    gsap.to(btnCircle.scale, {
      x: 1.1,
      y: 1.1,
      duration: 1,
      repeat: -1,
      ease: "easeInOut",
    })

    btnContainer.addChild(btn)
    btnContainer.addChild(btnCircle)
    this.breakBannerContainer.addChild(btnContainer)
  }
 
  private async _loadResources() {
    const getLoaderArgs = (name: string): [string, string] => [
      name,
      `./images/${name}`,
    ]

    this.loader.add(...getLoaderArgs(Images.BRAKE_BIKE))
    this.loader.add(...getLoaderArgs(Images.BRAKE_HANDLERBAR))
    this.loader.add(...getLoaderArgs(Images.BRAKE_LEVER))
    this.loader.add(...getLoaderArgs(Images.BTN))
    this.loader.add(...getLoaderArgs(Images.BTN_CIRCLE))

    return new Promise((resolve) => this.loader.load(resolve))
  }

  private _initBycycle() {
    const bycyleContainer = this.bycyleContainer

    // 获取资源
    const brake_bike = this.brake_bike = new Sprite(this.loader.resources["brake_bike.png"].texture)
    const brake_lever = this.brake_lever = new Sprite(this.loader.resources["brake_lever.png"].texture)
    const brake_handlerbar = new Sprite(this.loader.resources["brake_handlerbar.png"].texture)
    // 降低透明度
    brake_bike.alpha = 0.3
    //刹车位置
    brake_lever.y = 950
    brake_lever.x = 800
    // 设置锚点
    brake_lever.anchor.x = 1
    brake_lever.anchor.y = 1
    // 调整角度
    brake_lever.rotation = (-20 * Math.PI) / 180
    // 将资源都添加到容器中
    bycyleContainer.addChild(brake_bike)
    bycyleContainer.addChild(brake_lever)
    bycyleContainer.addChild(brake_handlerbar)

    // 将车容器添加到画布中
    this.breakBannerContainer.addChild(bycyleContainer)
  }

  // 窗口大小发生变化时
  private _resize() {
    // 让车一直处于画面右下角
    const setBycyclePosition = () => {
      this.breakBannerContainer.x = window.innerWidth - this.breakBannerContainer.width
      this.breakBannerContainer.y = window.innerHeight - this.breakBannerContainer.height
    }
    
    setBycyclePosition()
    window.addEventListener("resize", setBycyclePosition)
  }

  mount(selector: string) {
    document.querySelector(selector)?.appendChild(this.app.view)
  }
}
