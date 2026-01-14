import { useEffect, useState, useRef } from "react";
import { Outlet } from "react-router-dom";
import { wsService } from "./services/websocket";
import { IncomingCall } from "./components/IncomingCall";
import { WebSocketLoader } from "./components/WebSocketLoader";

const App = () => {
    const [incomingCall, setIncomingCall] = useState<{
        name: string;
        url: string;
        id: string;
    } | null>(null);

    const currentUser = localStorage.getItem("USERNAME");

    // Lưu các message ID đã xử lý (chống popup lặp)
    const processedIdsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        wsService.connect();
    }, []);

    useEffect(() => {
        const handleNewMessage = (event: any) => {
            const payload = event.detail;
            if (!payload) return;

            if (payload.event !== "SEND_CHAT" || !payload.data) return;

            const msg = payload.data;

            const msgId =
                msg._id ||
                msg.id ||
                `${msg.sender}_${msg.createdAt || Date.now()}`;

            // Chống xử lý trùng
            if (processedIdsRef.current.has(msgId)) return;
            if (sessionStorage.getItem(`call_processed_${msgId}`)) return;

            // Chống cuộc gọi cũ
            const msgTimeStr =
                msg.createdAt || msg.timestamp || msg.created_at;
            if (msgTimeStr) {
                const msgTime = new Date(msgTimeStr).getTime();
                if (Date.now() - msgTime > 60000) return;
            }

            const rawContent = msg.content || msg.mes || msg.message || "";
            const senderName =
                msg.sender || msg.name || msg.username || "";

            if (!rawContent) return;

            try {
                const decodedContent = decodeURIComponent(
                    escape(atob(rawContent))
                );

                if (
                    decodedContent.includes("/call/call_") &&
                    senderName !== currentUser
                ) {
                    const urlRegex = /(http[s]?:\/\/[^\s]+)/g;
                    const match = decodedContent.match(urlRegex);

                    if (match) {
                        console.log("CÓ CUỘC GỌI MỚI:", senderName);

                        processedIdsRef.current.add(msgId);
                        sessionStorage.setItem(
                            `call_processed_${msgId}`,
                            "true"
                        );

                        setIncomingCall({
                            id: msgId,
                            name: senderName,
                            url: match[0],
                        });
                    }
                }
            } catch {

            }
        };

        window.addEventListener("GLOBAL_MSG", handleNewMessage);
        return () =>
            window.removeEventListener("GLOBAL_MSG", handleNewMessage);
    }, [currentUser]);

    const handleReject = () => {
        setIncomingCall(null);
    };

    return (
        <>
            <WebSocketLoader />
            {incomingCall && (
                <IncomingCall
                    callerName={incomingCall.name}
                    callUrl={incomingCall.url}
                    onReject={handleReject}
                />
            )}

            <Outlet />
        </>
    );
};

export default App;
