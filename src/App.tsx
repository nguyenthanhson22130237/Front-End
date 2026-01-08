import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { wsService } from "./services/websocket";
import { WebSocketLoader } from "./components/WebSocketLoader";

const App = () => {
    useEffect(() => {
        wsService.connect();
    }, []);

    return (
        <>
            <WebSocketLoader />
            <Outlet />
        </>
    );
};

export default App;
