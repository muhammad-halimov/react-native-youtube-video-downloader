import {StyleSheet} from "react-native";

export const styles = StyleSheet.create({
    // header section
    titleView: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    clockLogo: {
        height: 180,
        width: 180,
        right: '54%',
        top: '25%',
        position: 'absolute',
    },
    arrowLogo: {
        height: 180,
        width: 180,
        left: '54%',
        top: '25%',
        position: 'absolute',
    },
    // end header section

    // action core
    urlInput: {
        height: 40,
        width: '100%',
        color: "#BBB",
        borderStyle: 'solid',
        borderColor: '#000',
        borderWidth: 1,
        borderRadius: 10,
        fontSize: 18,
        paddingHorizontal: 10,
        marginTop: 5,
        marginBottom: 10,
    },
    urlInputHeaderText: {
        fontSize: 14,
        fontWeight: '300',
        textAlign: 'center',
    },
    downloadButton: {
        backgroundColor: '#046ad8',
        alignSelf: 'center',
        padding: 10,
        borderRadius: 10,
    },
    // end action core

    // downloadsSection cards
    downloadsSection: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        gap: 5,
    },
    downloadsSectionItem: {
        flexDirection: 'row',
        width: '100%',
        height: 140,
        backgroundColor: '#046ad8',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#000',
    },
    downloadsSectionItemLogoView: {
        width: '40%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderBottomLeftRadius: 10,
        borderTopLeftRadius: 10,
    },
    downloadsSectionItemInfoView: {
        width: '60%',
        height: '100%',
        backgroundColor: 'transparent',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
    },
    downloadsImage: {
        width: '95%',
        height: '95%',
        resizeMode: 'contain',
    },
    videoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    videoDescription: {
        fontSize: 14,
        color: '#ddd',
    },
    videoDuration: {
        fontSize: 12,
        color: '#bbb',
    },
    closeButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.5)', // Полупрозрачный фон
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10, // Чтобы было выше остальных элементов
    },
    percentButton: {
        position: 'absolute',
        top: 110,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.5)', // Полупрозрачный фон
        borderRadius: 50,
        width: 95,
        height: 25,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10, // Чтобы было выше остальных элементов
    },
    sizeButton: {
        position: 'absolute',
        top: 110,
        right: 102,
        backgroundColor: 'rgba(0,0,0,0.5)', // Полупрозрачный фон
        borderRadius: 50,
        width: 95,
        height: 25,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10, // Чтобы было выше остальных элементов
    },
    // end downloadsSection cards

    // toasts
    baseToastStyle: {
        borderLeftColor: 'green',
        paddingVertical: 10,
        marginHorizontal: 20,
        marginTop: 10,
        width: "95%",
    },
    errorToastStyle: {
        borderLeftColor: 'red',
        paddingVertical: 10,
        marginHorizontal: 20,
        marginTop: 10,
        width: "95%",
    },
    // end toasts


    headerImage: {
        color: '#808080',
        bottom: -90,
        left: -35,
        position: 'absolute',
    },
});