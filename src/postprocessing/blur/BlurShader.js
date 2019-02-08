import { makeCustomBlurShaderFunction, makeFastBlurShaderFunction } from './BlurMaker'

const BlurShader = {

  uniforms: {
    "tDiffuse": { type: "t", value: null },
    "resolution": { value: null },
    "direction": { value: null },
  },

  vertexShader: `
  #version 300 es
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }

  `.trim(),

  fragmentShader:
  `
  #version 300 es

  out vec4 out_FragColor;

  ${makeFastBlurShaderFunction(51, 10)}

  uniform vec2 resolution;
  uniform vec2 direction;
  uniform sampler2D tDiffuse;
  varying vec2 vUv;

  void main() {
    vec4 color = blur(tDiffuse, vUv, resolution, direction);
    out_FragColor = color;
  }

  `.trim()

};

export default BlurShader
