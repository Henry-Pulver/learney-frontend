import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { UserData, emptyUserData } from "./types";

interface IUserPayload {
  id?: string;
  email?: string;
  questions_streak?: number;
  batch_completed_today?: boolean;
}
const initialState = {
  ...emptyUserData,
} as UserData;

export const userDataSlice = createSlice({
  name: "userData",
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<IUserPayload>) => {
      const { id, email, questions_streak, batch_completed_today } =
        action.payload;
      state.id = id ? id : state.id;
      state.email = email ? email : state.email;
      state.batch_completed_today = batch_completed_today
        ? batch_completed_today
        : state.batch_completed_today;
      state.questions_streak = questions_streak
        ? questions_streak
        : state.questions_streak;
    },
  },
});

export const { setUserData } = userDataSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const getUserData = (state: RootState) => state.userData;

export default userDataSlice.reducer;
