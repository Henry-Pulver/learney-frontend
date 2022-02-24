import { compose, configureStore } from "@reduxjs/toolkit";
import userDataSlice from "./components/userDataSlice";

// TODO: Handle activating redux dev tools gracefully.
const enhancers = compose(
  //@ts-ignore
  typeof window !== "undefined" && window.devToolsExtension
    ? window.devToolsExtension()
    : (f) => f
);
const store = configureStore({
  reducer: {
    userData: userDataSlice,
  },
  //@ts-ignore
  devTools: enhancers,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;