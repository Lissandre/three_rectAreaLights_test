import { Scene, sRGBEncoding, ReinhardToneMapping, Vector2, WebGLRenderer } from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

import * as dat from 'dat.gui'

import Sizes from '@tools/Sizes'
import Time from '@tools/Time'
import Assets from '@tools/Loader'

import Camera from './Camera'
import World from '@world/index'

export default class App {
  constructor(options) {
    // Set options
    this.canvas = options.canvas

    // Set up
    this.time = new Time()
    this.sizes = new Sizes()
    this.assets = new Assets()

    this.params = {
      exposure: 0.93,
      bloomStrength: 1.2,
      bloomThreshold: 0,
      bloomRadius: 0.49,
    }

    this.setConfig()
    this.setRenderer()
    this.setCamera()
    this.setComposer()
    this.setWorld()
  }
  setRenderer() {
    // Set scene
    this.scene = new Scene()
    // Set renderer
    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    this.renderer.outputEncoding = sRGBEncoding
    this.renderer.toneMapping = ReinhardToneMapping
    this.renderer.gammaFactor = 2.2
    // Set background color
    this.renderer.setClearColor(0x000000, 1)
    // Set renderer pixel ratio & sizes
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.sizes.viewport.width, this.sizes.viewport.height)
    // Resize renderer on resize event
    this.sizes.on('resize', () => {
      this.renderer.setSize(
        this.sizes.viewport.width,
        this.sizes.viewport.height
      )
      this.composer?.setSize(
        this.sizes.viewport.width,
        this.sizes.viewport.height
      )
    })
    // Set RequestAnimationFrame with 60fps
    this.time.on('tick', () => {
      if (this.composer) {
        this.composer.render()
      } else {
        this.renderer.render(this.scene, this.camera.camera)
      }
    })
  }
  setCamera() {
    // Create camera instance
    this.camera = new Camera({
      sizes: this.sizes,
      renderer: this.renderer,
      debug: this.debug,
    })
    // Add camera to scene
    this.scene.add(this.camera.container)
  }
  setWorld() {
    // Create world instance
    this.world = new World({
      time: this.time,
      debug: this.debug,
      assets: this.assets,
      camera: this.camera,
    })
    // Add world to scene
    this.scene.add(this.world.container)
  }
  setComposer() {
    this.renderScene = new RenderPass(this.scene, this.camera.camera)

    this.bloomPass = new UnrealBloomPass(
      new Vector2(this.sizes.viewport.width, this.sizes.viewport.height),
      this.params.bloomStrength,
      this.params.bloomRadius,
      this.params.bloomThreshold
    )

    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(this.renderScene)
    this.composer.addPass(this.bloomPass)

    this.composer.renderer.outputEncoding = sRGBEncoding
    this.composer.renderer.toneMapping = ReinhardToneMapping

    if (this.debug) {
      const folder = this.debug.addFolder('Renderer')
      folder.open()
      folder.add(this.params, 'exposure', 0.1, 2).onChange((value) => {
        this.renderer.toneMappingExposure = Math.pow(value, 4.0)
      })
      folder.add(this.params, 'bloomThreshold', 0.0, 1.0).onChange((value) => {
        this.bloomPass.threshold = Number(value)
      })
      folder.add(this.params, 'bloomStrength', 0.0, 3.0).onChange((value) => {
        this.bloomPass.strength = Number(value)
      })
      folder
        .add(this.params, 'bloomRadius', 0.0, 1.0)
        .step(0.01)
        .onChange((value) => {
          this.bloomPass.radius = Number(value)
        })
    }
  }
  setConfig() {
    if (window.location.hash === '#debug') {
      this.debug = new dat.GUI({ width: 450 })
    }
  }
}
