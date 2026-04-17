const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadVideoBuffer(buffer, publicId, folder = 'training-videos') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'video',
        folder,
        public_id: publicId,
        overwrite: true,
        chunk_size: 6_000_000,
      },
      (err, result) => (err ? reject(err) : resolve(result.secure_url))
    );
    stream.end(buffer);
  });
}

async function deleteVideo(publicId) {
  return cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
}

module.exports = { uploadVideoBuffer, deleteVideo };
