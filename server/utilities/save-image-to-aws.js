// S3 needs access to the .env variables
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();
const skillInfoboxImagesBucketName =
    process.env.S3_SKILL_INFOBOX_IMAGE_BUCKET_NAME;
const skillInfoboxImageThumbnailsBucketName =
    process.env.S3_SKILL_INFOBOX_IMAGE_THUMBNAILS_BUCKET_NAME;
const bucketRegion = process.env.S3_BUCKET_REGION;
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const accessSecretKey = process.env.S3_SECRET_ACCESS_KEY;
const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: accessSecretKey
    },
    region: bucketRegion
});
const sharp = require('sharp');
/**
 *  Save the image to AWS S3
 *
 * @param {*} iconImage data file string of the image
 * @param {*} skillUrl key and name of the image must be unique
 * @param {*} editUUID additional name if the image is an edit version
 * 
 * @return the name of the image that got saved to database Or null if pass no image
 */
const saveIconToAWS = async (iconImage, skillUrl, editUUID) => {
    if (!iconImage) {
        return null
    }
    // Get file from Base64 encoding (client sends as base64)
    let fileData = Buffer.from(
        iconImage.replace(
            /^data:image\/\w+;base64,/,
            ''
        ),
        'base64'
    );


    const imageName = `${skillUrl}${editUUID ? `_${editUUID}` : ''}`;
    console.log('Save image with name: ')
    console.log(imageName)
    let fullSizeData = {
        // The name it will be saved as on S3
        Key: imageName,
        // The image
        Body: fileData,
        ContentEncoding: 'base64',
        ContentType: 'image/jpeg',
        // The S3 bucket
        Bucket: skillInfoboxImagesBucketName
    };

    // Send to the bucket.
    const fullSizeCommand = new PutObjectCommand(
        fullSizeData
    );
    await s3.send(fullSizeCommand);

    const thumbnailFileData = await sharp(fileData)
        .resize({ width: 330 })
        .toBuffer();

    let thumbnailData = {
        // The name it will be saved as on S3
        Key: imageName,
        // The image
        Body: thumbnailFileData,
        ContentEncoding: 'base64',
        ContentType: 'image/jpeg',
        // The S3 bucket
        Bucket: skillInfoboxImageThumbnailsBucketName
    };

    // Send to the bucket.
    const thumbnailCommand = new PutObjectCommand(
        thumbnailData
    );
    await s3.send(thumbnailCommand)

    return imageName
}

module.exports = { saveIconToAWS }