export async function DownloadVideoRequest(url: string) {
    try {
        const formData = new FormData();
        formData.append('video_url', url); // Передаём ссылку как параметр формы

        const response = await fetch('http://127.0.0.1:8000/download/', {
            method: 'POST',
            body: formData, // Используем FormData вместо JSON
        });

        return await response.json(); // Возвращаем данные
    } catch (error) {
        console.error('Ошибка при скачивании видео:', error);
        return { error: 'Не удалось подключиться к серверу' };
    }
}