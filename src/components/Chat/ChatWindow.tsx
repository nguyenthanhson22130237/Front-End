import {useEffect, useRef} from "react";
import {useNavigate} from "react-router-dom";
import {Video, Phone} from "lucide-react";

import {ChatInput} from "./ChatInput";
import {useAppSelector} from "../../redux/hooks";
import {RootState} from "../../redux/store";
import {ChatMessage} from "./ChatMessage";
import {isImageUrl, isVideoUrl} from "../../services/uploadService";
import {wsService} from "../../services/websocket";

import "./ChatWindow.css";

export const ChatWindow = () => {
    const navigate = useNavigate();

    const {currentChat, messages} = useAppSelector(
        (state: RootState) => state.chat
    );

    const username = useAppSelector(
        (state: RootState) => state.auth.user?.username
    );

    const handleCall = (isVideoCall: boolean) => {
        if (!currentChat) return;

        const roomId = `call_${Date.now()}`;
        const mode = isVideoCall ? "video" : "voice";
        const callUrl = `${window.location.origin}/call/${roomId}?mode=${mode}`;

        const msgContent = isVideoCall
            ? `Đang gọi Video...\nBấm vào link để nghe: ${callUrl}`
            : `Đang gọi Thoại...\nBấm vào link để nghe: ${callUrl}`;

        // @ts-ignore
        const type = currentChat.type === 1 ? "room" : "people";
        // @ts-ignore
        const to = currentChat.name;

        const encoded = btoa(unescape(encodeURIComponent(msgContent)));
        wsService.sendChat(type, to, encoded);

        navigate(`/call/${roomId}?mode=${mode}`);
    };

    const decodeMes = (mes: string) => {
        try {
            return decodeURIComponent(escape(atob(mes)));
        } catch {
            return mes;
        }
    };

    const isSticker = (mes: string) => {
        return mes.startsWith("sticker::");
    };

    const getStickerUrl = (mes: string) => {
        return mes.replace("sticker::", "");
    };

    const formatChatTime = (dateStr: string) => {
        const date = new Date(dateStr.replace(" ", "T"));
        const now = new Date();

        const isToday =
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();

        const time = date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });

        if (isToday) return time;

        const day = date.toLocaleDateString("en-GB");
        return `${time} ${day}`;
    };

    const chatBodyRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        const el = chatBodyRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (!currentChat) {
        return (
            <div className="chat-window empty">
                <div className="chat-placeholder">
                    Chọn đoạn chat để bắt đầu
                </div>
            </div>
        );
    }

    return (
        <div className="chat-window">
            <div className="chat-header">
                <div className="chat-title">
                    {currentChat.type === 1 ? "Phòng: " : "User: "}
                    {currentChat.name}
                </div>

                <div className="call-actions">
                    <button
                        className="call-btn voice"
                        onClick={() => handleCall(false)}
                        title="Gọi thoại"
                    >
                        <Phone size={18}/>
                    </button>

                    <button
                        className="call-btn video"
                        onClick={() => handleCall(true)}
                        title="Gọi video"
                    >
                        <Video size={18}/>
                    </button>
                </div>
            </div>

            <div className="chat-body" ref={chatBodyRef}>
                {(messages || []).map((m, i) => {
                    const isMe = m.name === username;
                    const decodedMes = decodeMes(m.mes);

                    return (
                        <div
                            key={i}
                            className={`message ${isMe ? "me" : ""}`}
                        >
                            <div className="bubble-wrapper">
                                {!isMe && (
                                    <div className="sender-name">
                                        {m.name}
                                    </div>
                                )}

                                <div className="bubble">
                                    {isSticker(decodedMes) ? (
                                        <img
                                            src={getStickerUrl(decodedMes)}
                                            alt="sticker"
                                            style={{width: 70}}
                                            onLoad={() => scrollToBottom()}
                                        />
                                    ) : isImageUrl(m.mes) ? (
                                        <img
                                            src={m.mes}
                                            alt="sent"
                                            className="chat-image"
                                            onClick={() => window.open(m.mes, "_blank")}
                                        />
                                    ) : isVideoUrl(m.mes) ? (
                                        <video
                                            src={m.mes}
                                            controls
                                            className="chat-video"
                                        />
                                    ) : (
                                        <ChatMessage mes={m.mes}/>
                                    )}
                                </div>

                                <div className="time">
                                    {formatChatTime(m.createAt!)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <ChatInput/>
        </div>
    );
};
