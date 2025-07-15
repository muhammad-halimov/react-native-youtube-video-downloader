export const isValidYouTubeUrlUtil = (url: string) => {
    return /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/.test(url);
};