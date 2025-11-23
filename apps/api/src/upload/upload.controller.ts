import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Controller('upload')
export class UploadController {
    @Post()
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = uuidv4();
                return cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB
        },
    }))
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }
        // Use environment variable for base URL, or construct from request
        // For development, you can set UPLOAD_BASE_URL=http://192.168.1.40:3001
        const baseUrl = process.env.UPLOAD_BASE_URL || 'http://localhost:3001';
        return { url: `${baseUrl}/uploads/${file.filename}` };
    }
}
