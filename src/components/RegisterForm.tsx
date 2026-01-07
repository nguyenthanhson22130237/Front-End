import {useState, useEffect} from "react";
import {useAppSelector} from "../redux/hooks";
import {useNavigate} from "react-router-dom";
// @ts-ignore
import styles from "./RegisterForm.module.css";
import {wsService} from "../services/websocket";

export const RegisterForm = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState<"success" | "error" | "">("");
    const [notifyId, setNotifyId] = useState(0);
    const [showNotification, setShowNotification] = useState(false);

    const auth = useAppSelector((state) => state.auth.user);
    const navigate = useNavigate();
    useEffect(() => {
        if (auth?.authenticated) {
            navigate("/chat", {replace: true});
        }
    }, [auth?.authenticated]);

    useEffect(() => {
        if (!message) return;

        setShowNotification(true);

        const timer = setTimeout(() => {
            setShowNotification(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, [notifyId]);


    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        if (!username) {
            setMessage("Vui lòng nhập username");
            setNotifyId(prev => prev + 1);
            return;
        }

        if (!password || !password2) {
            setMessage("Vui lòng nhập mật khẩu");
            setNotifyId(prev => prev + 1);
            return;
        }

        if (password !== password2) {
            setMessage("Mật khẩu không khớp");
            setNotifyId(prev => prev + 1);
            return;
        }

        // GỌI WEBSOCKET REGISTER
        wsService.register(
            username,
            password,
            (msg) => {
                setMessage(msg);
                setNotifyId(prev => prev + 1);
                setStatus("success");
            },
            (err) => {
                setMessage(err);
                setNotifyId(prev => prev + 1);
                setStatus("error");
            }
        );
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <form onSubmit={submit}>
                    <h2 className={styles.title}>Đăng ký</h2>

                    <label className={styles.label}>Username</label>
                    <input
                        className={`${styles.input} ${!username && message ? styles.inputError : ""}`}
                        placeholder="Nhập username của bạn"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <label className={styles.label}>Mật khẩu</label>
                    <input
                        type="password"
                        className={`${styles.input} ${!password && message ? styles.inputError : ""}`}
                        placeholder="Nhập mật khẩu của bạn"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <label className={styles.label}>Nhập lại mật khẩu</label>
                    <input
                        type="password"
                        className={`${styles.input} ${password !== password2 && message ? styles.inputError : ""}`}
                        placeholder="Xác nhận lại mật khẩu của bạn"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                    />

                    <button className={styles.submit} type="submit">
                        Tạo tài khoản
                    </button>

                    <div className={styles.login}>
                        Đã có tài khoản?
                        <a href="/login" className={styles.loginLink}>
                            Đăng nhập
                        </a>
                    </div>
                </form>
            </div>

            {message && (
                <div
                    key={notifyId}
                    className={`${styles.notification}
                    ${status === "success" ? styles.success : styles.error}`}
                >
                    {message}
                </div>
            )}



        </div>
    );
};
