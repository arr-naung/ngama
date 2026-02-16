import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { memoryStorage } from 'multer';
import sharp from 'sharp';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('upload')
export class UploadController {
    constructor(private readonly cloudinaryService: CloudinaryService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    @UseInterceptors(FileInterceptor('file', {
        storage: memoryStorage(),
        limits: {
            fileSize: 10 * 1024 * 1024, // 10MB limit
        },
        fileFilter: (_req, file, cb) => {
            if (!file.mimetype.startsWith('image/')) {
                return cb(new BadRequestException('Only image files are allowed') as any, false);
            }
            cb(null, true);
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
            const processedBuffer = await sharp(file.buffer)
                .rotate() // Auto-rotate based on EXIF
                .resize(1500, null, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality: 80 })
                .toBuffer();

            // Upload via centralized service
            return await this.cloudinaryService.upload(processedBuffer);
        } catch (error) {
            console.error('Upload Error:', error);
            const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
            throw new BadRequestException(`Upload failed: ${errorMessage}`);
        }
    }
}
