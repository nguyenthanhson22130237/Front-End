// @ts-ignore
import { store } from "../redux/store";
// @ts-ignore
import { setUser } from "../features/auth/authSlice";

class WebSocketService {
    private socket: WebSocket | null = null;
    private reconnectTimer: any = null;
    private isManualLogin = false;

    connect() {
        if (this.socket) return;

        this.socket = new WebSocket("wss://chat.longapp.site/chat/chat");
        this.socket.onopen = () => {
            console.log("WebSocket connected.");

            const reloginCode = localStorage.getItem("RE_LOGIN_CODE");
            if (reloginCode && !this.isManualLogin) {
                this.reLogin(reloginCode);
            }

            this.isManualLogin = false;
        };


        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("WS RECV:", data);

            // REGISTER OK
            if (data.event === "REGISTER" && data.status === "success") {
                store.dispatch(
                    setUser({
                        username: data.data?.user || "",
                        authenticated: true
                    })
                );
                console.log("Đăng ký thành công");
            }

            // LOGIN OK
            if (data.event === "LOGIN" && data.status === "success") {
                localStorage.setItem("RE_LOGIN_CODE", data.data.RE_LOGIN_CODE);

                store.dispatch(
                    setUser({
                        username: data.data?.user || "",
                        authenticated: true
                    })
                );

                console.log("Login thành công");
            }

            // RE_LOGIN OK
            if (data.event === "RE_LOGIN" && data.status === "success") {
                store.dispatch(
                    setUser({
                        username: data.data?.user || "",
                        authenticated: true
                    })
                );

                console.log("Re-login thành công");
            }
        };

        this.socket.onerror = (err) => {
            console.error("WebSocket error:", err);
        };

        this.socket.onclose = () => {
            console.log("WebSocket disconnected.");
            this.socket = null;
            this.reconnectTimer = setTimeout(() => {
                this.connect();
            }, 1000);

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
    login(username: string, password: string) {
        this.isManualLogin = true;

        localStorage.removeItem("RE_LOGIN_CODE");

        this.connect();

        const payload = {
            action: "onchat",
            data: {
                event: "LOGIN",
                data: {
                    user: username,
                    pass: password
                }
            }
        };

        const waitForOpen = setInterval(() => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify(payload));
                clearInterval(waitForOpen);
            }
        }, 50);
    }


    reLogin(code: string) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;

        const payload = {
            action: "onchat",
            data: {
                event: "RE_LOGIN",
                data: {
                    RE_LOGIN_CODE: code
                }
            }
        };

        this.socket.send(JSON.stringify(payload));
    }

}

export const wsService = new WebSocketService();
