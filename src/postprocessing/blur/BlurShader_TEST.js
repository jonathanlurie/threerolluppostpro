import { blur5, blur9, blur13 } from './fast-separable-gaussian-blur'

const blurFunctions = [blur5, blur9, blur13].join('\n') + "\n"

const BlurShader = {

  uniforms: {
    "tDiffuse": { type: "t", value: null },
    "resolution": { value: null },
  },

  vertexShader: `

    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }

  `.trim(),

  fragmentShader:
  blurFunctions +
  `
    uniform vec2 resolution;
    uniform sampler2D tDiffuse;
    varying vec2 vUv;

    void main() {

      vec4 color = blur9(tDiffuse, vUv, resolution, vec2(1., 0.));

      //vec4 color = texture2D(tDiffuse, vUv);
      gl_FragColor = color;

    }

  `.trim()

};

export default BlurShader
