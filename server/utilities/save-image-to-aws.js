// S3 needs access to the .env variables
const { S3Client, PutObjectCommand, CopyObjectCommand, waitUntilObjectExists, } = require('@aws-sdk/client-s3');
require('dotenv').config();
const skillInfoboxImagesBucketName =
    process.env.S3_SKILL_INFOBOX_IMAGE_BUCKET_NAME;
const userAvatarImageThumbnailsBucketName = process.env.S3_USER_AVATAR_IMAGE_THUMBNAILS_BUCKET_NAME;
const userAvatarImagesBucketName = process.env.S3_USER_AVATAR_IMAGE_BUCKET_NAME;
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
/**
 * Copy an image with another image that already stored in AWS
 *
 * @param {*} sourceImageURL - key of the image you want to copy
 * @param {*} destinationImageURL - key of the image needed to update with the copy
 */
const updateSkillIcon = async (sourceImageURL, destinationImageURL) => {
    try {
        // Copy Icon 
        await s3.send(
            new CopyObjectCommand({
                CopySource: `${skillInfoboxImagesBucketName}/${sourceImageURL}`,
                Bucket: skillInfoboxImagesBucketName,
                Key: destinationImageURL,
            }),
        );

        // Copy Thumbnail
        await s3.send(
            new CopyObjectCommand({
                CopySource: `${skillInfoboxImageThumbnailsBucketName}/${sourceImageURL}`,
                Bucket: skillInfoboxImageThumbnailsBucketName,
                Key: destinationImageURL,
            }),
        )

        // Copy Thumbnails
    } catch (err) {
        console.error(err);
    }

}
const saveBase64ImageToBucket = async (base64Image, imageName, bucket) => {
    if (!base64Image) return null;

    // Validate base64 format and extract MIME type
    const match = base64Image.match(/^data:(image\/(jpeg|png));base64,/);
    if (!match) {
        throw new Error('Invalid Base64 image format or unsupported image type (only JPEG and PNG are allowed)');
    }

    const contentType = match[1]; // e.g., 'image/jpeg' or 'image/png'
    const fileData = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ''), 'base64');

    if (!imageName) throw new Error('Image name is required');
    if (!bucket) throw new Error('Bucket name is required');

    const imageData = {
        Key: imageName,
        Body: fileData,
        ContentEncoding: 'base64',
        ContentType: contentType, // Dynamic based on detected MIME type
        Bucket: bucket
    };

    try {
        const imageCommand = new PutObjectCommand(imageData);
        return await s3.send(imageCommand);
    } catch (error) {
        console.error('Failed to upload image:', error);
        throw error;
    }
};

const saveUserAvatarToAWS = async (userId, base64Image) => {
    if (!base64Image) {
        return null;
    }

    // Extract MIME type and decode Base64
    const match = base64Image.match(/^data:(image\/(jpeg|png));base64,/);
    if (!match) {
        throw new Error('Invalid Base64 image format or unsupported image type (only JPEG and PNG are allowed)');
    }

    const contentType = match[1]; // 'image/jpeg' or 'image/png'
    const fileData = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ''), 'base64');

    try {
        // Save original avatar image
        await saveBase64ImageToBucket(base64Image, userId, userAvatarImagesBucketName);

        // Generate thumbnail using sharp
        const thumbnailBuffer = await sharp(fileData)
            .resize({ width: 64 }) // Create a 64px-wide thumbnail
            .toBuffer();

        // Convert thumbnail buffer to Base64 string
        const thumbnailBase64 = `data:${contentType};base64,${thumbnailBuffer.toString('base64')}`;

        // Save thumbnail image
        await saveBase64ImageToBucket(thumbnailBase64, userId, userAvatarImageThumbnailsBucketName);

        return userId;
    } catch (error) {
        console.error('Failed to save user avatar or thumbnail:', error);
        throw error;
    }
};
module.exports = { saveIconToAWS, updateSkillIcon, saveBase64ImageToBucket, saveUserAvatarToAWS }