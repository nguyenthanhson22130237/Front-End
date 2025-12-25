// ChatLayout.tsx
import {useState, useEffect} from "react";
import { useAppSelector } from "../../redux/hooks";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { ChatWindow } from "./ChatWindow";
import "./style.css";

export const ChatLayout = () => {
    const auth = useAppSelector((state) => state.auth.user);
    const navigate = useNavigate();
    useEffect(() => {
        if (!auth?.authenticated) {
            navigate("/login", { replace: true });
        }
    }, [auth?.authenticated]);

    return (
        <div className="chat-layout">
            <Sidebar />
            <ChatWindow />
        </div>
    );
};
