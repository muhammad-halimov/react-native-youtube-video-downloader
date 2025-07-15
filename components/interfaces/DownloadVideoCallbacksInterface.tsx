import {DownloadItemInterface} from "@/components/interfaces/DownloadItemInterface";

export interface DownloadVideoCallbacksInterface {
    onAddDownload: (download: Omit<DownloadItemInterface, 'id'>) => string;
    onUpdateDownload: (id: string, updates: Partial<DownloadItemInterface>) => void;
    onUpdateProgress: (id: string, percentage: number) => void;
}