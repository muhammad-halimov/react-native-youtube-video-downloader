import {useState} from 'react';
import {Image, TextInput, TouchableOpacity} from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import Toast from 'react-native-toast-message';
import {styles} from "@/assets/stylesheet/styles";
import {toastConfig} from "@/components/ToastConfig";
import {DownloadSectionItem} from "@/components/DownloadSectionItem";
import {ShowToast} from "@/components/ShowToast";

export default function HomeScreen() {
    const [url, setUrl] = useState(''); // Состояние для хранения ссылки

    return (
        <>
            <ParallaxScrollView
                headerBackgroundColor={{light: '#A1CEDC', dark: '#242424'}}
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
                        style={styles.urlInput}
                        value={url}
                        onChangeText={setUrl} // Обновляем состояние при вводе текста
                        placeholder="https://youtube.com/..."
                        placeholderTextColor="#BBB"
                    />
                    <TouchableOpacity
                        style={styles.downloadButton}
                        accessibilityLabel="Нажмите чтобы скачать видео"
                        onPress={() => ShowToast(url)}>
                        <ThemedText style={{color: '#fff'}}>Скачать видео</ThemedText>
                    </TouchableOpacity>
                </ThemedView>
                <DownloadSectionItem/>
            </ParallaxScrollView>
            <Toast config={toastConfig}/>
        </>
    );
}