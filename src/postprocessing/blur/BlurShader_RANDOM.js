

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


    vec4 blur(sampler2D image, vec2 uv, vec2 resolution) {
      float texSizeX = 1. / resolution.x;
      float texSizeY = 1. / resolution.y;
      vec4 color = vec4(0.0);
      color += texture2D(image, uv);
      color += texture2D(image, uv + vec2(texSizeY, 0.)); // NORTH
      color += texture2D(image, uv + vec2(texSizeY, texSizeX)); // NW
      color += texture2D(image, uv + vec2(0., texSizeX)); // EAST
      color += texture2D(image, uv + vec2(-texSizeY, texSizeX)); // SE
      color += texture2D(image, uv + vec2(-texSizeY, 0.)); // SOUTH
      color += texture2D(image, uv + vec2(-texSizeY, -texSizeX)); // SW
      color += texture2D(image, uv + vec2(0., -texSizeX)); // WEST
      color += texture2D(image, uv + vec2(texSizeY, -texSizeX)); // NW

      // distance 2
      color += texture2D(image, uv + vec2(2. * texSizeY, 0.)); // NORTH
      color += texture2D(image, uv + vec2(2. * texSizeY, 2. * texSizeX)); // NW
      color += texture2D(image, uv + vec2(0., 2. * texSizeX)); // EAST
      color += texture2D(image, uv + vec2(2. * -texSizeY, 2. * texSizeX)); // SE
      color += texture2D(image, uv + vec2(2. * -texSizeY, 0.)); // SOUTH
      color += texture2D(image, uv + vec2(2. * -texSizeY, 2. * -texSizeX)); // SW
      color += texture2D(image, uv + vec2(0., 2. * -texSizeX)); // WEST
      color += texture2D(image, uv + vec2(2. * texSizeY, 2. * -texSizeX)); // NW

      color = color * 0.058823529411765;

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
