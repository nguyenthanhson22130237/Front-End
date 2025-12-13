import { useEffect } from "react";
import { wsService } from "./services/websocket";
import { RegisterForm } from "./components/RegisterForm";
import { LoginForm } from "./components/LoginForm";
const App = () => {
    useEffect(() => {
        wsService.connect();
    }, []);

    return (
        <div>
            <LoginForm/>

        </div>
    );
};

export default App;
