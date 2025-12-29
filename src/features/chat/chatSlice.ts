import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Message, ChatHistoryItem } from "./chatTypes";

//Redux
interface ChatState{
    history: ChatHistoryItem[];
    messages: Message[];
    currentChat?: ChatHistoryItem;
}

const initialState: ChatState = {
    history: [],
    messages: [],
    currentChat: undefined
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setHistory: (state, action: PayloadAction<ChatHistoryItem[]>) => {
            state.history = action.payload;
        },
        addHistory: (state, action: PayloadAction<ChatHistoryItem>) => {
            const exists = state.history.find(
                h => h.name === action.payload.name && h.type === action.payload.type
            );
            if (!exists) {
                state.history = [...state.history, action.payload];
            }
        },
        setMessages: (state, action: PayloadAction<Message[]>) => {
            state.messages = action.payload;
        },
        setCurrentChat: (state, action: PayloadAction<ChatHistoryItem>) => {
            state.currentChat = action.payload;
        },
        appendMessage: (state, action: PayloadAction<Message>) => {
            state.messages.push(action.payload);
        },
        clearMessages: (state) => {
            state.messages = [];
        },
    }
})

export const { setHistory, addHistory, setMessages, setCurrentChat, appendMessage, clearMessages} = chatSlice.actions;
export default chatSlice.reducer;