import { compose, configureStore } from "@reduxjs/toolkit";
import userDataSlice from "./components/userDataSlice";

declare global {
  interface Window {
    devToolsExtension: any;
  }
}

// TODO: Handle activating redux dev tools gracefully.
const enhancers = compose(
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
