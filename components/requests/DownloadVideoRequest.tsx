import {VideoInfoInterface} from "@/components/interfaces/VideoInfoInterface";

// API базовый URL
export const API_BASE_URL = 'http://127.0.0.1:5000';
export const STORAGE_KEY = 'downloaded_videos_history';

// Получение информации о видео
export async function getVideoInfo(url: string): Promise<{ data?: VideoInfoInterface; error?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/video_info`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url })
        });

        const data = await response.json();

        if (!response.ok) {
            return { error: data.error || 'Ошибка получения информации о видео' };
        }

        return { data };
    } catch (error) {
        console.error('Ошибка при получении информации о видео:', error);
        return { error: 'Не удалось подключиться к серверу' };
    }
}

// Загрузка видео с возможностью отслеживания прогресса
export async function DownloadVideoRequest(
    url: string,
    resolution: string = '1080p',
    onProgress?: (percentage: number) => void
): Promise<{ success?: boolean; error?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/download/${resolution}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url })
        });

        const data = await response.json();

        if (!response.ok) {
            return { error: data.error || 'Ошибка загрузки видео' };
        }

        // Симуляция прогресса загрузки (в реальном приложении это должно приходить от сервера)
        // Или можно использовать WebSocket для получения реального прогресса
        if (onProgress) {
            for (let i = 0; i <= 100; i += 10) {
                setTimeout(() => onProgress(i), i * 100);
            }
        }

        return { success: true };
    } catch (error) {
        console.error('Ошибка при скачивании видео:', error);
        return { error: 'Не удалось подключиться к серверу' };
    }
}