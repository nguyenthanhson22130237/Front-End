import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

export const VideoCall = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);

    const zpRef = useRef<any>(null);

    const [searchParams] = useSearchParams();

    const isVoiceCall = searchParams.get("mode") === "voice";
    const isGroupCall = searchParams.get("type") === "group";

    const appID = 1955148599;
    const serverSecret = "ab83c9986ca0c11ef4d21afd2cf63c98";

    const username = localStorage.getItem("USERNAME") || "User";
    const userId = username + "_" + Date.now();

    const handleLeave = () => {
        navigate(-1);
    };

    useEffect(() => {
        if (!containerRef.current || !roomId) return;

        const myMeeting = async () => {
            const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                appID, serverSecret, roomId, userId, username
            );

            zpRef.current = ZegoUIKitPrebuilt.create(kitToken);

            if (zpRef.current) {
                zpRef.current.joinRoom({
                    container: containerRef.current,
                    scenario: {
                        mode: isGroupCall
                            ? ZegoUIKitPrebuilt.GroupCall
                            : ZegoUIKitPrebuilt.OneONoneCall,
                    },

                    showPreJoinView: false,
                    showUserList: false,
                    showTextChat: isGroupCall,
                    showLayoutButton: false,
                    showRoomTimer: true,
                    showAudioVideoSettingsButton: true,
                    turnOnCameraWhenJoining: !isVoiceCall,
                    turnOnMicrophoneWhenJoining: true,
                    showMyCameraToggleButton: !isVoiceCall,
                    showScreenSharingButton: !isVoiceCall,

                    onLeaveRoom: () => {
                        handleLeave();
                    },

                    // @ts-ignore
                    onUserLeave: (users) => {
                        if (isGroupCall) return;
                        handleLeave();
                    }
                });
            }
        };

        myMeeting();

        return () => {
            if (zpRef.current && typeof zpRef.current.destroy === 'function') {
                zpRef.current.destroy();
            }
        };

    }, [roomId, navigate, isVoiceCall, isGroupCall, userId, username, appID, serverSecret]);

    return (
        <div
            ref={containerRef}
            style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}
        />
    );
};

export default VideoCall;