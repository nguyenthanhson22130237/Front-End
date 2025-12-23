// ChatLayout.tsx
import { Sidebar } from "./Sidebar";
import { ChatWindow } from "./ChatWindow";
import "./style.css";

export const ChatLayout = () => {
    return (
        <div className="chat-layout">
            <Sidebar />
            <ChatWindow />
        </div>
    );
};
