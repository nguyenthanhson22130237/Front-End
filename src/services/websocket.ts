// @ts-ignore
import { store } from "../redux/store";
// @ts-ignore
import { setUser } from "../features/auth/authSlice";
import { setUsers, addRooms } from "../features/chat/chatSlice";

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
        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) return;

        this.socket = new WebSocket("wss://chat.longapp.site/chat/chat");

        this.socket.onopen = () => {
            console.log("[WS] Connected");

            if (this.isManualLogin) return;

            const code = localStorage.getItem("RE_LOGIN_CODE");
            const user = localStorage.getItem("USERNAME");

            if (code && user && !this.isLoggedIn) {
                console.log("[WS] Attempting auto-login...");
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

            if (res.status === "error") {
                console.warn("[WS] Error:", res.mes);

                if (res.event === "RE_LOGIN") {
                    alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                    this.logout();
                    return;
                }

                if (res.mes === "You are already logged in") {
                    alert("Tài khoản đang được đăng nhập ở nơi khác.");
                } else {
                    alert(res.mes);
                }
                return;
            }

            if (res.event === "REGISTER" && res.status === "success") {
                const username = localStorage.getItem("USERNAME");
                if (username && this.tempRegPassword) {
                    this.login(username, this.tempRegPassword);
                    this.tempRegPassword = "";
                } else {
                    alert("Đăng ký thành công! Vui lòng đăng nhập.");
                }
                if (this.onRegisterSuccess) this.onRegisterSuccess(res.mes);
                return;
            }

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

            if (res.event === "RE_LOGIN" && res.status === "success") {
                this.isLoggedIn = true;
                store.dispatch(setUser({
                    username: localStorage.getItem("USERNAME") || "Unknown",
                    authenticated: true
                }));
                return;
            }

            if (res.event === "GET_USER_LIST" && res.status === "success") {
                store.dispatch(setUsers(res.data));
                console.log("Lấy danh sách user thành công");
            }

            // ROOM
            if ((res.event === "CREATE_ROOM" || res.event === "JOIN_ROOM") && res.status === "success") {
                store.dispatch(addRooms(res.data.name));
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

    logout() {
        this.isLoggedIn = false;
        this.isManualLogin = false;

        localStorage.removeItem("RE_LOGIN_CODE");

        store.dispatch(setUser({
            username: "",
            authenticated: false
        }));

        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        console.log("[WS] Logged out.");
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
        if (!this.socket) {
            this.connect();
        }

        const username = localStorage.getItem("USERNAME");
        if (!username || !code) return;

        const payload = JSON.stringify({
            action: "onchat",
            data: {
                event: "RE_LOGIN",
                data: { user: username, code: code }
            }
        });

        if (this.socket) {
            this.waitForOpen(this.socket, () => {
                this.socket?.send(payload);
            });
        }
    }

    register(username: string,
             password: string,
             onSuccess?: (msg: string) => void,
             onError?: (err: string) => void) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.error("WebSocket not ready.");
            return;
        }

        this.onRegisterSuccess = onSuccess;
        this.onRegisterError = onError;
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
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.error("WebSocket not connected");
            return;
        }

        const payload = {
            action: "onchat",
            data: {
                event: "SEND_CHAT",
                data: {
                    type,
                    to,
                    mes
                }
            }
        };

        this.socket.send(JSON.stringify(payload));
    }


    getUserList(){
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;

        const payload = {
            action: "onchat",
            data: {
                event: "GET_USER_LIST"
            }
        };

        this.socket.send(JSON.stringify(payload));
    }


    createRoom(name: string) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;

        this.socket.send(JSON.stringify({
            action: "onchat",
            data: {
                event: "CREATE_ROOM",
                data: { name }
            }
        }));
    }

    joinRoom(name: string) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;

        this.socket.send(JSON.stringify({
            action: "onchat",
            data: {
                event: "JOIN_ROOM",
                data: { name }
            }
        }));
    }
}

export const wsService = new WebSocketService();
// @ts-ignore
window.chatDebug = wsService;