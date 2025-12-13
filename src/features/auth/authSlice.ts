import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "./authTypes";

interface AuthState {
    user: User | null;
}

const initialState: AuthState = {
    user: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },
        logout: (state) => {
            state.user = null;
            localStorage.removeItem("RE_LOGIN_CODE");
        }
    },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;

