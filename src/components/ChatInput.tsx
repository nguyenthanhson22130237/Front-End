// src/components/Chat/ChatInput.tsx
import { useState, useRef } from "react";
import { wsService } from "../services/websocket";
import { uploadToCloudinary } from "../services/uploadService";
// @ts-ignore
import styles from "./ChatInput.module.css";
import { Send, Image as ImageIcon, Film } from "lucide-react";

export const ChatInput = () => {
    const [message, setMessage] = useState("");
    const [to, setTo] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const send = (content: string = message) => {
        if (!to || !content) return;
        wsService.sendChat("people", to, content);
        if (content === message) setMessage("");
    };

    const handleFileSelect = async (e: any) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            if (file.size > 10 * 1024 * 1024) {
                alert("File quá lớn! Vui lòng chọn file dưới 10MB.");
                return;
            }

            setIsUploading(true);
            const url = await uploadToCloudinary(file);
            setIsUploading(false);

            if (url) {
                send(url);
            } else {
                alert("Lỗi upload file.");
            }
        }
    };

    return (
        <div className={styles.wrapper}>
            <input
                className={styles.to}
                placeholder="Gửi tới (username)..."
                value={to}
                onChange={(e) => setTo(e.target.value)}
            />


            <div style={{display: 'flex', alignItems: 'center', width: '100%', gap: 8}}>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    style={{background: 'none', border: 'none', cursor: 'pointer'}}
                    title="Gửi ảnh hoặc video"
                >
                    <Film color="#007a8c" size={24} />
                </button>

                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                />

                <input
                    className={styles.input}
                    placeholder={isUploading ? "Đang tải file lên..." : "Nhập tin nhắn..."}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    disabled={isUploading}
                />

                <button className={styles.button} onClick={() => send()}>
                    {isUploading ? "..." : <Send size={18} />}
                </button>
            </div>
        </div>
    );
};