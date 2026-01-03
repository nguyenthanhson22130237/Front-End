export const uploadToCloudinary = async (file: File): Promise<string | null> => {
    const CLOUD_NAME = "dwydabeoo";
    const UPLOAD_PRESET = "react_app_chat";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const resourceType = file.type.includes("video") ? "video" : "image";

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
            { method: "POST", body: formData }
        );
        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error("Lỗi upload:", error);
        return null;
    }
};

export const isVideoUrl = (url: string) => {
    if (!url) return false;
    return (url.match(/\.(mp4|webm|ogg|mov)$/i) != null);
};

export const isImageUrl = (url: string) => {
    if (!url) return false;
    return (url.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null);
};