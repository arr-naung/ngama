import { z } from 'zod';

export const SignupSchema = z.object({
    email: z.string().email(),
    username: z.string().min(3).max(20),
    password: z.string().min(8)
});

export const SigninSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

export const CreatePostSchema = z.object({
    content: z.string().max(280).optional(),
    parentId: z.string().optional(),
    repostId: z.string().optional(),
    quoteId: z.string().optional(),
    image: z.string().optional()
}).refine(data => {
    // Content is required unless it's a pure repost or has an image
    if (data.repostId) return true;
    if (data.image) return true;
    return !!data.content && data.content.length > 0;
}, {
    message: "Content is required unless reposting",
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
