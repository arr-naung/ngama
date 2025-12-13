import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

@Controller('upload')
export class UploadController {
    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }

    @Post()
    @UseInterceptors(FileInterceptor('file', {
        storage: memoryStorage(), // Store in memory to process with Sharp then stream to Cloudinary
        limits: {
            fileSize: 10 * 1024 * 1024, // 10MB limit
        },
    }))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File
    ) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        try {
            // Process image with Sharp (Resize/Optimize)
            // We use a generic max width to save bandwidth/storage
            const processedBuffer = await sharp(file.buffer)
                .rotate() // Auto-rotate based on EXIF
                .resize(1500, null, { // Max width 1500px, maintain aspect ratio
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality: 80 })
                .toBuffer();

            // Upload to Cloudinary via Stream
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'ngama_uploads', // Folder in Cloudinary
                        resource_type: 'image',
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        if (!result) return reject(new Error('Upload failed'));
                        resolve({
                            url: result.secure_url, // The permanent Cloudinary URL
                            filename: result.public_id,
                        });
                    }
                );

                streamifier.createReadStream(processedBuffer).pipe(uploadStream);
            });

        } catch (error) {
            console.error('Upload Error:', error);
            throw new BadRequestException('Image upload failed');
        }
    }
}

