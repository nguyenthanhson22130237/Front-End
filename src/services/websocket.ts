import {store} from "../redux/store";
import {setUser} from "../features/auth/authSlice";
import {Message} from "../features/chat/chatTypes"
import {addHistory, setMessages, setCurrentChat, setHistory, setUserOnline, appendMessage} from "../features/chat/chatSlice";
import { setConnected } from "../features/websocket/websocketSlice";

class WebSocketService {
    private socket: WebSocket | null = null;
    private reconnectTimer: any = null;

    private onRegisterSuccess?: (msg: string) => void;
    private onRegisterError?: (err: string) => void;

    private isSilentLogin = false;
    private isLoggedIn = false;
    private isManualLogin = false;
    private tempRegPassword = "";

    private checkUserCallback?: (exists: boolean) => void;
    private checkingUser: string | null = null;

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
            store.dispatch(setConnected(true));

            if (this.isManualLogin) return;

            const code = localStorage.getItem("RE_LOGIN_CODE");
            const user = localStorage.getItem("USERNAME");

            if (code && user && !this.isLoggedIn) {
                this.reLogin(code);
            }
        };

        this.socket.onmessage = (event) => {
            let res = JSON.parse(event.data);
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
                    if (res.mes === "User already exists!") this.onRegisterError?.("Tài khoản đã tồn tại!");
                    if (res.mes === "Username containt whitespace") this.onRegisterError?.("Tài khoản không được chứa khoảng trắng!");
                    if (res.mes === "Username contain special character!") this.onRegisterError?.("Tài khoản không được chứa kí tự đặc biệt!");
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
                    if (res.mes === "You are already logged in") {
                        this.isLoggedIn = true;
                        this.isManualLogin = false;

                        store.dispatch(setUser({
                            username: localStorage.getItem("USERNAME") || "",
                            authenticated: true
                        }));
                        return;
                    }

                    alert(res.mes || "Đăng nhập thất bại");
                    this.logout();
                }
                return;
            }

            if (res.event === "RE_LOGIN") {
                if (res.status === "success") {
                    this.isLoggedIn = true;

                    if (res.data?.RE_LOGIN_CODE) {
                        localStorage.setItem("RE_LOGIN_CODE", res.data.RE_LOGIN_CODE);
                    }

                    store.dispatch(setUser({
                        username: localStorage.getItem("USERNAME") || "",
                        authenticated: true
                    }));
                    this.getUserList();
                } else {
                    localStorage.removeItem("RE_LOGIN_CODE");
                    alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                }
                return;
            }

            if ((res.event === "CREATE_ROOM" || res.event === "JOIN_ROOM") && res.status === "success") {
                const roomName = res.data.name;
                if (roomName) {
                    store.dispatch(addHistory({name: roomName, type: 1}));
                    store.dispatch(setCurrentChat({name: roomName, type: 1}));
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

                if (!Array.isArray(res.data)) return;

                const normalized = res.data.sort(
                    (a: Message, b: Message) =>
                        new Date(a.createAt ?? 0).getTime() -
                        new Date(b.createAt ?? 0).getTime()
                );

                store.dispatch(setMessages(normalized));
            }

            if (res.event === "GET_USER_LIST" && res.status === "success") {
                store.dispatch(setHistory(res.data));
            }

            if (res.event === "CHECK_USER_ONLINE" && res.status === "success") {
                if (!this.checkingUser) return;

                store.dispatch(setUserOnline({
                        user: this.checkingUser,
                        online: Boolean(res.data.status)
                    })
                );
            }

            if (res.event === "SEND_CHAT" && res.status === "success") {
                const currentChat = store.getState().chat.currentChat;
                if (!currentChat) return;

                const msg: Message = {
                    ...res.data,
                    createAt: new Date().toISOString(),
                };

                if (
                    msg.type === 0 &&
                    (msg.name === currentChat.name || msg.to === currentChat.name)
                ) {
                    store.dispatch(appendMessage(msg));
                }

                if (msg.type === 1 && msg.to === currentChat.name) {
                    store.dispatch(appendMessage(msg));
                }
            }


            if (res.status === "error") {
                if (["LOGIN", "RE_LOGIN"].includes(res.event)) {
                    alert(res.mes || "Lỗi xác thực");
                    this.logout();
                } else {
                    console.warn("[WS warning]", res);
                }
                return;
            }
        };

        this.socket.onerror = (err) => {
            console.error("[WS] Error", err);
            store.dispatch(setConnected(false));
        };

        this.socket.onclose = () => {
            console.log("[WS] Disconnected");
            store.dispatch(setConnected(false));

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
        if (this.isLoggedIn && !this.isSilentLogin) return;

        this.isManualLogin = !this.isSilentLogin;
        this.isSilentLogin = false;
        this.isLoggedIn = false;
        localStorage.setItem("USERNAME", username);
        if (!this.isSilentLogin) {
            localStorage.removeItem("RE_LOGIN_CODE");
        }
        this.connect();

        const payload = {
            action: "onchat",
            data: {
                event: "LOGIN",
                data: {user: username, pass: password}
            }
        };

        if (this.socket) {
            this.waitForOpen(this.socket, () => {
                this.socket?.send(JSON.stringify(payload));
            });
        }
    }

    reLogin(code: string) {
        if (!this.socket) return;

        this.waitForOpen(this.socket, () => {
            const username = localStorage.getItem("USERNAME");
            if (!username || !code) return;

            this.socket?.send(JSON.stringify({
                action: "onchat",
                data: {
                    event: "RE_LOGIN",
                    data: {user: username, code}
                }
            }));
        });
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
                        data: {user: username, pass: password}
                    }
                }));
            });
        }
    }

    sendChat(type: "people" | "room", to: string, mes: string) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;

        const name = localStorage.getItem("USERNAME") || "";

        const localMsg = {
            type,
            name,
            to,
            mes,
            createAt: new Date().toISOString(),
        };

        store.dispatch(appendMessage(localMsg));

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
            data: {event: "GET_USER_LIST"}
        }));
    }

    createRoom(name: string) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
        this.socket.send(JSON.stringify({
            action: "onchat",
            data: {
                event: "CREATE_ROOM",
                data: {name}
            }
        }));
    }

    joinRoom(name: string) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
        this.socket.send(JSON.stringify({
            action: "onchat",
            data: {
                event: "JOIN_ROOM",
                data: {name}
            }
        }));
    }

    getRoomChatMess(name: string, page: number) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
        this.socket.send(JSON.stringify({
            action: "onchat",
            data: {
                event: "GET_ROOM_CHAT_MES",
                data: {name, page}
            }
        }))
    }

    getPeopleChatMess(name: string, page: number) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
        this.socket.send(JSON.stringify({
            action: "onchat",
            data: {
                event: "GET_PEOPLE_CHAT_MES",
                data: {name, page}
            }
        }))
    }

    checkUserExist(name: string, callback: (exists: boolean) => void) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
        this.checkUserCallback = callback;
        this.socket?.send(JSON.stringify({
            action: "onchat",
            data: {
                event: "CHECK_USER_EXIST",
                data: {user: name}
            }
        }));
    }

    checkUserOnline(name: string) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;

        this.checkingUser = name;
        this.socket.send(JSON.stringify({
            action: "onchat",
            data: {
                event: "CHECK_USER_ONLINE",
                data: {user: name}
            }
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