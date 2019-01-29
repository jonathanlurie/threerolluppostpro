

const BlurHShader = {

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


    int mod2(float a, float b){
      return int(a - (b * floor(a/b)));
    }

    vec4 blur(sampler2D image, vec2 uv, vec2 resolution) {
      float texSizeX = 1. / resolution.x;
      float texSizeY = 1. / resolution.y;
      vec4 color = vec4(0.0);
      const int halfKernelSize = 20;

      for(int i=-halfKernelSize;i<=halfKernelSize;i++){
        color += texture2D(image, uv + vec2(float(i)*texSizeX, 0.));
      }

      color = color / (float(halfKernelSize)*2.+1.);

      return color;
    }

    void main() {

      vec4 color = blur(tDiffuse, vUv, resolution);

      //vec4 color = texture2D(tDiffuse, vUv);
      gl_FragColor = color;

    }

  `.trim()

};

export default BlurHShader
