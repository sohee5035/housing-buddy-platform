import { v2 as cloudinary } from 'cloudinary';

// Cloudinary 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export async function uploadImageToCloudinary(
  imageBuffer: Buffer,
  options: {
    folder?: string;
    quality?: string;
    width?: number;
    height?: number;
    crop?: string;
  } = {}
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder || 'real-estate',
      quality: options.quality || 'auto',
      resource_type: 'image' as const,
      ...options
    };

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes
          });
        } else {
          reject(new Error('Upload failed'));
        }
      }
    ).end(imageBuffer);
  });
}

export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Failed to delete image from Cloudinary:', error);
  }
}

export function generateImageUrl(publicId: string, options: {
  width?: number;
  height?: number;
  crop?: string;
  quality?: string;
} = {}): string {
  return cloudinary.url(publicId, {
    secure: true,
    quality: options.quality || 'auto',
    fetch_format: 'auto',
    ...options
  });
}

export default cloudinary;