interface DownloadSectionItemProps {
    imgSrc?: any; // Упрощено: any для совместимости с React Native Image
    videoTitle?: string;
    videoDesc?: string;
    videoDuration?: number;
    videoDownloadPercentage?: number;
    videoDownloadSize?: number;
    status?: 'loading' | 'downloading' | 'completed' | 'error';
    author?: string;
    onRemove?: () => void;
}