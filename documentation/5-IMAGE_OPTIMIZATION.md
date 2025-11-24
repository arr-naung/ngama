# Image Optimization

This document describes the image optimization strategy for the X-clone application to reduce storage costs and improve performance.

## Overview

All uploaded images are automatically processed and optimized before storage. This reduces file sizes by 50-80% while maintaining acceptable visual quality, following X/Twitter's image handling standards.

## Image Processing Specifications

### Profile Avatars

- **Dimensions**: 400x400 pixels (square)
- **Format**: JPEG
- **Quality**: 85%
- **Fit**: Cover (crop to fill, maintaining aspect ratio)
- **Metadata**: Stripped for privacy and size reduction

**Example**: A 2MB PNG avatar becomes ~50-100KB JPEG

### Post Images

- **Max Width**: 1500 pixels
- **Aspect Ratio**: Maintained (original ratio preserved)
- **Format**: JPEG
- **Quality**: 85%
- **Fit**: Inside (scales down, never enlarges)
- **Metadata**: Stripped

**Example**: A 5MB 4K photo becomes ~200-400KB optimized JPEG

## Technical Implementation

### Library

**Sharp** - High-performance Node.js image processing library
- Fast and memory-efficient
- Supports all major image formats (JPEG, PNG, WebP, GIF, TIFF, etc.)
- Industry standard used by major platforms

### Processing Flow

```
1. User uploads image
2. Multer receives file in memory
3. Sharp processes the image:
   - Detects image type (avatar vs post)
   - Resizes to appropriate dimensions
   - Converts to JPEG
   - Compresses to 85% quality
   - Strips EXIF metadata
4. Saves optimized image to disk
5. Returns URL to client
```

### Code Example

```typescript
// Avatar processing
await sharp(buffer)
  .resize(400, 400, { fit: 'cover' })
  .jpeg({ quality: 85 })
  .toFile(filepath);

// Post image processing
await sharp(buffer)
  .resize(1500, null, { fit: 'inside', withoutEnlargement: true })
  .jpeg({ quality: 85 })
  .toFile(filepath);
```

## Why These Settings?

### 85% JPEG Quality

- **Balance**: Near-identical visual quality to 100% but ~50% smaller file size
- **Industry Standard**: Used by X/Twitter, Instagram, Facebook
- **Imperceptible Loss**: Human eye cannot detect the difference in most cases

### Avatar Size: 400x400px

- **Display Size**: Avatars rarely displayed larger than 200px on screen
- **Retina Support**: 400px provides crisp display on 2x retina screens
- **Circular Crop**: Square format works perfectly for circular avatars
- **File Size**: ~50-150KB per avatar (vs 1-3MB original)

### Post Image Max Width: 1500px

- **Screen Display**: Most screens are 1920px or less
- **Mobile Friendly**: Reduces bandwidth for mobile users
- **Quality Preserved**: Still shows excellent detail
- **File Size**: ~200-500KB per image (vs 2-10MB original)

### JPEG Conversion

- **Universal Support**: Works everywhere
- **Small File Size**: Better compression than PNG for photos
- **Progressive Loading**: Browsers can show image while downloading

### Metadata Stripping

- **Privacy**: Removes GPS location, camera model, timestamps
- **File Size**: Metadata can add 10-100KB per image
- **Security**: Prevents information leakage

## Benefits

### Storage Savings

| Image Type | Before | After | Reduction |
|------------|--------|-------|-----------|
| Avatar (typical) | 2MB PNG | 80KB JPEG | **96%** |
| Post Image 4K | 8MB JPEG | 350KB JPEG | **95%** |
| Post Image 1080p | 3MB PNG | 180KB JPEG | **94%** |

**For 1M users with 5 images each:**
- Without optimization: ~25TB storage
- With optimization: ~1.25TB storage
- **Savings: ~95% ($$$)**

### Performance Improvements

- **Faster Upload**: Smaller files = quicker processing
- **Faster Download**: Users load images 10-20x faster
- **Lower Bandwidth**: Saves money on CDN/transfer costs
- **Better UX**: Instant image loading, especially on mobile

### Scalability

- **1M Users Scenario**: Feasible with standard storage solutions
- **CDN Efficiency**: Smaller images = faster edge caching
- **Database Performance**: Less disk I/O for file operations

## Future Enhancements

### When Migrating to S3

- **Multiple Variants**: Generate thumbnail, medium, large sizes
- **WebP Support**: Modern format, 30% smaller than JPEG
- **Lazy Loading**: Only load images when visible
- **CDN Integration**: CloudFront/CloudFlare for global delivery

### Advanced Features

- **Smart Cropping**: AI-powered face detection for avatars
- **Blur Hash**: Instant placeholder while loading
- **Format Detection**: Serve WebP to supported browsers, JPEG fallback
- **Responsive Images**: Different sizes for mobile vs desktop

## Testing

### Verify Optimization

1. Upload an image
2. Check the saved file size: `ls -lh uploads/`
3. Compare to original image size
4. View image in browser - quality should be excellent

### Expected Results

```bash
# Before (original upload)
-rw-r--r-- 1 user staff 2.3M Nov 24 01:00 original.png

# After (optimized)
-rw-r--r-- 1 user staff  87K Nov 24 01:00 optimized.jpg
```

## API Usage

### Upload Endpoint

```typescript
POST /upload
Content-Type: multipart/form-data

// Optional query parameter to specify image type
POST /upload?type=avatar
POST /upload?type=post
```

### Response

```json
{
  "url": "http://localhost:3001/uploads/1234567890-avatar.jpg",
  "filename": "1234567890-avatar.jpg",
  "size": 87654 // size in bytes
}
```

## Configuration

All optimization settings are in `apps/api/src/upload/upload.controller.ts`:

```typescript
const IMAGE_CONFIG = {
  avatar: {
    width: 400,
    height: 400,
    fit: 'cover',
    quality: 85
  },
  post: {
    maxWidth: 1500,
    quality: 85,
    fit: 'inside'
  }
};
```

## Notes

- Original uploaded files are **not saved** - only optimized versions
- All images converted to JPEG regardless of input format
- No image enlargement - small images stay small
- Aspect ratios preserved for post images
- Avatars are always square (400x400)

---

**Result**: Massive storage savings with imperceptible quality loss, enabling scalability to millions of users! 🚀
