import Constants from 'expo-constants';

const productionUrl = 'https://silent-cynthy-x-instance-543a2f86.koyeb.app';

const getLocalApiUrl = () => {
    const debuggerHost = Constants.expoConfig?.hostUri;
    const localhost = debuggerHost?.split(':')[0];

    if (!localhost) {
        return 'http://localhost:3001';
    }

    return `http://${localhost}:3001`;
};

// Automatically switch based on Dev Mode
export const BASE_URL = __DEV__ ? getLocalApiUrl() : productionUrl;
export const API_URL = `${BASE_URL}`;

export const getImageUrl = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${BASE_URL}${path}`;
};
