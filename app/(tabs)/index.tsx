import { useState } from 'react';
import { Image, TextInput, TouchableOpacity, Alert } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Toast from 'react-native-toast-message';
import { styles } from "@/assets/stylesheet/styles";
import { toastConfig } from "@/components/ToastConfig";
import { DownloadSectionItem } from "@/components/DownloadSectionItem";
import { DownloadVideoService } from "@/components/services/DownloadVideoService";
import {DownloadItemInterface} from "@/components/interfaces/DownloadItemInterface";
import {getVideoInfo} from "@/components/requests/DownloadVideoRequest";
import events from "@/components/events/events";

// noinspection JSUnusedGlobalSymbols
export default function HomeScreen() {
    const [url, setUrl] = useState('');
    const [downloads, setDownloads] = useState<DownloadItemInterface[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Функция для добавления новой загрузки
    const addDownload = (download: Omit<DownloadItemInterface, 'id'>): string => {
        const id = Date.now().toString();
        const newDownload: DownloadItemInterface = {
            ...download,
            id,
        };
        setDownloads(prev => [...prev, newDownload]);
        return id;
    };

    // Функция для обновления данных загрузки
    const updateDownload = (id: string, updates: Partial<DownloadItemInterface>) => {
        setDownloads(prev =>
            prev.map(download =>
                download.id === id ? { ...download, ...updates } : download
            )
        );
    };

    // Функция для обновления прогресса
    const updateProgress = (id: string, percentage: number) => {
        setDownloads(prev =>
            prev.map(download =>
                download.id === id
                    ? { ...download, videoDownloadPercentage: percentage }
                    : download
            )
        );
    };

    // Функция для удаления загрузки
    const removeDownload = (id: string) => {
        setDownloads(prev => prev.filter(download => download.id !== id));
    };

    // Обработчик кнопки скачивания
    const handleDownload = async () => {
        if (!url.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Ошибка',
                text2: 'Введите ссылку перед скачиванием!',
            });
            return;
        }

        try {
            Toast.show({
                type: 'info',
                text1: 'Загрузка качеств',
                text2: 'Загрузка доступных качеств видео',
            });

            const availableQualitiesData = await getVideoInfo(url);
            const { data = { available_video_qualities: [] } } = availableQualitiesData;

            if (data.available_video_qualities.length === 0) {
                Alert.alert(
                    'Нет нужного качества',
                    'Произошла ошибка, нет нужных форматов видео',
                    [
                        {
                            text: 'Ок',
                            style: 'cancel',
                            onPress: () => new Error('Нет нужного качества | Ошибка')
                        }
                    ]
                );
                return;
            }

            const selectedQuality = await new Promise<number>((resolve, reject) => {
                Alert.alert(
                    'Выберите качество видео',
                    'Ниже приведены доступные качества видео',
                    [
                        ...data.available_video_qualities.map((quality: number) => ({
                            text: `${quality}p`,
                            onPress: () => resolve(quality)
                        })),
                        {
                            text: 'Отмена',
                            style: 'cancel',
                            onPress: () => reject(new Error('Отменено пользователем'))
                        }
                    ]
                );
            });

            setIsLoading(true);

            // Теперь запускаем загрузку с выбранным качеством
            await DownloadVideoService(
                url,
                {
                    onAddDownload: addDownload,
                    onUpdateDownload: updateDownload,
                    onUpdateProgress: updateProgress,
                },
                `${selectedQuality}p`
            );

            events.emit('videoDownloaded');

            // Очищаем поле ввода после успешного начала загрузки
            setUrl('');
        } catch (error) {
            if (error instanceof Error && error.message === 'Отменено пользователем') {
                // Пользователь отменил выбор - ничего не делаем
                return;
            }
            console.error('Ошибка при обработке загрузки:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Функция для очистки всех загрузок
    const clearAllDownloads = () => {
        Alert.alert(
            'Очистить все загрузки',
            'Вы уверены, что хотите удалить все элементы из списка загрузок?',
            [
                { text: 'Отмена', style: 'cancel' },
                { text: 'Очистить', style: 'destructive', onPress: () => setDownloads([]) }
            ]
        );
    };

    return (
        <>
            <ParallaxScrollView
                headerBackgroundColor={{ light: '#A1CEDC', dark: '#242424' }}
                headerImage={
                    <Image
                        source={require('@/assets/images/download.png')}
                        style={styles.arrowLogo}
                    />
                }>
                <ThemedView style={styles.titleView}>
                    <ThemedText type="subtitle">YDP - скачивай видео с YouTube</ThemedText>
                </ThemedView>

                <ThemedView>
                    <ThemedText type="subtitle" style={styles.urlInputHeaderText}>
                        Вставьте ссылку для скачивания
                    </ThemedText>
                    <TextInput
                        style={[styles.urlInput, isLoading && { opacity: 0.5 }]}
                        value={url}
                        onChangeText={setUrl}
                        placeholder="https://youtube.com/watch?v=..."
                        placeholderTextColor="#BBB"
                        editable={!isLoading}
                        multiline={false}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TouchableOpacity
                        style={[
                            styles.downloadButton,
                            isLoading && { opacity: 0.5, backgroundColor: '#666' }
                        ]}
                        accessibilityLabel="Нажмите чтобы скачать видео"
                        onPress={handleDownload}
                        disabled={isLoading}>
                        <ThemedText style={{ color: '#fff' }}>
                            {isLoading ? 'Обработка...' : 'Скачать видео'}
                        </ThemedText>
                    </TouchableOpacity>
                </ThemedView>

                {/* Секция загрузок */}
                {downloads.length > 0 && (
                    <ThemedView style={{ marginTop: 20 }}>
                        <ThemedView style={styles.internalHeaderStyle}>
                            <ThemedText type="subtitle" style={styles.urlInputHeaderText}>
                                Загрузки ({downloads.length})
                            </ThemedText>
                            {downloads.length >= 1 && (
                                <TouchableOpacity
                                    onPress={clearAllDownloads}
                                    style={{ padding: 5 }}>
                                    <ThemedText style={{ color: '#f44336', fontSize: 14 }}>
                                        Очистить все
                                    </ThemedText>
                                </TouchableOpacity>
                            )}
                        </ThemedView>

                        {downloads.slice().reverse().map(download => (
                            <DownloadSectionItem
                                key={download.id}
                                imgSrc={download.thumbnail}
                                videoTitle={`${download.videoTitle.slice(0, 15)}...`}
                                videoDesc={`${download.videoDesc.slice(0, 15)}...`}
                                videoDuration={download.videoDuration}
                                videoDownloadPercentage={download.videoDownloadPercentage}
                                videoDownloadSize={download.videoDownloadSize}
                                status={download.status}
                                onRemove={() => removeDownload(download.id)}
                            />
                        ))}
                    </ThemedView>
                )}

                {/* Информация о статусе */}
                {downloads.length === 0 && (
                    <ThemedView style={{ marginTop: 40, alignItems: 'center' }}>
                        <ThemedText style={{
                            textAlign: 'center',
                            color: '#666',
                            fontSize: 16,
                            fontStyle: 'italic'
                        }}>
                            Загрузки будут отображаться здесь
                        </ThemedText>
                    </ThemedView>
                )}
            </ParallaxScrollView>
            <Toast config={toastConfig} />
        </>
    );
}