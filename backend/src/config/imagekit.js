const ImageKit = require("imagekit");
const env = require("./env");

const imagekit = new ImageKit({
  publicKey: (env.IMAGEKIT_PUBLIC_KEY || '').trim(),
  privateKey: (env.IMAGEKIT_PRIVATE_KEY || '').trim(),
  urlEndpoint: (env.IMAGEKIT_URL_ENDPOINT || '').trim()
});

module.exports = imagekit;
