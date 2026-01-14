import { useEffect, useRef } from "react";
import { Phone, PhoneOff, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./IncomingCall.css";

interface IncomingCallProps {
    callerName: string;
    callUrl: string;
    onReject: () => void;
}

export const IncomingCall = ({
                                 callerName,
                                 callUrl,
                                 onReject,
                             }: IncomingCallProps) => {
    const navigate = useNavigate();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        timerRef.current = setTimeout(() => {
            onReject();
        }, 30000);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [onReject]);

    const handleAccept = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        onReject();

        const path =
            callUrl.split(window.location.host)[1] ||
            new URL(callUrl).pathname;

        navigate(path);
    };

    const handleReject = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        onReject();
    };

    return (
        <div className="incoming-overlay">
            <div className="incoming-card">
                <div className="incoming-close" onClick={handleReject}>
                    <X size={20} />
                </div>

                <div className="incoming-avatar">
                    {callerName[0]?.toUpperCase()}
                </div>

                <h3>Cuộc gọi đến…</h3>
                <p className="incoming-name">{callerName}</p>

                <div className="incoming-actions">
                    <button
                        className="incoming-btn reject"
                        onClick={handleReject}
                    >
                        <PhoneOff color="#fff" />
                    </button>

                    <button
                        className="incoming-btn accept"
                        onClick={handleAccept}
                    >
                        <Phone color="#fff" />
                        <span>Nghe</span>
                    </button>
                </div>

                <div className="incoming-progress">
                    <div className="incoming-bar" />
                </div>
            </div>
        </div>
    );
};
