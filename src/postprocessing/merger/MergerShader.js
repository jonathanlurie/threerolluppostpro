const MergerShader = {

  uniforms: {
    "tDiffuse": { type: "t", value: null },
    //"tGlow": { type: "t", value: 1, texture: null }
    "tGlow": { type: "t", value: null }
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
    uniform sampler2D tDiffuse;
    uniform sampler2D tGlow;
    varying vec2 vUv;

    void main() {
      vec4 origColor = texture2D( tDiffuse, vUv );
      vec4 glowColor = texture2D( tGlow, vUv );
      gl_FragColor = origColor + glowColor*3.;
      // gl_FragColor = glowColor;
    }

  `.trim()

};

export default MergerShader
