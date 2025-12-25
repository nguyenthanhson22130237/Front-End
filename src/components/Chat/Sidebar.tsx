import {LogIn, Plus, Users} from "lucide-react";
import {useAppSelector, useAppDispatch} from "../../redux/hooks";
import {RootState} from "../../redux/store";
import {useState} from "react";
import {wsService} from "../../services/websocket";
import {setCurrentChat} from "../../features/chat/chatSlice";

export const Sidebar = () => {

    const users = useAppSelector((state: RootState) => state.chat.users);
    const rooms = useAppSelector((state: RootState) => state.chat.rooms);

    const [createMode, setCreateMode] = useState(false);
    const [roomInput, setRoomInput] = useState("");
    const dispatch = useAppDispatch();

    const createRoom = () => {
        if (!roomInput.trim()) {
            alert("Vui lòng nhập tên phòng");
            return;
        }
        wsService.createRoom(roomInput);
        setRoomInput("");
    };

    const joinRoom = () => {
        if (!roomInput.trim()) {
            alert("Vui lòng nhập tên phòng");
            return;
        }
        wsService.joinRoom(roomInput);
        setRoomInput("");
    };

    const openChat = (type: "room" | "people", name: string) => {
        dispatch(setCurrentChat({type, name}));
        if (type === "room") {
            wsService.getRoomChatMess(name, 1);
        } else {
            wsService.getPeopleChatMess(name, 1);
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

                {/* ROOM LIST */}
                <div className="list">
                    {rooms.map((room) => (
                        <div
                            key={room.name}
                            onClick={() => openChat("room", room.name)}
                            className="list-item"
                        >
                            <Users size={16}/>
                            <span>{room.name}</span>
                        </div>
                    ))}
                    {users.map((u) => (
                        <div
                            key={u.user}
                            onClick={() => openChat("people", u.user)}
                            className="list-item"
                        >
                            <Users size={16}/>
                            <span>{u.user}</span>
                        </div>
                    ))}
                </div>
            </>
        </div>
    );
};
