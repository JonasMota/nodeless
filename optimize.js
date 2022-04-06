'use strict';

const AWS = require ('aws-sdk');
const sharp = require('sharp')
const { basename, extname } = require ('path')
const S3 = new AWS.S3();


module.exports.otimizar = async ({Records: records}, context) => {
  try {
    await Promise.all(records.map(async record => {
      const { Key } = record.s3.object;

      const image = await S3.getObject({
        Bucket: process.env.bucket,
        Key: Key,
      }).Promise();

        const optimized = await sharp(image.body)
        .resize(1280, 720, {fit: 'inside', withoutEnlargement: true})
        .toFormat('jpeg', {progressive: true, quality: 50})
        .toBuffer()

        await S3.putObject({
          Body: optimized,
          Bucket: process.env.bucket,
          ContentType: 'image/jpeg',
          Key: `compressed/${basename(Key, extname(Key))}.jpg`
        }).promise()
      console.log(records)
    }))

    return{
      statusCode: 201,
      body:{}
    };

  } catch (error) {
    return error
  }
};
