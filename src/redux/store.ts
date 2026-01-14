import { configureStore } from "@reduxjs/toolkit";
// @ts-ignore
import authReducer from "../features/auth/authSlice";
import chatReducer from "../features/chat/chatSlice";
import websocketReducer from "../features/websocket/websocketSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        chat: chatReducer,
        websocket: websocketReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
