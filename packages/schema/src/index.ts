import { z } from 'zod';

// These Zod schemas are used for frontend form validation.
// Backend validation is handled separately by class-validator DTOs in the API.

export const SignupSchema = z.object({
    email: z.string().email(),
    name: z.string().min(1).max(50),
    password: z.string().min(8),
});

export const SigninSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

export const CreatePostSchema = z.object({
    content: z.string().max(10000).optional(),
    parentId: z.string().optional(),
    repostId: z.string().optional(),
    quoteId: z.string().optional(),
    image: z.string().optional()
}).refine(data => {
    // Content is required unless:
    // 1. It's a pure repost (repostId without quoteId)
    // 2. It has an image (for quotes or regular posts)

    // Pure repost (no content needed)
    if (data.repostId && !data.quoteId) return true;

    // Has image (content optional for quotes or regular posts)
    if (data.image) return true;

    // Otherwise, content is required
    return !!data.content && data.content.length > 0;
}, {
    message: "Content or image is required",
    path: ["content"]
});

export const UpdateProfileSchema = z.object({
    name: z.string().min(1).max(50).optional(),
    bio: z.string().max(160).optional(),
    // TODO: Re-enable .url() validation in production when using S3/Cloudinary (absolute URLs)
    // Currently using relative paths (/uploads/...) for local development
    image: z.string().optional(),
    coverImage: z.string().optional()
});

export type SignupInput = z.infer<typeof SignupSchema>;
export type SigninInput = z.infer<typeof SigninSchema>;
export type CreatePostInput = z.infer<typeof CreatePostSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
