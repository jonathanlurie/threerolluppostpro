import makeCustomBlurShaderFunction from './BlurMaker'

const BlurShader = {

  uniforms: {
    "tDiffuse": { type: "t", value: null },
    "resolution": { value: null },
    "direction": { value: null },
  },

  vertexShader: `

    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }

  `.trim(),

  fragmentShader:
  makeCustomBlurShaderFunction(51, 10) +
  `
    uniform vec2 resolution;
    uniform vec2 direction;
    uniform sampler2D tDiffuse;
    varying vec2 vUv;

    void main() {
      vec4 color = blur(tDiffuse, vUv, resolution, direction);
      gl_FragColor = color;
    }

  `.trim()

};

export default BlurShader
