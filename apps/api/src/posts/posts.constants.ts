export const POST_INCLUDE = {
    author: {
        select: {
            id: true,
            username: true,
            name: true,
            image: true,
        },
    },
    _count: {
        select: { likes: true, replies: true, reposts: true, quotes: true },
    },
    repost: {
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    name: true,
                    image: true,
                },
            },
            _count: {
                select: { likes: true, replies: true, reposts: true, quotes: true },
            },
            quote: {
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            image: true,
                        },
                    },
                    _count: {
                        select: { likes: true, replies: true, reposts: true, quotes: true },
                    },
                },
            },
        },
    },
    quote: {
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    name: true,
                    image: true,
                },
            },
            _count: {
                select: { likes: true, replies: true, reposts: true, quotes: true },
            },
        },
    },
};
