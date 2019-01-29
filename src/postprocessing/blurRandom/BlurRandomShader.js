

const BlurShader = {

  uniforms: {
    "tDiffuse": { type: "t", value: null },
    "resolution": { value: null },
    "clock": { value: 0.0}
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
    uniform float clock;
    uniform sampler2D tDiffuse;
    varying vec2 vUv;

    float rand(vec2 co){
      return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }

    vec4 blur(sampler2D image, vec2 uv, vec2 resolution) {
      float texSizeX = 1. / resolution.x;
      float texSizeY = 1. / resolution.y;
      vec4 color = vec4(0., 0., 0., 0.);
      //vec4 color = texture2D(image, uv);

      float d = 16.;
      const int nbSamples = 20;

      for(int i=0;i<nbSamples;i++){
        float randomDeltaX = texSizeX * rand( uv * (float(i) + 1. * clock) ) * d - (d*0.5) * texSizeX;
        float randomDeltaY = texSizeY * rand( uv * (float(i) + 2. * clock) ) * d - (d*0.5) * texSizeY;
        color += texture2D(image, uv + vec2(randomDeltaX, randomDeltaY));
      }

      color = color / float(nbSamples);

      return color;
    }


    void main() {
      vec4 originalColor = texture2D(tDiffuse, vUv);
      vec4 bluredColor = blur(tDiffuse, vUv, resolution) * 3.;
      gl_FragColor = originalColor + bluredColor;
    }

  `.trim()

};

export default BlurShader
