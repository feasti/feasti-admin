const AWS = require('aws-sdk')

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
})

const uploadFileToS3 = async (file, folder, fileName) => {
    const fileKey = `${folder}/${fileName}`;
    console.log('File is ', file);
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileKey,
        Body: file[0].buffer,
        ACL: 'public-read',
    };
    try {
        const data = await s3.upload(params).promise();
        return data.Location;
    } catch (error) {
        throw error;
    }
};

module.exports = uploadFileToS3;
