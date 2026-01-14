import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

export const VideoCall = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const [searchParams] = useSearchParams();

    const isVoiceCall = searchParams.get("mode") === "voice";

    const appID = 1955148599;
    const serverSecret = "ab83c9986ca0c11ef4d21afd2cf63c98";

    const username = localStorage.getItem("USERNAME") || "User";
    const userId = username + "_" + Date.now();

    useEffect(() => {
        if (!containerRef.current || !roomId) return;

        const myMeeting = async () => {
            const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                appID, serverSecret, roomId, userId, username
            );

            const zp = ZegoUIKitPrebuilt.create(kitToken);

            zp.joinRoom({
                container: containerRef.current,
                scenario: {
                    mode: ZegoUIKitPrebuilt.OneONoneCall,
                },

                showPreJoinView: false,
                showUserList: false,
                showTextChat: false,
                showLayoutButton: false,
                showRoomTimer: true,
                showAudioVideoSettingsButton: true,
                turnOnCameraWhenJoining: !isVoiceCall,
                turnOnMicrophoneWhenJoining: true,
                showMyCameraToggleButton: !isVoiceCall,
                showScreenSharingButton: !isVoiceCall,

                onLeaveRoom: () => {
                    navigate('/');
                    window.location.reload();
                },

                // @ts-ignore
                onUserLeave: (users) => {
                    navigate('/');
                    window.location.reload();
                }
            });
        };

        myMeeting();

    }, [roomId, navigate, isVoiceCall, userId, username, appID, serverSecret]);

    return (
        <div
            ref={containerRef}
            style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}
        />
    );
};

export default VideoCall;