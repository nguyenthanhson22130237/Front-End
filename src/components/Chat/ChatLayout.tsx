// ChatLayout.tsx
import { useEffect } from "react";
import { useAppSelector } from "../../redux/hooks";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { ChatWindow } from "./ChatWindow";
import { wsService } from "../../services/websocket"; // Import service
import { LogOut } from "lucide-react"; // Import icon Đăng xuất
import "./style.css";

export const ChatLayout = () => {
    const auth = useAppSelector((state) => state.auth.user);
    const navigate = useNavigate();

    useEffect(() => {
        if (!auth?.authenticated) {
            navigate("/login", { replace: true });
        }
    }, [auth?.authenticated, navigate]);

    const handleLogout = () => {
        wsService.logout();

    };

    return (
        <div className="main-container">
            <div className="top-header">
                <h2 className="app-title">Messaging</h2>

                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Đăng xuất</span>
                </button>
            </div>

            <div className="chat-layout">
                <Sidebar />
                <ChatWindow />
            </div>
        </div>
    );
};