import {styles} from "@/assets/stylesheet/styles";
import {ThemedView} from "@/components/ThemedView";
import {Image, TouchableOpacity} from "react-native";
import {ThemedText} from "@/components/ThemedText";
import Icon from 'react-native-vector-icons/Ionicons';
import {useState} from "react";

export function DownloadSectionItem() {
    const [visible, setVisible] = useState(true); // Состояние видимости карточки

    if (!visible) return null; // Если скрыли, не рендерим компонент

    return (
        <>
            <TouchableOpacity style={styles.downloadsSection}>
                <ThemedView style={styles.downloadsSectionItem}>
                    <TouchableOpacity style={styles.closeButton} onPress={() => setVisible(false)}>
                        <Icon name="close" size={20} color="white"/>
                    </TouchableOpacity>
                    <ThemedView style={styles.downloadsSectionItemLogoView}>
                        <Image
                            source={require('@/assets/images/youtube.png')}
                            style={styles.downloadsImage}
                        />
                    </ThemedView>
                    <ThemedView style={styles.downloadsSectionItemInfoView}>
                        <ThemedText style={styles.videoTitle}>Название видео</ThemedText>
                        <ThemedText numberOfLines={2} style={styles.videoDescription}>
                            Описание видео
                        </ThemedText>
                        <ThemedText style={styles.videoDuration}>Длительность: 24 мин 30 сек</ThemedText>
                    </ThemedView>
                    <TouchableOpacity style={styles.percentButton}>
                        <ThemedText style={{color: '#fff'}}>100%</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sizeButton}>
                        <ThemedText style={{color: '#fff'}}>15,27Гб</ThemedText>
                    </TouchableOpacity>
                </ThemedView>
            </TouchableOpacity>
        </>
    );
}