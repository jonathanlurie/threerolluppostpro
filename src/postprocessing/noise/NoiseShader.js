

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

  `
    uniform vec2 resolution;
    uniform sampler2D tDiffuse;
    varying vec2 vUv;


    float rand(vec2 co){
      return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }

    void main() {
      float randWeight = (rand(vUv) - 0.5) * 0.5 ;

      vec4 textureColor = texture2D(tDiffuse, vUv);

      vec4 color = textureColor - randWeight;
      //gl_FragColor = color;

      float randWeight2 = rand(vUv);
      gl_FragColor = vec4(randWeight2, randWeight2, randWeight2, 1.);

    }

  `.trim()

};

export default BlurShader
