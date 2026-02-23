const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

exports.uploadToCloud = async (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'dental_ai_detections' },
            (error, result) => {
                if (error) reject(error);
                else resolve({url : result.secure_url, public_id: result.public_id});
            }
        );
        uploadStream.end(fileBuffer);
    });
};

exports.deleteFromCloud = async (publicId) => {
    if (publicId.length === 0) return;
    try {
        const result = await cloudinary.api.delete_resources(publicId);
        console.log('Cloudinary clean up result:', result);
    } catch (error) {
        console.error('Error during Cloudinary cleanup:', error);
    }
};