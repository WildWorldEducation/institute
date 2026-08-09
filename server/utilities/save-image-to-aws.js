// S3 needs access to the .env variables
//
// NOTE ON PRIVATE BUCKETS / READ URLS:
// These upload functions still produce objects served via public bucket URLs.
// If/when the buckets are flipped to private, every caller that reads an image
// must switch from the public URL to the `getSignedReadUrl` helper exported
// below. That helper depends on `@aws-sdk/s3-request-presigner`, which is NOT
// currently a dependency (only `@aws-sdk/client-s3` is installed). Install it
// first (`npm install @aws-sdk/s3-request-presigner`) before relying on signed
// reads. This module intentionally loads even when the package is absent.
const {
    S3Client,
    PutObjectCommand,
    CopyObjectCommand,
    GetObjectCommand,
    waitUntilObjectExists
} = require('@aws-sdk/client-s3');
require('dotenv').config();

// Guarded require so the module still loads when the presigner package is not
// installed. getSignedReadUrl throws a clear error if it is used without it.
let presigner;
try {
    presigner = require('@aws-sdk/s3-request-presigner');
} catch {
    presigner = null;
}

// Only JPEG and PNG data URIs are accepted.
const ALLOWED_IMAGE_MIME_REGEX = /^data:(image\/(jpeg|png));base64,/;

// Maximum decoded image size in bytes (default 5 MB).
const MAX_IMAGE_BYTES = Number(process.env.S3_MAX_IMAGE_BYTES) || 5 * 1024 * 1024;

/**
 * Validate a base64 image data URI: enforce allowed MIME type (jpeg/png) and
 * the decoded-size cap. Returns the matched contentType.
 *
 * @param {string} dataUri - the incoming `data:image/...;base64,...` string
 * @return {string} the detected content type (e.g. 'image/jpeg')
 */
const validateImageDataUri = (dataUri) => {
    const match =
        typeof dataUri === 'string' && dataUri.match(ALLOWED_IMAGE_MIME_REGEX);
    if (!match) {
        throw new Error(
            'Invalid Base64 image format or unsupported image type (only JPEG and PNG are allowed)'
        );
    }

    enforceImageSize(dataUri);

    return match[1]; // e.g. 'image/jpeg' or 'image/png'
};

/**
 * Enforce the decoded-size cap on a base64 data URI (or raw base64 string)
 * BEFORE any decode/sharp/PutObject work is done.
 *
 * @param {string} dataUri - base64 data URI or raw base64 payload
 */
const enforceImageSize = (dataUri) => {
    const base64 = String(dataUri).replace(/^data:image\/\w+;base64,/, '');
    const decodedBytes = Math.ceil((base64.length * 3) / 4);
    if (decodedBytes > MAX_IMAGE_BYTES) {
        throw new Error(
            `Image exceeds maximum allowed size of ${MAX_IMAGE_BYTES} bytes (decoded ~${decodedBytes} bytes)`
        );
    }
};

const skillInfoboxImagesBucketName =
    process.env.S3_SKILL_INFOBOX_IMAGE_BUCKET_NAME;
const userAvatarImageThumbnailsBucketName =
    process.env.S3_USER_AVATAR_IMAGE_THUMBNAILS_BUCKET_NAME;
const userAvatarImagesBucketName = process.env.S3_USER_AVATAR_IMAGE_BUCKET_NAME;
const skillInfoboxImageThumbnailsBucketName =
    process.env.S3_SKILL_INFOBOX_IMAGE_THUMBNAILS_BUCKET_NAME;
const skillIconBucketName = process.env.S3_SKILL_ICON_BUCKET_NAME;
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
 * @param {*} image data file string of the image
 * @param {*} skillUrl key and name of the image must be unique
 * @param {*} editUUID additional name if the image is an edit version
 *
 * @return the name of the image that got saved to database Or null if pass no image
 */
const saveImageToAWS = async (image, skillUrl, editUUID) => {
    if (!image) {
        return null;
    }
    // Validate MIME type (jpeg/png only) and enforce size cap before decoding.
    validateImageDataUri(image);

    // Get file from Base64 encoding (client sends as base64)
    let fileData = Buffer.from(
        image.replace(/^data:image\/\w+;base64,/, ''),
        'base64'
    );

    const imageName = `${skillUrl}${editUUID ? `_${editUUID}` : ''}`;

    // Save full size image.
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
    const fullSizeCommand = new PutObjectCommand(fullSizeData);
    await s3.send(fullSizeCommand);

    // Save thumbnail size image (for faster loading on skill pages).
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
    const thumbnailCommand = new PutObjectCommand(thumbnailData);
    await s3.send(thumbnailCommand);

    return imageName;
};

/**
 *  Save the icon to AWS S3
 *
 * @param {*} icon data file string of the icon
 * @param {*} skillUrl key and name of the image must be unique
 * @param {*} editUUID additional name if the image is an edit version
 *
 * @return the name of the image that got saved to database Or null if pass no image
 */
const saveIconToAWS = async (icon, skillUrl, editUUID) => {
    if (!icon) {
        return null;
    }
    // Validate MIME type (jpeg/png only) and enforce size cap before decoding.
    validateImageDataUri(icon);

    // Get file from Base64 encoding (client sends as base64)
    let fileData = Buffer.from(
        icon.replace(/^data:image\/\w+;base64,/, ''),
        'base64'
    );

    const iconName = `${skillUrl}${editUUID ? `_${editUUID}` : ''}`;
    let fullSizeData = {
        // The name it will be saved as on S3
        Key: iconName,
        // The image
        Body: fileData,
        ContentEncoding: 'base64',
        ContentType: 'image/jpeg',
        // The S3 bucket
        Bucket: skillIconBucketName
    };

    // Send to the bucket.
    const fullSizeCommand = new PutObjectCommand(fullSizeData);
    await s3.send(fullSizeCommand);

    return iconName;
};
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
                Key: destinationImageURL
            })
        );

        // Copy Thumbnail
        await s3.send(
            new CopyObjectCommand({
                CopySource: `${skillInfoboxImageThumbnailsBucketName}/${sourceImageURL}`,
                Bucket: skillInfoboxImageThumbnailsBucketName,
                Key: destinationImageURL
            })
        );

        // Copy Thumbnails
    } catch (err) {
        console.error(err);
    }
};

/**
 * Add skill icon base64 string into AWS
 *
 * @param {*} base64Image - base64 string of the image
 * @param {*} imageName - name of the image to store in AWS
 * @param {*} bucket - bucket name where the icon will be stored
 */
const saveBase64ImageToBucket = async (base64Image, imageName, bucket) => {
    if (!base64Image) return null;

    // Validate base64 format and extract MIME type
    const match = base64Image.match(/^data:(image\/(jpeg|png));base64,/);

    if (!match) {
        throw new Error(
            'Invalid Base64 image format or unsupported image type (only JPEG and PNG are allowed)'
        );
    }

    // Enforce the decoded-size cap before decoding / uploading.
    enforceImageSize(base64Image);

    const contentType = match[1]; // e.g., 'image/jpeg' or 'image/png'
    const fileData = Buffer.from(
        base64Image.replace(/^data:image\/\w+;base64,/, ''),
        'base64'
    );

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

/**
 * Add skill icon base64 string into AWS
 * (For user's avatar image)
 */
const saveUserAvatarToAWS = async (userId, base64Image) => {
    if (!base64Image) {
        return null;
    }

    // Extract MIME type and decode Base64
    const match = base64Image.match(/^data:(image\/(jpeg|png));base64,/);
    if (!match) {
        throw new Error(
            'Invalid Base64 image format or unsupported image type (only JPEG and PNG are allowed)'
        );
    }

    // Enforce the decoded-size cap before decoding / uploading.
    enforceImageSize(base64Image);

    const contentType = match[1]; // 'image/jpeg' or 'image/png'
    const fileData = Buffer.from(
        base64Image.replace(/^data:image\/\w+;base64,/, ''),
        'base64'
    );

    try {
        // Save original avatar image
        await saveBase64ImageToBucket(
            base64Image,
            userId,
            userAvatarImagesBucketName
        );

        // Generate thumbnail using sharp
        const thumbnailBuffer = await sharp(fileData)
            .resize({ width: 64 }) // Create a 64px-wide thumbnail
            .toBuffer();

        // Convert thumbnail buffer to Base64 string
        const thumbnailBase64 = `data:${contentType};base64,${thumbnailBuffer.toString(
            'base64'
        )}`;

        // Save thumbnail image
        await saveBase64ImageToBucket(
            thumbnailBase64,
            userId,
            userAvatarImageThumbnailsBucketName
        );

        return userId;
    } catch (error) {
        console.error('Failed to save user avatar or thumbnail:', error);
        throw error;
    }
};

/**
 * Resize the icon using sharp
 *
 * @param {*} - base64 string of the image
 * @param {*} iconWidth - the width to scale
 */
const scaleIcon = async (iconData, iconWidth) => {
    try {
        const data = await sharp(iconData)
            .resize({ width: iconWidth })
            .toBuffer();
        const resultBase64 = `data:image/png;base64,${data.toString('base64')}`;

        return resultBase64;
    } catch (error) {
        console.error(error);
    }
};

const updateImage = async (sendImageData) => {
    // Send to the bucket.
    const command = new PutObjectCommand(sendImageData);
    await s3.send(command);
};

/**
 * Generate a presigned URL for READING (GET) an object. Use this to migrate
 * callers off public bucket URLs when the buckets are flipped to private.
 *
 * Requires the `@aws-sdk/s3-request-presigner` package to be installed.
 *
 * @param {string} bucket - the S3 bucket name
 * @param {string} key - the object key within the bucket
 * @param {number} [expiresIn=3600] - URL lifetime in seconds
 * @return {Promise<string>} a time-limited signed GET URL
 */
const getSignedReadUrl = async (bucket, key, expiresIn = 3600) => {
    if (!presigner) {
        throw new Error(
            'Signed read URLs require the "@aws-sdk/s3-request-presigner" package. Install it first: npm install @aws-sdk/s3-request-presigner'
        );
    }
    if (!bucket) throw new Error('Bucket name is required');
    if (!key) throw new Error('Object key is required');

    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    return presigner.getSignedUrl(s3, command, { expiresIn });
};

module.exports = {
    saveImageToAWS,
    updateSkillIcon,
    saveBase64ImageToBucket,
    saveUserAvatarToAWS,
    saveIconToAWS,
    scaleIcon,
    updateImage,
    getSignedReadUrl
};
