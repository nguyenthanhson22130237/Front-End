import { useEffect } from "react";
import { wsService } from "./services/websocket";
import { RegisterForm } from "./components/RegisterForm";

const App = () => {
    useEffect(() => {
        wsService.connect();
    }, []);

    return (
        <div>
            <RegisterForm />
        </div>
    );
};

export default App;
