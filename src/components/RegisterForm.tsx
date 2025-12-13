import {useState} from "react";
// @ts-ignore
import styles from "./RegisterForm.module.css";
import {wsService} from "../services/websocket";

export const RegisterForm = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState<"success" | "error" | "">("");

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        if (!username) {
            setMessage("Vui lòng nhập username");
            return;
        }

        if (!password || !password2) {
            setMessage("Vui lòng nhập mật khẩu");
            return;
        }

        if (password !== password2) {
            setMessage("Mật khẩu không khớp");
            return;
        }

        // GỌI WEBSOCKET REGISTER
        wsService.register(
            username,
            password,
            (msg) => {
                setMessage(msg);
                setStatus("success");
            },
            (err) => {
                setMessage(err);
                setStatus("error");
            }
        );
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <form onSubmit={submit}>
                    <h1 className={styles.title}>Đăng ký</h1>

                    <label className={styles.label}>Username</label>
                    <input
                        className={`${styles.input} ${!username && message ? styles.inputError : ""}`}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <label className={styles.label}>Mật khẩu</label>
                    <input
                        type="password"
                        className={`${styles.input} ${!password && message ? styles.inputError : ""}`}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <label className={styles.label}>Nhập lại mật khẩu</label>
                    <input
                        type="password"
                        className={`${styles.input} ${password !== password2 && message ? styles.inputError : ""}`}
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
                    className={`${styles.notification} ${
                        status === "success" ? styles.success : styles.error
                    }`}
                >
                    {message}
                </div>
            )}

        </div>
    );
};
