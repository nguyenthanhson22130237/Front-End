import { useEffect, useState, useRef } from "react";
import { Outlet } from "react-router-dom";
import { wsService } from "./services/websocket";
import { IncomingCall } from "./components/IncomingCall";
import { WebSocketLoader } from "./components/WebSocketLoader";

const App = () => {
    const [incomingCall, setIncomingCall] = useState<{
        id: string;
        name: string;
        url: string;
    } | null>(null);

    const currentUser = localStorage.getItem("USERNAME");

    const hasConnectedRef = useRef(false);

    const processedIdsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (hasConnectedRef.current) return;
        hasConnectedRef.current = true;

        wsService.connect();

    }, []);

    useEffect(() => {
        const handleNewMessage = (event: any) => {
            if (incomingCall) return;

            const payload = event.detail;
            if (!payload || payload.event !== "SEND_CHAT") return;

            const msg = payload.data;
            if (!msg) return;

            const msgId =
                msg._id ||
                msg.id ||
                `${msg.sender}_${msg.createdAt || Date.now()}`;

            if (processedIdsRef.current.has(msgId)) return;
            if (sessionStorage.getItem(`call_processed_${msgId}`)) return;

            const msgTimeStr =
                msg.createdAt || msg.timestamp || msg.created_at;
            if (msgTimeStr) {
                const msgTime = new Date(msgTimeStr).getTime();
                if (Date.now() - msgTime > 60000) return;
            }

            const rawContent = msg.content || msg.mes || msg.message;
            const senderName =
                msg.sender || msg.name || msg.username;

            if (!rawContent || senderName === currentUser) return;

            let decodedContent = "";
            try {
                decodedContent = atob(rawContent);
            } catch {
                return;
            }

            if (!decodedContent.includes("/call/call_")) return;

            const urlMatch = decodedContent.match(/https?:\/\/[^\s]+/);
            if (!urlMatch) return;

            console.log("INCOMING CALL:", senderName);

            processedIdsRef.current.add(msgId);
            sessionStorage.setItem(`call_processed_${msgId}`, "true");

            setIncomingCall({
                id: msgId,
                name: senderName,
                url: urlMatch[0],
            });
        };

        window.addEventListener("GLOBAL_MSG", handleNewMessage);
        return () =>
            window.removeEventListener("GLOBAL_MSG", handleNewMessage);
    }, [currentUser, incomingCall]);

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
