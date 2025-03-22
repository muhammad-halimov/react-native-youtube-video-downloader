import Toast from "react-native-toast-message";
import {DownloadVideoRequest} from "@/components/DownloadVideoRequest";

export async function ShowToast(url: string){
    const isValidYouTubeUrl = (url: string) => {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        return youtubeRegex.test(url);
    };

    if (!url.trim()) {
        Toast.show({
            type: 'error',
            text1: 'Ошибка',
            text2: 'Введите ссылку перед скачиванием!',
        });
        return;
    }

    if (!isValidYouTubeUrl(url)) {
        Toast.show({
            type: 'error',
            text1: 'Ошибка',
            text2: 'Введите правильную ссылку!',
        });
        return;
    }

    const response = await DownloadVideoRequest(url); // Ожидаем ответ от сервера

    if (response.error) {
        Toast.show({
            type: 'error',
            text1: 'Ошибка',
            text2: response.error,
        });
    } else {
        Toast.show({
            type: 'success',
            text1: 'Загрузка',
            text2: response.message || `Скачивание началось: ${url}`,
        });
    }
}