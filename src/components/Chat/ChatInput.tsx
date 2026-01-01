import { useState } from "react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { wsService } from "../../services/websocket";
import { useAppSelector } from "../../redux/hooks";
// @ts-ignore
import styles from "./ChatInput.module.css";

export const ChatInput = () => {
    const [message, setMessage] = useState("");
    const [showEmoji, setShowEmoji] = useState(false);

    const currentChat = useAppSelector(state => state.chat.currentChat);

    const send = () => {
        // @ts-ignore
        const type = currentChat.type === 1 ? "room" : "people";
        // @ts-ignore
        const to = currentChat.name;
        const encoded = btoa(unescape(encodeURIComponent(message)));

        wsService.sendChat(type, to, encoded);
        setMessage("");
    };

    const onEmojiClick = (emojiData: EmojiClickData) => {
        setMessage(prev => prev + emojiData.emoji);
    };

    return (
        <div className={styles.wrapper}>
            {/*Emoji button*/}
            <button
                type="button"
                className={styles.emojiBtn}
                onClick={() => setShowEmoji(prev => !prev)}
            >
                😊
            </button>

            {/* Emoji picker */}
            {showEmoji && (
                <div className={styles.emojiPicker}>
                    <EmojiPicker onEmojiClick={onEmojiClick} />
                </div>
            )}

            {/* Input */}
            <input
                className={styles.input}
                placeholder="Nhập tin nhắn..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
            />

            <button className={styles.button} onClick={send}>
                Gửi
            </button>
        </div>
    );
};
