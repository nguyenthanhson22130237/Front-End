import { ChatInput } from "../ChatInput";
import { useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";

export const ChatWindow = () => {

    const { currentChat, messages } = useAppSelector(
        (state: RootState) => state.chat
    );

    const username = useAppSelector(
        (state: RootState) => state.auth.user?.username
    );

    return (
        <div className="chat-window">
            <div className="chat-header">
                <div className="chat-title">
                    {currentChat.name}
                </div>
            </div>

            <div className="chat-body">
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={`message ${m.from === username ? "me" : ""}`}
                    >
                        {m.mes}
                    </div>
                ))}
            </div>
            <ChatInput />
        </div>
    );
};
