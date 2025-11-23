import { Controller, Post, UseInterceptors, UploadedFile, Query, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { unlink } from 'fs/promises';

@Controller('upload')
export class UploadController {
    @Post()
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = uuidv4();
                // Save with temp prefix, will be replaced after processing
                return cb(null, `temp-${randomName}${extname(file.originalname)}`);
            },
        }),
        limits: {
            fileSize: 10 * 1024 * 1024, // 10MB limit
        },
    }))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Query('type') type?: 'avatar' | 'post'
    ) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        const baseUrl = process.env.UPLOAD_BASE_URL || 'http://localhost:3001';
        const isAvatar = type === 'avatar';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const outputFilename = `${uniqueSuffix}.jpg`;
        const outputPath = join('./uploads', outputFilename);

        try {
            // Process image with Sharp
            const sharpInstance = sharp(file.path);

            if (isAvatar) {
                // Avatar: 400x400, cover crop, 85% quality
                await sharpInstance
                    .resize(400, 400, { fit: 'cover', position: 'center' })
                    .jpeg({ quality: 85 })
                    .toFile(outputPath);
            } else {
                // Post image: max 1500px width, maintain aspect ratio, 85% quality
                await sharpInstance
                    .rotate() // Auto-rotate based on EXIF orientation
                    .resize(1500, null, {
                        fit: 'inside',
                        withoutEnlargement: true
                    })
                    .jpeg({ quality: 85 })
                    .toFile(outputPath);
            }

            // Delete the temporary uploaded file
            await unlink(file.path);

            return {
                url: `${baseUrl}/uploads/${outputFilename}`,
                filename: outputFilename,
            };
        } catch (error) {
            // Clean up temp file on error
            try {
                await unlink(file.path);
            } catch { }
            throw error;
        }
    }
}
