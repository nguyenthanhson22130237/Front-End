import { useEffect, useState, useRef } from "react";
import { Outlet } from "react-router-dom";
import { wsService } from "./services/websocket";
import { IncomingCall } from "./components/IncomingCall";

const App = () => {
    const [incomingCall, setIncomingCall] = useState<{name: string, url: string, id: string} | null>(null);
    const currentUser = localStorage.getItem("USERNAME");

    // useRef giúp lưu danh sách ID đã xử lý mà không gây render lại
    const processedIdsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        // Kết nối WS khi App chạy
        wsService.connect();
    }, []);

    useEffect(() => {
        const handleNewMessage = (event: any) => {
            // 1. Lấy gói tin gốc từ websocket.ts gửi sang
            const payload = event.detail;
            if (!payload) return;

            // 2. CHỈ XỬ LÝ SỰ KIỆN GỬI TIN NHẮN (SEND_CHAT)
            // Cấu trúc server trả về: { event: "SEND_CHAT", data: { ...tin nhắn... } }
            if (payload.event !== 'SEND_CHAT' || !payload.data) {
                return;
            }

            const msg = payload.data; // Đây mới là tin nhắn thật

            // 3. TẠO ID DUY NHẤT CHO TIN NHẮN
            const msgId = msg._id || msg.id || (msg.sender + "_" + (msg.createdAt || Date.now()));

            // 4. KIỂM TRA ĐÃ XỬ LÝ CHƯA (Chống lặp)
            // Check 1: Đã xử lý trong phiên chạy hiện tại (RAM)
            if (processedIdsRef.current.has(msgId)) return;
            // Check 2: Đã xử lý trước khi F5 (SessionStorage)
            if (sessionStorage.getItem(`call_processed_${msgId}`)) return;

            // 5. KIỂM TRA THỜI GIAN (Chống cuộc gọi ma quá khứ)
            const msgTimeStr = msg.createdAt || msg.timestamp || msg.created_at;
            if (msgTimeStr) {
                const msgTime = new Date(msgTimeStr).getTime();
                const now = Date.now();
                // Nếu tin nhắn cũ quá 60 giây -> BỎ QUA NGAY
                if (now - msgTime > 60000) return;
            }

            // 6. GIẢI MÃ VÀ KIỂM TRA LINK GỌI
            const rawContent = msg.content || msg.mes || msg.message || "";
            const senderName = msg.sender || msg.name || msg.username || "";

            if (!rawContent) return;

            try {
                const decodedContent = decodeURIComponent(escape(atob(rawContent)));

                // Logic: Có link gọi VÀ người gửi không phải là mình
                if (decodedContent.includes("/call/call_") && senderName !== currentUser) {

                    const urlRegex = /(http[s]?:\/\/[^\s]+)/g;
                    const match = decodedContent.match(urlRegex);

                    if (match) {
                        console.log("🔔 CÓ CUỘC GỌI MỚI:", senderName);

                        // Đánh dấu ngay là đã xử lý
                        processedIdsRef.current.add(msgId);
                        sessionStorage.setItem(`call_processed_${msgId}`, "true");

                        // Hiện Popup
                        setIncomingCall({
                            id: msgId,
                            name: senderName,
                            url: match[0]
                        });
                    }
                }
            } catch (e) {
                // Bỏ qua lỗi giải mã
            }
        };

        // Lắng nghe sự kiện từ websocket.ts
        window.addEventListener("GLOBAL_MSG", handleNewMessage);

        // Dọn dẹp khi component unmount
        return () => window.removeEventListener("GLOBAL_MSG", handleNewMessage);
    }, [currentUser]);

    const handleReject = () => {
        setIncomingCall(null);
    };

    return (
        <>
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