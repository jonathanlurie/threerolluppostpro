
/**
 * Generate a 1D gaussian kernel of a desired size and with a given standard deviation
 * If the kernel size is too small for the sdd, some energy may be lost.
 * This function will compensate the loss but this can be avoided by turning
 * boostEnergy to false.
 * @param {Number} size - size of the kernel. Will be turned into q odd number if not
 * @param {Number} sigma - standard deviation of the gaussian
 * @param  {Boolean} boostEnergy - will compensate for energy loss if true
 * @return {Float32Array} the 1D gaussian kernel
 */
function gaussian(size, sigma = 1., boostEnergy=true) {
  let energyLossTolerance = 1e-2
  let mu = 0.

  // we want a 2n+1 kind of kernel
  if(size % 2 === 0) {
    size ++
  }

  let halfSize = ~~(size / 2)
  let all_x = new Float32Array(size).map((x, index) => index - halfSize)
  let all_y = all_x.map( x => (1./(sigma*Math.sqrt(2*Math.PI))) * Math.exp(-Math.pow(x - mu, 2.) / (2 * Math.pow(sigma, 2.))) )
  let energyLost = 1 - all_y.reduce((acc, val) => (acc + val))

  if(energyLost > energyLossTolerance) {
    if(boostEnergy){
      all_y = compensateLostEnergy(all_y)
    } else {
      console.warn(`Lost energy: ${~~(energyLost*100)}%`)
    }
  }

  return {
    kernel: all_y,
    energyLost: energyLost
  }
}


/**
 * Shitty way to compensate for energy loss, still working ok since JS is ok fast.
 * @param  {Array} kernel - the gaussian kernel
 * @return {Array} the boosted gaussian kernel
 */
function compensateLostEnergy(kernel){
  let energy = kernel.reduce((acc, val) => (acc + val))
  let firstEnergy = energy

  // brute force stupid method to increase energy
  let nbIteration = 0
  while (energy < 1) {
    kernel = kernel.map(x => x*1.001)
    energy = kernel.reduce((acc, val) => (acc + val))
    nbIteration ++
  }

  console.warn(`Energy boosted from ${~~(firstEnergy*100)}% to ${~~(energy*100)}% after ${nbIteration} iterations.`);
  return kernel
}


/**
 * Makes a GLSL gaussian blur function of a desired kernel size with a desired
 * standard deviation. Note that the generated GLSLS function is made to be double
 * pass (one vertical, one horizontal) as the generated kernel is single dimensional.
 * (gaussian function is separable)
 * @param {Number} size - size of the kernel. Will be turned into q odd number if not
 * @param {Number} sigma - standard deviation of the gaussian
 * @param {String} functionName - name the GLSL function will have once generated
 * @return {String} The GLSL bluring function
 */
function makeCustomBlurShaderFunction(size = 13, sigma = 1, functionName = 'blur') {
  let {kernel, energyLost} = gaussian(size, sigma)

  let shaderFunction = `vec4 ${functionName}(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {\n`
  shaderFunction += `\tvec4 color = vec4(0.0);\n`
  shaderFunction += `\tvec2 step = direction / resolution;\n`
  let halfSize = ~~(kernel.length / 2)

  // adding the central weight
  shaderFunction += `\tcolor += texture2D(image, uv) * ${kernel[halfSize]};\n`

  // adding the other weight
  for (let i=1; i<=halfSize; i++) {
    shaderFunction += `\tvec2 d${i} = step * ${i}.;\n`
    shaderFunction += `\tcolor += texture2D(image, uv + d${i}) * ${kernel[halfSize-i]};\n`
    shaderFunction += `\tcolor += texture2D(image, uv - d${i}) * ${kernel[halfSize-i]};\n`
  }

  shaderFunction += `\treturn color;\n`
  shaderFunction += `}\n`
  return shaderFunction
}

export default makeCustomBlurShaderFunction
