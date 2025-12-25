import { useState, useEffect } from "react";
import { wsService } from "../services/websocket";
// @ts-ignore
import styles from "./ChatInput.module.css";

export const ChatInput = () => {
    const [message, setMessage] = useState("");
    const [to, setTo] = useState("");

    const send = () => {
        if (!to || !message) return;

        wsService.sendChat("people", to, message);
        setMessage("");
    };

    return (
        <div className={styles.wrapper}>
            <input
                className={styles.to}
                placeholder="Gửi tới (username)"
                value={to}
                onChange={(e) => setTo(e.target.value)}
            />

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
