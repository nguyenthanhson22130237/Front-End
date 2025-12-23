import React, { useState, useEffect } from "react";
import { wsService } from "../services/websocket";
import { useAppSelector } from "../redux/hooks";
import "./LoginForm.css";

export const LoginForm = () => {
    const [user, setUser] = useState("");
    const [pass, setPass] = useState("");

    const auth = useAppSelector((state) => state.auth.user);

    const login = () => {
        wsService.login(user, pass);
    };

    useEffect(() => {
        const reloginCode = localStorage.getItem("RE_LOGIN_CODE");
        if (reloginCode && !auth?.authenticated) {
            wsService.reLogin(reloginCode);
        }
    }, []);

    if (auth?.authenticated) {
        return (
            <div className="login-wrapper">
                <div className="login-success">
                    Đăng nhập thành công! Xin chào
                </div>
            </div>
        );
    }

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <h2 className="login-title">Đăng nhập</h2>

                <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                        className="form-input"
                        type="text"
                        placeholder="Nhập username của bạn"
                        value={user}
                        onChange={(e) => setUser(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Mật khẩu</label>
                    <input
                        className="form-input"
                        type="password"
                        placeholder="Nhập mật khẩu của bạn"
                        value={pass}
                        onChange={(e) => setPass(e.target.value)}
                    />
                </div>


                <button className="login-btn" onClick={login}>
                    Đăng nhập
                </button>

                <div className="register-link">
                    Bạn chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
                </div>
            </div>
        </div>
    );
};