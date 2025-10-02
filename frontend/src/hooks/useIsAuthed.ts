import { useAppSelector } from "../store";

export const useIsAuthed = () => {
  return useAppSelector((state) => Boolean(state.user.user));
};
