export const isImageUrl = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
        if (!url || !url.startsWith("http")) {
            resolve(false);
            return;
        }

        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
};