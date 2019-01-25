
 const NoChange = {

  uniforms: {
    "tDiffuse": { type: "t", value: null }
  },

  vertexShader: [

  "varying vec2 vUv;",
  "void main() {",
    "vUv = uv;",
    "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

  "}"

  ].join("\n"),

  fragmentShader: `

  uniform sampler2D tDiffuse;
  varying vec2 vUv;

  void main() {

    vec4 color = texture2D(tDiffuse, vUv);
    gl_FragColor = color;

  }


  `.trim()

};

export default NoChange
