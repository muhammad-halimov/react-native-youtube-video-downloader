import ParallaxScrollView from '@/components/ParallaxScrollView';
import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import {styles} from '@/assets/stylesheet/styles';
import {Alert, Image, TouchableOpacity} from "react-native";
import {useCallback, useEffect, useState} from "react";
import {getStoredVideos, removeStoredVideos} from "@/components/requests/LocalStorageVideosRequest";
import {DownloadSectionItem} from "@/components/DownloadSectionItem";
import {useFocusEffect} from "@react-navigation/native";
import events from "@/components/events/events";

// noinspection JSUnusedGlobalSymbols
export default function HistoryScreen() {
    const [videos, setVideos] = useState<HistorySectionItemProps[]>([]);

    // Функция загрузки истории
    const loadHistory = async () => {
        const vids = await getStoredVideos();
        setVideos(vids);
    };

    const confirmAsync = (): Promise<boolean> => {
        return new Promise((resolve) => {
            Alert.alert(
                'Очистить историю',
                'Вы уверены, что хотите удалить все загруженные видео?',
                [
                    { text: 'Отмена', style: 'cancel', onPress: () => resolve(false) },
                    { text: 'Очистить', style: 'destructive', onPress: () => resolve(true) },
                ],
                { cancelable: true }
            );
        });
    };

    useFocusEffect(
        useCallback(() => {
            // noinspection JSIgnoredPromiseFromCall
            loadHistory(); // Вызывается при возвращении на экран
        }, [])
    );

    useEffect(() => {
        const handleEvent = () => {
            // noinspection JSIgnoredPromiseFromCall
            loadHistory(); // Вызывается при событии загрузки
        };

        events.on('videoDownloaded', handleEvent);

        return () => {
            events.off('videoDownloaded', handleEvent); // отписка
        };
    }, []);

    const cleanHistory = async () => {
        const confirmed = await confirmAsync();
        if (!confirmed) return;

        await removeStoredVideos();
        await loadHistory();
    };

    return (
        <>
            <ParallaxScrollView
                headerBackgroundColor={{light: '#A1CEDC', dark: '#242424'}}
                headerImage={
                    <Image
                        source={require('@/assets/images/wall-clock.png')}
                        style={styles.clockLogo}
                    />
                }>
                <ThemedView style={styles.titleView}>
                    <ThemedText type="title">Загруженные</ThemedText>
                </ThemedView>

                {videos.length >= 1 && (
                    <ThemedView style={styles.internalHeaderStyle}>
                        <ThemedText type="subtitle" style={styles.urlInputHeaderText}>
                            История загрурзок ({videos.length})
                        </ThemedText>
                        <TouchableOpacity
                            onPress={cleanHistory}
                            style={{ padding: 5 }}>
                            <ThemedText style={{ color: '#f44336', fontSize: 14 }}>
                                Очистить все
                            </ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                )}

                <ThemedView>
                    {videos.map((video, index) => (
                        <DownloadSectionItem
                            key={video.video_id ?? index}
                            imgSrc={{ uri: video.thumbnail ?? '' }}
                            videoTitle={`${(video.title ?? 'Без названия').slice(0, 15)}...`}
                            videoDesc={`${(video.description ?? 'Нет описания').slice(0, 15)}...`}
                            videoDuration={Math.round((video.length ?? 0) / 60)}
                            // videoDownloadPercentage={video.videoDownloadPercentage}
                            videoDownloadSize={video.video_size}
                            status={video.status}
                        />
                    ))}

                    {/* Информация о статусе */}
                    {videos.length === 0 && (
                        <ThemedView style={{ marginTop: 40, alignItems: 'center' }}>
                            <ThemedText style={{
                                textAlign: 'center',
                                color: '#666',
                                fontSize: 16,
                                fontStyle: 'italic'
                            }}>
                                История загрузок будет отображаться здесь
                            </ThemedText>
                        </ThemedView>
                    )}
                </ThemedView>
            </ParallaxScrollView>
        </>
    );
}
