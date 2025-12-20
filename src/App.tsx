import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { wsService } from "./services/websocket";

const App = () => {
    useEffect(() => {
        wsService.connect();
    }, []);

    return (
        <>
            <Outlet />
        </>
    );
};

export default App;
