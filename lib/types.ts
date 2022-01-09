import { UserProfile } from "@auth0/nextjs-auth0";

type ButtonPressCallback = (...args) => void;
export type ButtonPressFunction = (
  callback: ButtonPressCallback,
  name: string
) => ButtonPressCallback;
export type UserState = UserProfile | undefined;
