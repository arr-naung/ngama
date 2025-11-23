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
        // Return the absolute URL
        // Note: In production, this should use an environment variable for the base URL
        // For now, we assume the API is running on port 3001
        const baseUrl = 'http://localhost:3001';
        return { url: `${baseUrl}/uploads/${file.filename}` };
    }
}
