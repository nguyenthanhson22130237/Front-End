import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {Room, User, Message } from "./chatTypes";

//Redux
interface ChatState{
    users: User[];
    rooms: Room[];
    messages: Message[]; // danh sách tin nhắn
    currentChat: {
        type: "room" | "people" | null;
        name: string;
    };
}

const initialState: ChatState = {
    users: [],
    rooms: [],
    messages: [],
    currentChat: {
        type: null,
        name: ""
    }
}

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setUsers: (state, action: PayloadAction<User[]>) => {
            state.users = action.payload;
        },
        addRooms: (state, action: PayloadAction<Room>) => {
            if (!state.rooms.some(r => r.name === action.payload.name)) {
                state.rooms.push(action.payload);
            }
        },
        setMessages: (state, action: PayloadAction<Message[]>) => {
            state.messages = action.payload;
        },
        setCurrentChat: (state, action: PayloadAction<{type: "room" | "people"; name: string}>)=> {
            state.currentChat = action.payload;
            state.messages = []; // reset khi đổi phòng/người
        },
        appendMessage: (state, action: PayloadAction<Message>) => {
            state.messages.push(action.payload);
        }
    }
})

export const { setUsers, addRooms, setMessages, setCurrentChat, appendMessage} = chatSlice.actions;
export default chatSlice.reducer;