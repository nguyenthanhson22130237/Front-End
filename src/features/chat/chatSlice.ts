import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {Room, User } from "./chatTypes";

//Redux
interface ChatState{
    users: User[];
    rooms: string[];
}

const initialState: ChatState = {
    users: [],
    rooms: [],
}

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setUsers: (state, action: PayloadAction<User[]>) => {
            state.users = action.payload;
        },
        addRooms: (state, action: PayloadAction<string>) => {
            if (!state.rooms.includes(action.payload)) {
                state.rooms.push(action.payload);
            }
        }
    }
})

export const { setUsers, addRooms } = chatSlice.actions;
export default chatSlice.reducer;