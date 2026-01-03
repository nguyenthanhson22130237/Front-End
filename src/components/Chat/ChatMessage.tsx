import { useEffect, useState } from "react";
import { isImageUrl } from "../../utils/isImageUrl";
import { decodeMessage } from "../../utils/decodeMessage";

export const ChatMessage = ({ mes }: { mes: string }) => {
    const decoded = decodeMessage(mes);
    const [isImage, setIsImage] = useState(false);
    const [isVideo, setIsVideo] = useState(false);

    useEffect(() => {
        const isCloudinaryVideo = decoded.includes("/video/upload/");
        const hasVideoExtension = /\.(mp4|webm|ogg|mov)$/i.test(decoded);

        if (isCloudinaryVideo || hasVideoExtension) {
            setIsVideo(true);
            setIsImage(false);
        } else {
            setIsVideo(false);
            isImageUrl(decoded).then(setIsImage);
        }
    }, [decoded]);

    if (isVideo) {
        return (
            <video
                src={decoded}
                controls
                preload="metadata"
                style={{ maxWidth: "300px", borderRadius: "8px", display: "block" }}
            >
                Trình duyệt không hỗ trợ thẻ video.
            </video>
        );
    }

    return isImage ? (
        <img src={decoded} className="chat-image" alt="content" />
    ) : (
        <span>{decoded}</span>
    );
};