import * as THREE from 'three'
import TrackballControls from './thirdparty/TrackballControls'
// import Tools from './Tools'
import EventManager from './EventManager'

// common for postprocessing
import EffectComposer from './postprocessing/base/EffectComposer'
import RenderPass from './postprocessing/base/RenderPass'
import ShaderPass from './postprocessing/base/ShaderPass'

// specific postprocessing for Bloom
import UnrealBloomPass from './postprocessing/unrealBloom/UnrealBloomPass'

// specific for postprocessing Sobel
import LuminosityShader from './postprocessing/sobel/LuminosityShader'
import SobelOperatorShader from './postprocessing/sobel/SobelOperatorShader'

// specific for the noChange shader (test)
import NoChange from './postprocessing/noChange/NoChange'

// specific for the PixelShader
import PixelShader from './postprocessing/PixelShader/PixelShader'

// specific for FXAA (antialiasing)
import FXAAShader from './postprocessing/FXAA/FXAAShader'

// blur 1
import BlurShader from './postprocessing/blur/BlurShader'
import BlurHShader from './postprocessing/blurH/BlurHShader'
import BlurVShader from './postprocessing/blurV/BlurVShader'

// noise
import NoiseShader from './postprocessing/noise/NoiseShader'

// blur random
import BlurRandomShader from './postprocessing/blurRandom/BlurRandomShader'


/**
 * ThreeContext creates a WebGL context using THREEjs. It also handle mouse control.
 * An event can be associated to a ThreeContext instance: `onRaycast` with the method
 * `.on("onRaycast", function(s){...})` where `s` is the section object being raycasted.
 */
export class ThreeContext extends EventManager {
  /**
   * @param {DONObject} divObj - the div object as a DOM element.
   * Will be used to host the WebGL context
   * created by THREE
   */
  constructor(divObj = null) {
    super()
    const that = this

    if (!divObj) {
      console.error('The ThreeContext needs a div object')
      return
    }

    this._divObj = divObj
    this._clock = 1
    this._requestFrameId = null

    // init camera
    this._camera = new THREE.PerspectiveCamera(27, divObj.clientWidth / divObj.clientHeight, 1, 10000)
    this._camera.position.z = 500


    // init scene
    this._scene = new THREE.Scene()
    this._scene.add(new THREE.AmbientLight(0x444444))

    // let axesHelper = new THREE.AxesHelper( 1000 )
    // this._scene.add( axesHelper )

    // adding some light
    const light1 = new THREE.DirectionalLight(0xffffff, 0.8)
    // light1.position.set(0, 1000, 0)
    // adding the light to the camera ensure a constant lightin of the model
    this._scene.add(this._camera)
    this._camera.add(light1)

    this._renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
    this._renderer.setClearColor(0xffffff, 0)
    this._renderer.setPixelRatio(window.devicePixelRatio)
    this._renderer.setSize(divObj.clientWidth, divObj.clientHeight)
    this._renderer.gammaInput = true
    this._renderer.gammaOutput = true
    divObj.appendChild(this._renderer.domElement)

    // Necessqry for bloom
    this._composer = new EffectComposer( this._renderer )
    this._composer.setSize( divObj.clientWidth, divObj.clientHeight )

    //

    // Adding some postprocessings:
    // A. UnrealBloom
    //this.addBloom()

    // B. Sobel operator
    //this.addSobel()

    // C. NoChange
    //this.addNoChange()

    // D. PixelShader
    //this.addPixelShader()

    // E. Add antialiasing FXAA
    // this.addFXAA()

    // F. BlurShader
    this.addBlur()


    // G. Noise
    // this.addNoise()

    // H. Blur Random
    //this.addBlurRandom()




    // all the necessary for raycasting
    this._raycaster = new THREE.Raycaster()
    this._raycastMouse = new THREE.Vector2()

    function onMouseMove(event) {
      const elem = that._renderer.domElement
      const rect = elem.getBoundingClientRect()
      const relX = event.clientX - rect.left
      const relY = event.clientY - rect.top
      that._raycastMouse.x = (relX / that._renderer.domElement.clientWidth) * 2 - 1
      that._raycastMouse.y = -(relY / that._renderer.domElement.clientHeight) * 2 + 1
    }

    this._renderer.domElement.addEventListener('mousemove', onMouseMove, false)
    this._renderer.domElement.addEventListener('dblclick', () => {
      this._performRaycast()
    }, false)

    // mouse controls
    this._controls = new TrackballControls(this._camera, this._renderer.domElement)
    this._controls.rotateSpeed = 3
    //this._controls.addEventListener('change', this._render.bind(this))

    window.addEventListener('resize', () => {
      that._camera.aspect = divObj.clientWidth / divObj.clientHeight
      that._camera.updateProjectionMatrix()
      that._renderer.setSize(divObj.clientWidth, divObj.clientHeight)
      that._composer.setSize(divObj.clientWidth, divObj.clientHeight)
      that._controls.handleResize()
      //that._render()
      that._composer.render()
    }, false)

    //this._render()
    this._animate()
  }


  addBloom() {
    let params = {
        exposure: 1,
        bloomStrength: 1.5,
        bloomThreshold: 0,
        bloomRadius: 0
      }

    let bloomPass = new UnrealBloomPass( new THREE.Vector2( this._divObj.clientWidth, this._divObj.clientHeight ), 1.5, 0.4, 0.85 )
    bloomPass.renderToScreen = true
    bloomPass.threshold = params.bloomThreshold
    bloomPass.strength = params.bloomStrength
    bloomPass.radius = params.bloomRadius
    console.log(bloomPass)

    this._composer.addPass( bloomPass )
  }


  addSobel() {
    let effectGrayScale = new ShaderPass( LuminosityShader )
    this._composer.addPass( effectGrayScale )

    let effectSobel = new ShaderPass( SobelOperatorShader );
    effectSobel.renderToScreen = true;
    effectSobel.uniforms.resolution.value.x = window.innerWidth;
    effectSobel.uniforms.resolution.value.y = window.innerHeight;
    this._composer.addPass( effectSobel );
  }


  addNoChange() {
    let noChange = new ShaderPass( NoChange )
    noChange.renderToScreen = true
    this._composer.addPass( noChange )
  }

  addPixelShader() {
    let pixelPass = new ShaderPass( PixelShader )
    pixelPass.uniforms.resolution.value = new THREE.Vector2( this._divObj.clientWidth, this._divObj.clientHeight )
    pixelPass.uniforms.resolution.value.multiplyScalar( window.devicePixelRatio )
    pixelPass.renderToScreen = true
    pixelPass.uniforms.pixelSize.value = 10
    this._composer.addPass( pixelPass )
  }

  // NOT WORKING
  addFXAA() {
    let fxaaPass = new ShaderPass( FXAAShader )
    fxaaPass.uniforms.resolution.value.x = 1 / this._divObj.clientWidth
    fxaaPass.uniforms.resolution.value.y = 1 / this._divObj.clientHeight
    fxaaPass.renderToScreen = true
    this._composer.addPass( fxaaPass )

  }


  addBlur() {
    let renderPass = new RenderPass( this._scene, this._camera )
    this._composer.addPass( renderPass )

    let blurPassV = new ShaderPass( BlurVShader )
    blurPassV.uniforms.resolution.value = new THREE.Vector2( this._divObj.clientWidth, this._divObj.clientHeight )
    //blurPassV.renderToScreen = true
    this._composer.addPass( blurPassV )


    let blurPassH = new ShaderPass( BlurHShader )
    blurPassH.uniforms.resolution.value = new THREE.Vector2( this._divObj.clientWidth, this._divObj.clientHeight )
    blurPassH.renderToScreen = true
    this._composer.addPass( blurPassH )

  }


  addNoise() {
    let noisePass = new ShaderPass( NoiseShader )
    noisePass.uniforms.resolution.value = new THREE.Vector2( this._divObj.clientWidth, this._divObj.clientHeight )
    noisePass.renderToScreen = true
    this._composer.addPass( noisePass )
  }


  addBlurRandom() {
    let blurRandomPass = new ShaderPass( BlurRandomShader )
    blurRandomPass.uniforms.resolution.value = new THREE.Vector2( this._divObj.clientWidth, this._divObj.clientHeight )
    blurRandomPass.renderToScreen = true
    this._composer.addPass( blurRandomPass )

    this.blurRandomPass = blurRandomPass
  }


  /**
   * Adds a Thorus knot to the scene
   */
  addSampleShape() {
    const geometry = new THREE.TorusKnotBufferGeometry(10, 3, 100, 16)
    const material = new THREE.MeshPhongMaterial({
      color: Math.ceil(Math.random() * 0xffff00),
      //wireframeLinewidth: 12,
      wireframe: true
    })
    const torusKnot = new THREE.Mesh(geometry, material)
    this._scene.add(torusKnot)
    this._render()
  }


  /**
   * Get the scene object
   * @return {THREE.Scene}
   */
  getScene() {
    return this._scene
  }


  /**
   * Get the field of view angle of the camera, in degrees
   * @return {Number}
   */
  getCameraFieldOfView() {
    return this._camera.fov
  }


  /**
   * Define the camera field of view, in degrees
   * @param {Number} fov - the fov
   */
  setCameraFieldOfView(fov) {
    this._camera.fov = fov
    this._camera.updateProjectionMatrix()
    this._render()
  }


  /**
   * @private
   * deals with rendering and updating the controls
   */
  _animate() {
    if ("blurRandomPass" in this) {
      this.blurRandomPass.uniforms.clock.value = this._clock
    }


    this._requestFrameId = requestAnimationFrame(this._animate.bind(this))
    this._controls.update()
    this._render()
    // this._clock ++
  }


  /**
   * @private
   * Render the scene
   */
  _render() {
    //this._renderer.render(this._scene, this._camera)
    this._composer.render()
  }


  /**
   * @private
   * Throw a ray from the camera to the pointer, potentially intersect some sections.
   * If so, emit the event `onRaycast` with the section instance as argument
   */
  _performRaycast() {
    // update the picking ray with the camera and mouse position
    this._raycaster.setFromCamera(this._raycastMouse, this._camera)

    // calculate objects intersecting the picking ray
    const intersects = this._raycaster.intersectObjects(this._scene.children, true)

    if (intersects.length) {
      this.emit('onRaycast', intersects)
    }
  }


  /**
   * Get the png image data as base64, in order to later, export as a file
   */
  getSnapshotData() {
    const strMime = 'image/png'
    // let strDownloadMime = "image/octet-stream"
    const imgData = this._renderer.domElement.toDataURL(strMime)
    // imgData.replace(strMime, strDownloadMime)
    return imgData
  }


  /**
   * Kills the scene, interaction, animation and reset all objects to null
   */
  destroy() {
    this._controls.dispose()
    cancelAnimationFrame(this._requestFrameId)
    this._camera = null
    this._controls = null
    this._scene = null
    this._renderer.domElement.remove()
    this._renderer = null
  }
}

export default ThreeContext
