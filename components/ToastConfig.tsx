import {BaseToast, ErrorToast, ToastConfigParams} from "react-native-toast-message";
import {styles} from "@/assets/stylesheet/styles";

export const toastConfig = {
    success: (props: ToastConfigParams<any>) => (
        <BaseToast
            {...props}
            style={styles.baseToastStyle}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            text1Style={{ fontSize: 16, fontWeight: 'bold' }}
            text2Style={{ fontSize: 14 }}
        />
    ),
    error: (props: ToastConfigParams<any>) => (
        <ErrorToast
            {...props}
            style={styles.errorToastStyle}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            text1Style={{ fontSize: 16, fontWeight: 'bold' }}
            text2Style={{ fontSize: 14 }}
        />
    ),
};