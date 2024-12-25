// S3 needs access to the .env variables
const {
    S3Client,
    GetObjectCommand,
    PutObjectCommand,
    CopyObjectCommand,
    waitUntilObjectExists
} = require('@aws-sdk/client-s3');
require('dotenv').config();
const conn = require('../config/db');
const userAvatarImageThumbnailsBucketName =
    process.env.S3_USER_AVATAR_IMAGE_THUMBNAILS_BUCKET_NAME;
const userAvatarImagesBucketName = process.env.S3_USER_AVATAR_IMAGE_BUCKET_NAME;
const bucketRegion = process.env.S3_BUCKET_REGION;
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const accessSecretKey = process.env.S3_SECRET_ACCESS_KEY;
const skillInfoboxImageThumbnailsBucketName =
    process.env.S3_SKILL_INFOBOX_IMAGE_THUMBNAILS_BUCKET_NAME;
const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: accessSecretKey
    },
    region: bucketRegion
});

const getImageBase64Data = async () => {

    const response = await s3.send(
        new GetObjectCommand({
            Bucket: skillInfoboxImageThumbnailsBucketName,
            Key: 'Pre-Punic_Carthage',
        })
    );
    const chunks = [];
    for await (let chunk of response.Body) {
        chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    const base64Image = buffer.toString('base64');

    return base64Image
};

module.exports = { getImageBase64Data }