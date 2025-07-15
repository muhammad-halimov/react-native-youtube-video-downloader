export interface DownloadItemInterface {
    id: string;
    videoTitle: string;
    thumbnail: any; // Используем any для совместимости с React Native Image
    videoDesc: string;
    videoDuration: number;
    videoDownloadPercentage: number;
    videoDownloadSize: number;
    status: 'loading' | 'downloading' | 'completed' | 'error';
    author?: string;
    uploadDate?: string;
}