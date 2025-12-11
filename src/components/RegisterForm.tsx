import React, { useState } from "react";
import { wsService } from "../services/websocket";
// @ts-ignore
import { useAppSelector } from "../redux/hooks";

export const RegisterForm = () => {
    const [user, setUser] = useState("");
    const [pass, setPass] = useState("");
    // @ts-ignore
    const auth = useAppSelector((state) => state.auth.user);

    const register = () => {
        wsService.register(user, pass);
    };

    if (auth?.authenticated) {
        return <div>Đăng ký thành công! Xin chào</div>;
    }

    return (
        <div>
            <h2>Đăng ký</h2>
            <input type="text" placeholder="Username" onChange={(e) => setUser(e.target.value)} />
            <input type="password" placeholder="Password" onChange={(e) => setPass(e.target.value)} />
            <button onClick={register}>Register</button>
        </div>
    );
};
