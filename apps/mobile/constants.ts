export const BASE_URL = 'http://192.168.1.33:3001';
export const API_URL = `${BASE_URL}`;

export const getImageUrl = (path: string | null | undefined) => {
    if (!path) return null;
    // Replace localhost URLs with the actual base URL for mobile access
    if (path.startsWith('http://localhost')) {
        return path.replace('http://localhost:3001', BASE_URL);
    }
    if (path.startsWith('http')) return path;
    return `${BASE_URL}${path}`;
};
