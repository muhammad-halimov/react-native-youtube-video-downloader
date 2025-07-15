import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEY} from "@/components/requests/DownloadVideoRequest";

export const getStoredVideos = async (): Promise<HistorySectionItemProps[]> => {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
};

export const addVideoToStorage = async (video: HistorySectionItemProps): Promise<void> => {
    const existingVideos = await getStoredVideos();

    // Не добавляем дубликат
    const alreadyExists = existingVideos.some(v => v.yt_video_id === video.yt_video_id);
    if (alreadyExists) return;

    const updated = [video, ...existingVideos]; // новое видео — первым
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const removeStoredVideos = async (): Promise<void> => {
    await AsyncStorage.removeItem(STORAGE_KEY);
};