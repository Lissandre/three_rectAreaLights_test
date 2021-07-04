import { Vector2, Mesh, Object3D, RectAreaLight, AudioListener, Audio, AudioAnalyser, SphereBufferGeometry, MeshStandardMaterial, ShaderMaterial } from 'three'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper'
import Noise from 'noise-library'
import glslify from 'glslify'
import { TweenMax } from 'gsap'

import vertex from '../../shaders/vertex.vert'
import fragment from '../../shaders/fragment.frag'

export default class RectLight {
  constructor(options) {
    // Options
    this.time = options.time
    this.camera = options.camera
    this.assets = options.assets

    // Set up
    this.container = new Object3D()
    this.container.name = 'RectLight'

    this.colors = [
      '#8B58FF',
      '#FE3ACC',
      '#FF5392',
      '#FF8E63',
      '#FFC751',
      '#F9F871',
    ]

    this.createRectLight()
    // this.setSphere()
    this.setMusic()
  }
  createRectLight() {
    // x = r * cos(𝜃) + Xc
    // y = r * sin(𝜃) + Yc
    // r = radius of circle
    // (Xc, Yc) = coordinates of circle center
    // 𝜃 = current angle
    this.radius = 5
    this.lightNumber = 10
    this.angle = (Math.PI * 2 - (Math.PI * 2) / this.lightNumber) / this.lightNumber
    this.lights = []

    for(let i = 0; i <= this.lightNumber; i++) {
      this.rectLight = new RectAreaLight(0xffffff, 4, 1, 2)
      this.rectLight.position.set(this.radius * Math.cos(this.angle * i), 0, this.radius * Math.sin(this.angle * i))
      this.rectLight.lookAt( 0, 0, 0 )

      this.helper = new RectAreaLightHelper(this.rectLight)
      this.rectLight.add(this.helper)
      this.container.add(this.rectLight)

      this.lights.push(this.rectLight)
    }
    this.container.rotateY(Math.PI/2)
  }
  setSphere() {
    this.sphere_geometry = new SphereBufferGeometry(0.3, 128, 128)
    this.material = new ShaderMaterial({
      uniforms: {
        time: { value: 1.0 },
        resolution: { value: new Vector2() }
      },
      vertexShader:  glslify(vertex),
      fragmentShader: glslify(fragment)
    })

    this.sphere = new Mesh(this.sphere_geometry, this.material)
    this.container.add(this.sphere)

    this.time.on('tick', () => {
      this.material.uniforms.time.value = this.time.elapsed/1000
    })
  }
  setMusic() {
    this.playing = false
    document.addEventListener('click', () => {
      if (this.playing === false) {
        this.sound.play()
        this.playing = true
      }
    })
    this.listener = new AudioListener()
    this.camera.camera.add(this.listener)

    this.sound = new Audio(this.listener)
    this.sound.setBuffer(this.assets.sounds.limbo)

    this.analyser = new AudioAnalyser(this.sound, 128)

    this.canChange = true
    window.navigator.userAgent.includes('Windows')
      ? (this.maxFreq = 33)
      : (this.maxFreq = 50)

    this.time.on('tick', () => {
      this.freq = this.analyser.getAverageFrequency()

      // console.log(this.lights);
      this.lights.forEach((element) => {
        if (this.freq === 0) {
         element.intensity = 3
        } else {
          element.intensity = this.freq / 80
        }
      })
      
      if (this.freq > this.maxFreq && this.canChange === true) {
        this.canChange = false
        this.hexToRGB(
          this.colors[Math.floor(Math.random() * (this.colors.length - 1))]
        )
        this.lights.forEach((element) => {
          TweenMax.to(element.color, {
            duration: 0.3,
            r: this.r / 255,
            g: this.g / 255,
            b: this.b / 255,
          })

        // TweenMax.to(element.helper.color, {
        //   duration: 0.2,
        //   r: this.r / 255,
        //   g: this.g / 255,
        //   b: this.b / 255,
        // })
  
        })
        setTimeout(() => {
          this.canChange = true
        }, 200)
      }
    })
  }
  hexToRGB(h) {
    this.r = 0
    this.g = 0
    this.b = 0
    // 3 digits
    if (h.length === 4) {
      this.r = '0x' + h[1] + h[1]
      this.g = '0x' + h[2] + h[2]
      this.b = '0x' + h[3] + h[3]
      // 6 digits
    } else if (h.length === 7) {
      this.r = '0x' + h[1] + h[2]
      this.g = '0x' + h[3] + h[4]
      this.b = '0x' + h[5] + h[6]
    }
  }
}
