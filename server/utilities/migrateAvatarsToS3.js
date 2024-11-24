console.log('test');

// S3 needs access to the .env variables
const {
    S3Client,
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
const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: accessSecretKey
    },
    region: bucketRegion
});
const sharp = require('sharp');

const saveBase64ImageToBucket = async (base64Image, imageName, bucket) => {
    if (!base64Image) return null;

    // Validate base64 format and extract MIME type
    const match = base64Image.match(/^data:(image\/(jpeg|png));base64,/);
    if (!match) {
        throw new Error(
            'Invalid Base64 image format or unsupported image type (only JPEG and PNG are allowed)'
        );
    }

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
console.log(userAvatarImageThumbnailsBucketName);
async function migrate() {
    conn.query(
        `SELECT id, avatar 
                FROM users`,
        async (err, results) => {
            for (const user of results) {
                if (user['avatar']) {
                    try {
                        await saveUserAvatarToAWS(user['id'], user['avatar']);
                        console.log(`User ${user['id']} avatar sent to S3.`);
                    } catch (error) {
                        console.error(
                            `Failed to upload user ${user['id']} avatar`,
                            error
                        );
                    }
                }
            }
        }
    );
}
migrate();
