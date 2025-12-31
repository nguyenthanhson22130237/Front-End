// src/components/Chat/ChatWindow.tsx
import { ChatInput } from "../ChatInput";
import { useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";
import { isImageUrl, isVideoUrl } from "../../services/uploadService";

export const ChatWindow = () => {

    const { currentChat, messages } = useAppSelector(
        (state: RootState) => state.chat
    );

    const username = useAppSelector(
        (state: RootState) => state.auth.user?.username
    );

    if (!currentChat) {
        return <div className="chat-window"><div style={{padding: 20}}>Chọn đoạn chat để bắt đầu</div></div>;
    }

    return (
        <div className="chat-window">
            <div className="chat-header">
                <div className="chat-title">
                    {currentChat.type === 1 ? "Phòng: " : "User: "} {currentChat.name}
                </div>
            </div>

            <div className="chat-body">
                {(messages || []).map((m, i) => (
                    <div
                        key={i}
                        className={`message ${m.name === username ? "me" : ""}`}
                    >

                        {isImageUrl(m.mes) ? (
                            <img
                                src={m.mes}
                                alt="sent image"
                                style={{ maxWidth: "200px", borderRadius: "10px", cursor: "pointer" }}
                                onClick={() => window.open(m.mes, "_blank")}
                            />
                        ) : isVideoUrl(m.mes) ? (
                            <video
                                src={m.mes}
                                controls
                                style={{ maxWidth: "300px", borderRadius: "10px" }}
                            />
                        ) : (
                            <span>{m.mes}</span>
                        )}
                    </div>
                ))}
            </div>
            <ChatInput />
        </div>
    );
};