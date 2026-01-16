import { useState, useRef, useEffect } from "react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { Send, Image as ImageIcon, Film, Sticker } from "lucide-react";
import { wsService } from "../../services/websocket";
import { useAppSelector } from "../../redux/hooks";
import { uploadToCloudinary } from "../../services/uploadService";
import { getStickers } from "../../services/StickerService";
// @ts-ignore
import styles from "./ChatInput.module.css";

export const ChatInput = () => {
    const [message, setMessage] = useState("");
    const [showEmoji, setShowEmoji] = useState(false);
    const [showSticker, setShowSticker] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentChat = useAppSelector(state => state.chat.currentChat);

    const send = (content: string = message) => {

        const cleanContent = content ? content.trim() : "";

        if (!cleanContent) {
            return;
        }

        // @ts-ignore
        const type = currentChat.type === 1 ? "room" : "people";
        // @ts-ignore
        const to = currentChat.name;

        const encoded = btoa(unescape(encodeURIComponent(cleanContent)));

        wsService.sendChat(type, to, encoded);
        setMessage("");
        setShowEmoji(false);
    };

    const onEmojiClick = (emojiData: EmojiClickData) => {
        setMessage(prev => prev + emojiData.emoji);
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

    const [stickers, setStickers] = useState<any[]>([]);

    useEffect(() => {
        if (showSticker) {
            getStickers().then(setStickers);
        }
    }, [showSticker]);

    return (
        <div className={styles.wrapper}>
            <button
                type="button"
                className={styles.stickerBtn}
                onClick={() => {
                    setShowEmoji(false);
                    setShowSticker(prev => !prev);
                }}
            >
                <Sticker color="#007a8c" size={24}/>
            </button>
            {showSticker && (
                <div className={styles.stickerPicker}>
                    {stickers.map(sticker => (
                        <img
                            key={sticker.id}
                            src={sticker.images.fixed_height.url}
                            className={styles.stickerItem}
                            onClick={() => {
                                send(`sticker::${sticker.images.original.url}`);
                                setShowSticker(false);
                            }}
                        />
                    ))}
                </div>
            )}

            {/*Emoji button*/}
            <button
                type="button"
                className={styles.emojiBtn}
                onClick={() => {
                    setShowSticker(false);
                    setShowEmoji(prev => !prev)
                }}
            >
                😊
            </button>

            {/* Emoji picker */}
            {showEmoji && (
                <div className={styles.emojiPicker}>
                    <EmojiPicker onEmojiClick={onEmojiClick}/>
                </div>
            )}

            <div style={{display: 'flex', alignItems: 'center', width: '100%', gap: 8}}>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    style={{background: 'none', border: 'none', cursor: 'pointer'}}
                    title="Gửi ảnh hoặc video"
                >
                    <Film color="#007a8c" size={24}/>
                </button>

                <input
                    type="file"
                    ref={fileInputRef}
                    style={{display: "none"}}
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

                <button
                    className={styles.button}
                    onClick={() => send()}
                >
                    {isUploading ? "..." : <Send size={18}/>}
                </button>
            </div>
        </div>
    );
};