import {LogIn, Plus, Users, User} from "lucide-react";
import {useAppSelector, useAppDispatch} from "../../redux/hooks";
import {store} from "../../redux/store";
import {useState, useEffect} from "react";
import {wsService} from "../../services/websocket";
import {setCurrentChat, clearMessages, addHistory} from "../../features/chat/chatSlice";

export const Sidebar = () => {
    const dispatch = useAppDispatch();

    const history = useAppSelector(state => state.chat.history);
    const [createMode, setCreateMode] = useState(false);
    const [roomInput, setRoomInput] = useState("");
    const onlineUsers = useAppSelector(state => state.chat.onlineUsers);

    useEffect(() => {
        history.forEach(item => {
            if (item.type === 0) {
                wsService.checkUserOnline(item.name);
            }
        });
    }, [history]);


    const createRoom = () => {
        if (!roomInput.trim()) {
            return;
        }
        const name = roomInput.trim();
        wsService.createRoom(name);

        setRoomInput("");
    };

    const joinRoom = () => {
        if (!roomInput.trim()) {
            alert("Vui lòng nhập tên phòng");
            return;
        }
        const name = roomInput.trim();

        if (createMode) {
            wsService.joinRoom(name);
        } else {
            wsService.checkUserExist(name, (exists: boolean) => {
                if (exists) {
                    store.dispatch(addHistory({name, type: 0}));
                    store.dispatch(setCurrentChat({name, type: 0}));
                    wsService.getPeopleChatMess(name, 1);
                } else {
                    alert("User không tồn tại");
                }
            });
        }
        setRoomInput("");
    };

    const openChat = (item: { name: string; type: 0 | 1 }) => {
        dispatch(clearMessages());
        dispatch(setCurrentChat(item));
        if (item.type === 1) {
            wsService.getRoomChatMess(item.name, 1);
        } else {
            wsService.checkUserOnline(item.name);
            wsService.getPeopleChatMess(item.name, 1);
        }
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h3>Group 32 App Chat</h3>
            </div>

            <><input className="search"
                     placeholder="Tên phòng hoặc người dùng"
                     value={roomInput}
                     onChange={(e) => setRoomInput(e.target.value)}/>

                <div className="room-actions">
                    <label>
                        <input
                            type="checkbox"
                            checked={createMode}
                            onChange={(e) => setCreateMode(e.target.checked)}/> Phòng
                    </label>
                </div>
                <div className="btn">
                    <div className="action-buttons">
                        {createMode && (
                            <button onClick={createRoom} title="Tạo phòng">
                                <Plus size={18}/>
                            </button>
                        )}
                        <button onClick={joinRoom} title="Tham gia phòng">
                            <LogIn size={18}/>
                        </button>
                    </div>
                </div>

                <div className="list">
                    {history.map(item => (
                        <div key={`${item.type}-${item.name}`} className="list-item" onClick={() => openChat(item)}>
                            {item.type === 1 ? <Users size={16}/> : <User size={16}/>}
                            <span>{item.name}</span>

                            {item.type === 0 && (
                                <span
                                    className={`dot ${
                                        onlineUsers[item.name] ? "online" : "offline"
                                    }`}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </>
        </div>
    );
};
