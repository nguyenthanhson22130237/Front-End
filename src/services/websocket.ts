import { store } from "../redux/store";
import { setUser } from "../features/auth/authSlice";
import { addHistory, setMessages, setCurrentChat, setHistory} from "../features/chat/chatSlice";

class WebSocketService {
    private socket: WebSocket | null = null;
    private reconnectTimer: any = null;

    private onRegisterSuccess?: (msg: string) => void;
    private onRegisterError?: (err: string) => void;

    private isLoggedIn = false;
    private isManualLogin = false;
    private tempRegPassword = "";

    private checkUserCallback?: (exists: boolean) => void;

    private waitForOpen(socket: WebSocket, callback: () => void) {
        if (socket.readyState === WebSocket.OPEN) {
            callback();
            return;
        }

        const check = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
                clearInterval(check);
                callback();
            }
            if (socket.readyState === WebSocket.CLOSED) {
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

            const code = localStorage.getItem("RE_LOGIN_CODE");
            const user = localStorage.getItem("USERNAME");

            if (code && user && !this.isLoggedIn) {
                this.reLogin(code);
            }
        };

        this.socket.onmessage = (event) => {
            let res= JSON.parse(event.data);
            console.log("WS:", res);

            if (res.event === "REGISTER") {
                if (res.status === "success") {
                    const username = localStorage.getItem("USERNAME");

                    if (username && this.tempRegPassword) {
                        this.login(username, this.tempRegPassword);
                        this.tempRegPassword = "";
                    }

                    this.onRegisterSuccess?.("Đăng ký thành công");
                } else {
                    this.isManualLogin = false;
                    this.onRegisterError?.(res.mes);
                }
                return;
            }

            if (res.event === "LOGIN") {
                if (res.status === "success") {
                    localStorage.setItem("RE_LOGIN_CODE", res.data.RE_LOGIN_CODE);
                    this.isLoggedIn = true;
                    this.isManualLogin = false;

                    store.dispatch(setUser({
                        username: localStorage.getItem("USERNAME") || "",
                        authenticated: true
                    }));
                    this.getUserList();
                } else {
                    alert(res.mes || "Đăng nhập thất bại");
                }
                return;
            }

            if (res.event === "RE_LOGIN") {
                if (res.status === "success") {
                    this.isLoggedIn = true;

                    store.dispatch(setUser({
                        username: localStorage.getItem("USERNAME") || "",
                        authenticated: true
                    }));
                    this.getUserList();
                } else {
                    alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                    this.logout();
                }
                return;
            }

            if ((res.event === "CREATE_ROOM" || res.event === "JOIN_ROOM") && res.status === "success") {
                const roomName = res.data.name;
                if (roomName) {
                    store.dispatch(addHistory({ name: roomName, type: 1 }));
                    store.dispatch(setCurrentChat({ name: roomName, type: 1 }));
                }
            }

            if (res.event === "CHECK_USER_EXIST") {
                const exists = res.status === "success" && res.data.status;
                this.checkUserCallback?.(exists);
                this.checkUserCallback = undefined;
            }

            if (
                (res.event === "GET_PEOPLE_CHAT_MES" ||
                    res.event === "GET_ROOM_CHAT_MES") &&
                res.status === "success"
            ) {
                store.dispatch(setMessages(res.data || []));
            }

            if (res.event === "GET_USER_LIST" && res.status === "success") {
                store.dispatch(setHistory(res.data));
            }

            if (res.status === "error") {
                console.warn("[WS] Error:", res.mes);
                alert(res.mes || "Có lỗi xảy ra");
                return;
            }
        };

        this.socket.onerror = (err) => {
            console.error("[WS] Error", err);
        };

        this.socket.onclose = () => {
            console.log("[WS] Disconnected");

            this.socket = null;
            this.isLoggedIn = false;

            const code = localStorage.getItem("RE_LOGIN_CODE");
            if (!code) return;

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

        const payload = {
            action: "onchat",
            data: {
                event: "LOGIN",
                data: { user: username, pass: password }
            }
        };

        if (this.socket) {
            this.waitForOpen(this.socket, () => {
                this.socket?.send(JSON.stringify(payload));
            });
        }
    }

    reLogin(code: string) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;

        const username = localStorage.getItem("USERNAME");
        if (!username || !code) return;

        this.socket.send(JSON.stringify({
            action: "onchat",
            data: {
                event: "RE_LOGIN",
                data: { user: username, code }
            }
        }));
    }

    register(
        username: string,
        password: string,
        onSuccess?: (msg: string) => void,
        onError?: (err: string) => void
    ) {
        this.onRegisterSuccess = onSuccess;
        this.onRegisterError = onError;

        this.tempRegPassword = password;
        localStorage.setItem("USERNAME", username);

        this.connect();

        if (this.socket) {
            this.waitForOpen(this.socket, () => {
                this.socket?.send(JSON.stringify({
                    action: "onchat",
                    data: {
                        event: "REGISTER",
                        data: { user: username, pass: password }
                    }
                }));
            });
        }
    }

    sendChat(type: "people" | "room", to: string, mes: string) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;

        this.socket.send(JSON.stringify({
            action: "onchat",
            data: {
                event: "SEND_CHAT",
                data: { type, to, mes }
            }
        }));
    }

    getUserList() {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;

        this.socket.send(JSON.stringify({
            action: "onchat",
            data: { event: "GET_USER_LIST" }
        }));
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

    getRoomChatMess(name: string, page: number){
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
        this.socket.send(JSON.stringify({
            action: "onchat",
            data: {
                event: "GET_ROOM_CHAT_MES",
                data: { name, page }
            }
        }))
    }

    getPeopleChatMess(name: string, page: number) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
        this.socket.send(JSON.stringify({
            action: "onchat",
            data: {
                event: "GET_PEOPLE_CHAT_MES",
                data: { name, page }
            }
        }))
    }

    checkUserExist(name: string, callback: (exists: boolean) => void) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;

        this.checkUserCallback = callback;
        this.socket?.send(JSON.stringify({
            action: "onchat",
            data: { event: "CHECK_USER_EXIST", data: { user: name } }
        }));
    }

    logout() {
        this.isLoggedIn = false;
        this.isManualLogin = false;

        localStorage.removeItem("RE_LOGIN_CODE");
        localStorage.removeItem("USERNAME");

        store.dispatch(setUser({
            username: "",
            authenticated: false
        }));

        if (this.socket) {
            this.socket = null;
        }

        console.log("[WS] Logged out");
    }
}

export const wsService = new WebSocketService();