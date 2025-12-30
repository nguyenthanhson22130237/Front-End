import { useEffect, useState } from "react";
import { isImageUrl } from "../../utils/isImageUrl";

export const ChatMessage = ({ mes }: { mes: string }) => {
    const [isImage, setIsImage] = useState(false);

    useEffect(() => {
        isImageUrl(mes).then(setIsImage);
    }, [mes]);

    return isImage ? (
        <img src={mes} className="chat-image" />
    ) : (
        <span>{mes}</span>
    );
};
