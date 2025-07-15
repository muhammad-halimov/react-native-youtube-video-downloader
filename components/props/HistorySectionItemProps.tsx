interface HistorySectionItemProps {
    video_id: string;
    yt_video_id: string;
    title: string;
    length: number;
    description: string;
    video_size: number;
    status: 'loading' | 'downloading' | 'completed' | 'error';
    thumbnail?: string;
    onRemove?: () => void;
}