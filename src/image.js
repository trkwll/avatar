const crypto = require('crypto')

const sharp = require('sharp')
const Color = require('color')

const svg = require('./svg')
const helper = require('./helper')

function generateGradient(username, text, width, height, colors = undefined) {
  const hash = crypto.createHash('md5').update(username).digest('hex')

  let firstColor = helper.hashStringToColor(hash)
  let secondColor

  if (Array.isArray(colors)) {
    firstColor = colors[0]
    secondColor = colors[1]
  }

  firstColor = new Color(firstColor).saturate(0.5)

  const lightning = firstColor.hsl().color[2]
  if (lightning < 25) {
    firstColor = firstColor.lighten(3)
  }
  if (lightning > 25 && lightning < 40) {
    firstColor = firstColor.lighten(0.8)
  }
  if (lightning > 75) {
    firstColor = firstColor.darken(0.4)
  }

  let avatar = svg.replace('$FIRST', firstColor.hex())
  avatar = avatar.replace('$SECOND', secondColor || helper.getMatchingColor(firstColor).hex())

  avatar = avatar.replace(/(\$WIDTH)/g, width)
  avatar = avatar.replace(/(\$HEIGHT)/g, height)

  avatar = avatar.replace(/(\$TEXT)/g, text)
  avatar = avatar.replace(/(\$FONTSIZE)/g, (height * 0.7) / text.length)


  return avatar
}

function parseSize(size) {
  const maxSize = 1000
  if (size && size.match(/^-?\d+$/) && size <= maxSize) {
    return parseInt(size, 10)
  }
  return 120
}

exports.generateSVG = function(username, text, width, height) {
  width = parseSize(width)
  height = parseSize(height)
  return generateGradient(username, text, width, height)
}

exports.generatePNG = function(username, width, height) {
  width = parseSize(width)
  height = parseSize(height)
  const svg = generateGradient(username, '', width, height)
  return sharp(Buffer.from(svg)).png()
}

/**
 *
 * @param {Object} params
 * @param {string} params.username -
 * @param {string} params.text -
 * @param {string} params.width -
 * @param {string} params.height -
 * @param {Array} params.colors -
 */
exports.generatePNGBuffer = async (params) => {
  const { username = "", text = "", } = params;
  const width = parseSize(params.width);
  const height = parseSize(params.height);
  const svg = generateGradient(username, text, width, height);
  return sharp(Buffer.from(svg)).png().toBuffer()
};

