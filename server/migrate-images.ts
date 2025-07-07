import { db } from './db';
import { properties } from '@shared/schema';
import { eq, isNotNull } from 'drizzle-orm';
import { uploadImageToCloudinary } from './cloudinary';

async function migrateImagesToCloudinary() {
  try {
    console.log('Starting image migration to Cloudinary...');
    
    // 기존 base64 이미지가 있는 매물들 조회
    const propertiesWithImages = await db
      .select()
      .from(properties)
      .where(isNotNull(properties.photos));
    
    console.log(`Found ${propertiesWithImages.length} properties with images`);
    
    for (const property of propertiesWithImages) {
      if (!property.photos || property.photos.length === 0) {
        continue;
      }
      
      console.log(`Processing property ID: ${property.id}, title: ${property.title}`);
      
      const cloudinaryUrls: string[] = [];
      
      for (let i = 0; i < property.photos.length; i++) {
        const photo = property.photos[i];
        
        // 이미 Cloudinary URL인지 확인
        if (photo.startsWith('https://res.cloudinary.com/')) {
          console.log(`Photo ${i + 1} already on Cloudinary, skipping`);
          cloudinaryUrls.push(photo);
          continue;
        }
        
        // base64 이미지인지 확인
        if (!photo.startsWith('data:image/')) {
          console.log(`Photo ${i + 1} is not a base64 image, skipping`);
          cloudinaryUrls.push(photo);
          continue;
        }
        
        try {
          console.log(`Uploading photo ${i + 1}/${property.photos.length} for property ${property.id}`);
          
          // base64에서 Buffer로 변환
          const base64Data = photo.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          
          // Cloudinary에 업로드
          const result = await uploadImageToCloudinary(buffer, {
            folder: 'real-estate',
            quality: 'auto',
            width: 1200,
            height: 800,
            crop: 'limit'
          });
          
          cloudinaryUrls.push(result.secure_url);
          console.log(`Successfully uploaded photo ${i + 1} to Cloudinary: ${result.secure_url}`);
          
        } catch (error) {
          console.error(`Failed to upload photo ${i + 1} for property ${property.id}:`, error);
          // 실패한 경우 원본 유지
          cloudinaryUrls.push(photo);
        }
      }
      
      // 데이터베이스 업데이트
      await db
        .update(properties)
        .set({ photos: cloudinaryUrls })
        .where(eq(properties.id, property.id));
      
      console.log(`Updated property ${property.id} with ${cloudinaryUrls.length} Cloudinary URLs`);
    }
    
    console.log('Image migration completed successfully!');
    
  } catch (error) {
    console.error('Error during image migration:', error);
  }
}

// 직접 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateImagesToCloudinary().then(() => {
    console.log('Migration script finished');
    process.exit(0);
  }).catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
}

export { migrateImagesToCloudinary };