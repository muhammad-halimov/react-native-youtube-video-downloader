// Функция для примерной оценки размера файла (в ГБ)
export function estimateFileSizeUtil(bytes: number): number {
    return parseFloat((bytes / Math.pow(1024, 3)).toFixed(3));
}