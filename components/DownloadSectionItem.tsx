import {styles} from "@/assets/stylesheet/styles";
import {ThemedView} from "@/components/ThemedView";
import {Image, TouchableOpacity} from "react-native";
import {ThemedText} from "@/components/ThemedText";
import Icon from 'react-native-vector-icons/Ionicons';
import {useState} from "react";

export function DownloadSectionItem({
    imgSrc = require('@/assets/images/youtube.png'),
    videoTitle = 'Название видео',
    videoDesc = 'Описание видео',
    videoDuration = 0,
    videoDownloadPercentage = 0,
    videoDownloadSize = 0,
    status = 'loading',
    onRemove
}: DownloadSectionItemProps) {
    const [visible, setVisible] = useState(true);

    if (!visible) return null;

    const getStatusColor = () => {
        switch (status) {
            case 'completed': return '#4CAF50';
            case 'error': return '#f44336';
            case 'loading': return '#FF9800';
            default: return '#2196F3';
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'completed': return '✓';
            case 'error': return '✗';
            case 'loading': return '...';
            default: return `${videoDownloadPercentage}%`;
        }
    };

    return (
        <TouchableOpacity style={styles.downloadsSection}>
            <ThemedView style={styles.downloadsSectionItem}>
                <TouchableOpacity style={styles.closeButton} onPress={() => {
                    if (onRemove) {
                        onRemove();
                    } else {
                        setVisible(false);
                    }
                }}>
                    <Icon name="close" size={20} color="white"/>
                </TouchableOpacity>
                <ThemedView style={styles.downloadsSectionItemLogoView}>
                    <Image
                        source={imgSrc}
                        style={styles.downloadsImage}
                    />
                </ThemedView>
                <ThemedView style={styles.downloadsSectionItemInfoView}>
                    <ThemedText style={styles.videoTitle}>{videoTitle}</ThemedText>
                    <ThemedText numberOfLines={2} style={styles.videoDescription}>
                        {videoDesc}
                    </ThemedText>
                    <ThemedText style={styles.videoDuration}>
                        Длительность: {videoDuration} мин
                    </ThemedText>
                </ThemedView>
                <TouchableOpacity style={[
                    styles.percentButton,
                    { backgroundColor: getStatusColor() }
                ]}>
                    <ThemedText style={{color: '#fff'}}>
                        {getStatusText()}
                    </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sizeButton}>
                    <ThemedText style={{color: '#fff'}}>{videoDownloadSize}Гб</ThemedText>
                </TouchableOpacity>
            </ThemedView>
        </TouchableOpacity>
    );
}