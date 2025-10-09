const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const { v4: uuid } = require('uuid');
const sharp = require('sharp');

module.exports = {
  inputs: {
    file: {
      type: 'json',
      required: true,
    },
  },

  exits: {
    fileIsNotImage: {},
  },

  async fn(inputs) {
    const image = sharp(inputs.file.fd, {
      animated: true,
    });

    let metadata;
    try {
      metadata = await image.metadata();
    } catch {
      throw 'fileIsNotImage';
    }

    if (['svg', 'pdf'].includes(metadata.format)) {
      throw 'fileIsNotImage';
    }

    const dirname = uuid();
    const rootPath = path.join(sails.config.custom.userAvatarsPath, dirname);

    fs.mkdirSync(rootPath);

    const { width, pageHeight: height = metadata.height } = metadata;
    const extension = metadata.format === 'jpeg' ? 'jpg' : metadata.format;

    try {
      await image.toFile(path.join(rootPath, `original.${extension}`));

      await image
        .resize(
          100,
          100,
          width < 100 || height < 100
            ? {
                kernel: sharp.kernel.nearest,
              }
            : undefined,
        )
        .toFile(path.join(rootPath, `square-100.${extension}`));
    } catch {
      try {
        rimraf.sync(rootPath);
      } catch (error2) {
        sails.log.warn(error2.stack);
      }

      throw 'fileIsNotImage';
    }

    try {
      rimraf.sync(inputs.file.fd);
    } catch (error) {
      sails.log.warn(error.stack);
    }

    return {
      dirname,
      extension,
    };
  },
};
