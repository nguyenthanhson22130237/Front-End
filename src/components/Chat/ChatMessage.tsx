import { useEffect, useState } from "react";
import { isImageUrl } from "../../utils/isImageUrl";
import { decodeMessage } from "../../utils/decodeMessage";

export const ChatMessage = ({ mes }: { mes: string }) => {
    const decoded = decodeMessage(mes);
    const [isImage, setIsImage] = useState(false);

    useEffect(() => {
        isImageUrl(decoded).then(setIsImage);
    }, [decoded]);

    return isImage ? (
        <img src={decoded} className="chat-image" />
    ) : (
        <span>{decoded}</span>
    );
};
