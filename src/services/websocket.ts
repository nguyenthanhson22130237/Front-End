// @ts-ignore
import { store } from "../redux/store";
// @ts-ignore
import { setUser } from "../features/auth/authSlice";

class WebSocketService {
    private socket: WebSocket | null = null;
    private reconnectTimer: any = null;
    private onRegisterSuccess?: (msg: string) => void;
    private onRegisterError?: (err: string) => void;

    private isLoggedIn = false;
    private isManualLogin = false;
    private tempRegPassword = "";

    private waitForOpen(socket: WebSocket, callback: () => void) {
        if (socket.readyState === WebSocket.OPEN) {
            callback();
            return;
        }
        const check = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
                callback();
                clearInterval(check);
            } else if (socket.readyState === WebSocket.CLOSED) {
                clearInterval(check);
            }
        }, 50);
    }

    connect() {
        if (this.socket) return;

        this.socket = new WebSocket("wss://chat.longapp.site/chat/chat");

        this.socket.onopen = () => {
            console.log("[WS] Connected");

            if (this.isManualLogin) return;

            // Auto Re-login logic
            const code = localStorage.getItem("RE_LOGIN_CODE");
            const user = localStorage.getItem("USERNAME");

            if (code && user && !this.isLoggedIn) {
                this.reLogin(code);
            }
        };

        this.socket.onmessage = (event) => {
            let res;
            try {
                res = JSON.parse(event.data);
            } catch (e) {
                return;
            }

            // Handle Register
            if (res.event === "REGISTER") {
                if (res.status === "success") {
                    const username = localStorage.getItem("USERNAME");
                    if (username && this.tempRegPassword) {
                        this.login(username, this.tempRegPassword);
                        this.tempRegPassword = "";
                    } else {
                        alert("Đăng ký thành công! Vui lòng đăng nhập.");
                    }
                    if (this.onRegisterSuccess) this.onRegisterSuccess(res.mes);
                } else {
                    alert(res.mes || "Đăng ký thất bại");
                    this.isManualLogin = false;
                    if (this.onRegisterError) this.onRegisterError(res.mes);
                }
                return;
            }

            // Handle Login
            if (res.event === "LOGIN" && res.status === "success") {
                localStorage.setItem("RE_LOGIN_CODE", res.data.RE_LOGIN_CODE);
                this.isLoggedIn = true;
                this.isManualLogin = false;

                store.dispatch(setUser({
                    username: localStorage.getItem("USERNAME") || "Unknown",
                    authenticated: true
                }));
                return;
            }

            // Handle Re-Login
            if (res.event === "RE_LOGIN" && res.status === "success") {
                this.isLoggedIn = true;
                store.dispatch(setUser({
                    username: localStorage.getItem("USERNAME") || "Unknown",
                    authenticated: true
                }));
                return;
            }

            // Error Handling
            if (res.status === "error") {
                console.warn("[WS] Error:", res.mes);
                if (res.mes === "You are already logged in") {
                    alert("Tài khoản đang được đăng nhập ở nơi khác.");
                } else {
                    alert(res.mes);
                }
            }
        };

        this.socket.onerror = (err) => {
            console.error("[WS] Error", err);
        };

        this.socket.onclose = () => {
            console.log("[WS] Disconnected");
            this.socket = null;
            this.isLoggedIn = false;

            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = setTimeout(() => {
                this.connect();
            }, 1000);
        };
    }

    login(username: string, password: string) {
        if (this.isLoggedIn) return;

        this.isManualLogin = true;
        this.isLoggedIn = false;

        localStorage.setItem("USERNAME", username);
        localStorage.removeItem("RE_LOGIN_CODE");

        this.connect();

        const payload = JSON.stringify({
            action: "onchat",
            data: {
                event: "LOGIN",
                data: { user: username, pass: password }
            }
        });

        if (this.socket) {
            this.waitForOpen(this.socket, () => {
                this.socket?.send(payload);
            });
        }
    }

    reLogin(code: string) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;

        const username = localStorage.getItem("USERNAME");
        if (!username || !code) return;

        const payload = JSON.stringify({
            action: "onchat",
            data: {
                event: "RE_LOGIN",
                data: { user: username, code: code }
            }
        });

        this.socket.send(payload);
    }

    register(username: string, password: string, onSuccess?: (msg: string) => void, onError?: (err: string) => void) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            // Force connect if not open, but better to handle UI state
            this.connect();
        }

        this.onRegisterSuccess = onSuccess;
        this.onRegisterError = onError;

        // Save for auto-login
        this.tempRegPassword = password;
        localStorage.setItem("USERNAME", username);

        const payload = {
            action: "onchat",
            data: {
                event: "REGISTER",
                data: { user: username, pass: password }
            }
        };

        if (this.socket) {
            this.waitForOpen(this.socket, () => {
                this.socket?.send(JSON.stringify(payload));
            });
        }
    }

    sendChat(type: "people" | "group", to: string, mes: string) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;

        const payload = {
            action: "onchat",
            data: {
                event: "SEND_CHAT",
                data: { type, to, mes }
            }
        };

        this.socket.send(JSON.stringify(payload));
    }
}

export const wsService = new WebSocketService();
// @ts-ignore
window.chatDebug = wsService;