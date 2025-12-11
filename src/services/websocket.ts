// @ts-ignore
import { store } from "../redux/store";
// @ts-ignore
import { setUser } from "../features/auth/authSlice";

class WebSocketService {
    private socket: WebSocket | null = null;

    connect() {
        this.socket = new WebSocket("wss://chat.longapp.site/chat/chat");

        this.socket.onopen = () => {
            console.log("WebSocket connected.");
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("WS RECV:", data);

            // Xử lý message nhận về
            if (data.event === "REGISTER") {
                if (data.status === "success") {
                    store.dispatch(
                        setUser({
                            username: "long",
                            authenticated: true
                        })
                    );
                    console.log("Đăng ký thành công:", data.data);
                }
            }
        };

        this.socket.onerror = (err) => {
            console.error("WebSocket error:", err);
        };

        this.socket.onclose = () => {
            console.log("WebSocket disconnected.");
        };
    }

    register(username: string, password: string) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.error("WebSocket not ready.");
            return;
        }

        const payload = {
            action: "onchat",
            data: {
                event: "REGISTER",
                data: {
                    user: username,
                    pass: password
                }
            }
        };

        this.socket.send(JSON.stringify(payload));
    }
}

export const wsService = new WebSocketService();
