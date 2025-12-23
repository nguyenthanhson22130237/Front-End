import React, { useState, useEffect } from "react";
import { wsService } from "../services/websocket";
// @ts-ignore
import { useAppSelector } from "../redux/hooks";

export const LoginForm = () => {
    const [user, setUser] = useState("");
    const [pass, setPass] = useState("");

    // @ts-ignore
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
        return <div>Đăng nhập thành công! Xin chào</div>;
    }

    return (
        <div>
            <h2>Đăng nhập</h2>
            <input
                type="text"
                placeholder="Username"
                onChange={(e) => setUser(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                onChange={(e) => setPass(e.target.value)}
            />
            <button onClick={login}>Login</button>
        </div>
    );
};
