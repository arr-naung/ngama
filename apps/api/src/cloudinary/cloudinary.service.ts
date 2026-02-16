import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService implements OnModuleInit {
    private readonly logger = new Logger(CloudinaryService.name);

    onModuleInit() {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret || cloudName === 'fill_me_in') {
            this.logger.warn('Cloudinary configuration missing! Image uploads will fail.');
            return;
        }

        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
        });

        this.logger.log('Cloudinary configured successfully.');
    }

    /**
     * Upload a buffer to Cloudinary via stream.
     * Returns { url, filename } on success.
     */
    async upload(buffer: Buffer, folder = 'ngama_uploads'): Promise<{ url: string; filename: string }> {
        const streamifier = await import('streamifier');
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder, resource_type: 'image' },
                (error, result) => {
                    if (error) return reject(error);
                    if (!result) return reject(new Error('Upload failed'));
                    resolve({
                        url: result.secure_url,
                        filename: result.public_id,
                    });
                },
            );
            streamifier.createReadStream(buffer).pipe(uploadStream);
        });
    }

    /**
     * Delete an image from Cloudinary by extracting its public_id from a URL.
     * Silently fails if deletion is not possible (logs a warning).
     */
    async destroyByUrl(url: string): Promise<void> {
        try {
            const regex = /ngama_uploads\/[^./]+/;
            const match = url.match(regex);

            if (match) {
                const publicId = match[0];
                this.logger.log(`Deleting image from Cloudinary: ${publicId}`);
                await cloudinary.uploader.destroy(publicId);
            } else {
                this.logger.warn(`Could not extract public_id from URL: ${url}`);
            }
        } catch (error) {
            this.logger.error('Failed to delete image from Cloudinary:', error);
        }
    }
}
