import { useAppSelector } from "../redux/hooks";
// @ts-ignore
import styles from "./WebSocketLoader.module.css";

export const WebSocketLoader = () => {
    const connected = useAppSelector(
        state => state.websocket.connected
    );

    if (connected) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.box}>
                <div className={styles.spinner}></div>
                <p>Đang kết nối WebSocket...</p>
            </div>
        </div>
    );
};
