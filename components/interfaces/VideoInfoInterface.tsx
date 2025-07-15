type VideoQuality = 'fhd' | 'hd' | 'sd' | 'ld' | 'sld' | 'uld';

// Интерфейс для информации о видео
export interface VideoInfoInterface {
    title: string;
    author: string;
    length: number;
    views: number;
    description: string;
    upload_date: string;
    available_video_qualities: number[];
    video_sizes: Record<VideoQuality, { bytes: number; readable: string; height: number }>;
    thumbnail?: string;
    video_id?: string;
}