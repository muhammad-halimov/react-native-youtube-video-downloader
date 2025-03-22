import ParallaxScrollView from '@/components/ParallaxScrollView';
import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import {styles} from '@/assets/stylesheet/styles';
import {DownloadSectionItem} from "@/components/DownloadSectionItem";
import {Image} from "react-native";

export default function TabTwoScreen() {
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
                <DownloadSectionItem/>
            </ParallaxScrollView>
        </>
    );
}
