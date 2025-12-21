import { LogIn, Plus, Users } from "lucide-react";
import { useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";
import { useState } from "react";
import { wsService } from "../../services/websocket";

export const Sidebar = () => {

    const users = useAppSelector((state: RootState) => state.chat.users);
    const rooms = useAppSelector((state: RootState) => state.chat.rooms);

    const [tab, setTab] = useState<"room" | "people">("room");
    const [createMode, setCreateMode] = useState(false);
    const [roomName, setRoomName] = useState("");

    const createRoom = () => {
        if (!roomName.trim()) {
            alert("Vui lòng nhập tên phòng");
            return;
        }
        wsService.createRoom(roomName);
        setRoomName("");
    };

    const joinRoom = () => {
        if (!roomName.trim()) {
            alert("Vui lòng nhập tên phòng");
            return;
        }
        wsService.joinRoom(roomName);
        setRoomName("");
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h3>NLU Chat</h3>
            </div>

            {tab === "room" && (
                <><input className="search"
                         placeholder="Tên phòng hoặc người dùng"
                         value={roomName}
                         onChange={(e) => setRoomName(e.target.value)}/>

                    <div className="room-actions">
                        <label>
                            <input
                                type="checkbox"
                                checked={createMode}
                                onChange={(e) => setCreateMode(e.target.checked)} /> Phòng
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
                        {rooms.map((r) => (
                            <div key={r} className="chatItem">
                                <Users size={16}/>
                                <span>{r}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* PEOPLE TAB */}
            {tab === "people" && (
                <div className="list">
                    {users.map((u) => (
                        <div key={u.user} className="chatItem">
                            <Users size={16} />
                            <span>{u.user}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
