export const BASE_URL = 'http://192.168.1.33:3000';
export const API_URL = `${BASE_URL}/api`;

export const getImageUrl = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${BASE_URL}${path}`;
};
