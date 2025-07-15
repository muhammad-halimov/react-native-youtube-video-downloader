import Toast from "react-native-toast-message";
import {DownloadVideoRequest, getVideoInfo} from "@/components/requests/DownloadVideoRequest";
import {DownloadVideoCallbacksInterface} from "@/components/interfaces/DownloadVideoCallbacksInterface";
import {estimateFileSizeUtil} from "@/components/coreutils/EstimateFileSizeUtil";
import {isValidYouTubeUrlUtil} from "@/components/coreutils/IsValidYouTubeUrlUtil";
import {addVideoToStorage} from "@/components/requests/LocalStorageVideosRequest";

export async function DownloadVideoService(
    url: string,
    callbacks: DownloadVideoCallbacksInterface,
    quality: string = '1080p',
): Promise<void> {
    // Проверка на пустоту
    if (!url.trim()) {
        Toast.show({
            type: 'error',
            text1: 'Ошибка',
            text2: 'Введите ссылку перед скачиванием!',
        });
        return;
    }

    // Валидация URL
    if (!isValidYouTubeUrlUtil(url)) {
        Toast.show({
            type: 'error',
            text1: 'Ошибка',
            text2: 'Введите правильную ссылку YouTube!',
        });
        return;
    }

    // Показываем уведомление о начале процесса
    Toast.show({
        type: 'info',
        text1: 'Получение информации',
        text2: 'Загружаем информацию о видео...',
    });

    // Добавляем элемент загрузки с начальным состоянием
    const downloadId = callbacks.onAddDownload({
        videoTitle: 'Загрузка информации...',
        thumbnail: require('@/assets/images/youtube.png'), // Дефолтная картинка
        videoDesc: 'Получение данных о видео...',
        videoDuration: 0,
        videoDownloadPercentage: 0,
        videoDownloadSize: 0,
        status: 'loading'
    });

    try {
        // Получаем информацию о видео
        const { data: videoInfo, error: infoError } = await getVideoInfo(url);

        if (infoError || !videoInfo) {
            callbacks.onUpdateDownload(downloadId, { status: 'error' });
            Toast.show({
                type: 'error',
                text1: 'Ошибка',
                text2: infoError || 'Не удалось получить информацию о видео',
            });
            return;
        }

        // Исправлено: правильно создаем объект для thumbnail
        const thumbnailSource = videoInfo.thumbnail
            ? { uri: videoInfo.thumbnail }
            : require('@/assets/images/youtube.png');

        let assumatedVideoQuality: number;

        // Проверка на null и выбор хоть какого-то значения
        if (videoInfo.video_sizes.fhd) {
            assumatedVideoQuality = videoInfo.video_sizes.fhd.bytes;
        } else if (videoInfo.video_sizes.hd) {
            assumatedVideoQuality = videoInfo.video_sizes.hd.bytes;
        } else if (videoInfo.video_sizes.sd) {
            assumatedVideoQuality = videoInfo.video_sizes.sd.bytes;
        } else if (videoInfo.video_sizes.ld) {
            assumatedVideoQuality = videoInfo.video_sizes.ld.bytes;
        } else if (videoInfo.video_sizes.sld) {
            assumatedVideoQuality = videoInfo.video_sizes.sld.bytes;
        } else if (videoInfo.video_sizes.uld) {
            assumatedVideoQuality = videoInfo.video_sizes.uld.bytes;
        } else {
            // Fallback на случай, если ни одно качество не доступно
            Toast.show({
                type: 'error',
                text1: 'Ошибка',
                text2: `Произошла неизвестная ошибка`,
            });
            return;
        }

        callbacks.onUpdateDownload(downloadId, {
            videoTitle: videoInfo.title,
            thumbnail: thumbnailSource, // Используем объект или require
            videoDesc: videoInfo.description || 'Без описания',
            videoDuration: Math.round(videoInfo.length / 60),
            videoDownloadSize: estimateFileSizeUtil(assumatedVideoQuality),
            status: 'downloading'
        });

        // Показываем уведомление о начале загрузки
        Toast.show({
            type: 'info',
            text1: 'Загрузка началась',
            text2: `Скачиваем: ${videoInfo.title}`,
        });

        // Начинаем загрузку видео
        const { success, error: downloadError } = await DownloadVideoRequest(
            url,
            quality,
            (percentage: number) => {
                callbacks.onUpdateProgress(downloadId, percentage);
            }
        );

        if (success) {
            callbacks.onUpdateDownload(downloadId, {
                status: 'completed',
                videoDownloadPercentage: 100
            });

            Toast.show({
                type: 'success',
                text1: 'Загрузка завершена',
                text2: 'Видео успешно скачано!',
            });

            await addVideoToStorage({
                video_id: downloadId,
                yt_video_id: String(videoInfo.video_id),
                title: String(videoInfo.title || "Без названия"),
                length: videoInfo.length,
                description: String(videoInfo.description || "Без описания"),
                video_size: estimateFileSizeUtil(assumatedVideoQuality),
                status: 'completed',
                thumbnail: videoInfo.thumbnail,
            });
        } else {
            callbacks.onUpdateDownload(downloadId, { status: 'error' });
            Toast.show({
                type: 'error',
                text1: 'Ошибка загрузки',
                text2: downloadError || 'Не удалось скачать видео',
            });
        }

    } catch (error) {
        callbacks.onUpdateDownload(downloadId, { status: 'error' });
        Toast.show({
            type: 'error',
            text1: 'Ошибка',
            text2: 'Произошла неожиданная ошибка',
        });
        console.error('Ошибка в DownloadVideoService:', error);
    }
}
