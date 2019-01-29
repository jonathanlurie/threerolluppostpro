

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


    int mod2(float a, float b){
      return int(a - (b * floor(a/b)));
    }

    vec4 blur(sampler2D image, vec2 uv, vec2 resolution) {
      float texSizeX = 1. / resolution.x;
      float texSizeY = 1. / resolution.y;
      vec4 color = vec4(0.0);
      //color += texture2D(image, uv);
//      color += texture2D(image, uv + vec2(texSizeY, 0.));

      const int halfKernelSize = 1;

      float counter = 0.;
      int actualCounter = 0;

      for(int i=-halfKernelSize;i<=halfKernelSize;i++){
        for(int j=-halfKernelSize;j<=halfKernelSize;j++){

          //if(mod2(counter, 2.) == 0) {
            actualCounter ++;
            color += texture2D(image, uv + vec2(float(i)*texSizeX, float(j)*texSizeY));
          //}
          //counter ++;

        }
      }

      color = color / float(actualCounter);

      return color;
    }

    void main() {

      vec4 color = blur(tDiffuse, vUv, resolution);

      //vec4 color = texture2D(tDiffuse, vUv);
      gl_FragColor = color;

    }

  `.trim()

};

export default BlurShader
