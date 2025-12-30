import { useState, useEffect } from "react";
import { wsService } from "../../services/websocket";
import { useAppSelector } from "../../redux/hooks";
import { ChatHistoryItem } from "../../features/chat/chatTypes"
// @ts-ignore
import styles from "./ChatInput.module.css";

export const ChatInput = () => {
    const [message, setMessage] = useState("");
    const [to, setTo] = useState("");
    const currentChat = useAppSelector(
        state => state.chat.currentChat);

    const send = () => {
        // @ts-ignore
        const type = currentChat.type === 1 ? "room" : "people";
        // @ts-ignore
        const to = currentChat.name;

        wsService.sendChat(type, to, message);
        setMessage("");
    };

    return (
        <div className={styles.wrapper}>
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
