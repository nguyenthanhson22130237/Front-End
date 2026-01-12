import {useEffect, useState, useRef} from "react";
import {ChatInput} from "./ChatInput";
import {useAppSelector} from "../../redux/hooks";
import {RootState} from "../../redux/store";
import {ChatMessage} from "./ChatMessage";
import {isImageUrl, isVideoUrl} from "../../services/uploadService";

export const ChatWindow = () => {

    const {currentChat, messages} = useAppSelector(
        (state: RootState) => state.chat
    );

    const username = useAppSelector(
        (state: RootState) => state.auth.user?.username
    );

    const formatChatTime = (dateStr: string) => {
        // Chuẩn hóa ISO
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

        if (isToday) {
            return time;
        }

        const day = date.toLocaleDateString("en-GB"); // DD/MM/YYYY
        return `${time} ${day}`;
    };

    const chatBodyRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const el = chatBodyRef.current;
        if (!el) return;

        el.scrollTop = el.scrollHeight;
    }, [messages]);

    if (!currentChat) {
        return <div className="chat-window">
            <div style={{padding: 20}}>Chọn đoạn chat để bắt đầu</div>
        </div>;
    }

    return (
        <div className="chat-window">
            <div className="chat-header">
                <div className="chat-title">
                    {currentChat.type === 1 ? "Phòng: " : "User: "} {currentChat.name}
                </div>
            </div>

            <div className="chat-body" ref={chatBodyRef}>
                {(messages || []).map((m, i) => {
                    const isMe = m.name === username;

                    return (
                        <div
                            key={i}
                            className={`message ${m.name === username ? "me" : ""}`}
                        >

                            <div className="bubble-wrapper">
                                {!isMe && (
                                    <div className="sender-name">
                                        {m.name}
                                    </div>
                                )}
                                <div className="bubble">
                                    {isImageUrl(m.mes) ? (
                                        <img
                                            src={m.mes}
                                            alt="sent image"
                                            style={{maxWidth: "200px", borderRadius: "10px", cursor: "pointer"}}
                                            onClick={() => window.open(m.mes, "_blank")}
                                        />
                                    ) : isVideoUrl(m.mes) ? (
                                        <video
                                            src={m.mes}
                                            controls
                                            style={{maxWidth: "300px", borderRadius: "10px"}}
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
