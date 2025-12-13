import { useEffect } from "react";
import { wsService } from "./services/websocket";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
// @ts-ignore
import RegisterPage from "./pages/RegisterPage";

const App = () => {
    useEffect(() => {
        wsService.connect();
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="*" element={<Navigate to="/register" />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
