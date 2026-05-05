import { useCurrentUser } from "../context/CurrentUserContext";

export function useCurrentUsername(defaultValue = "Пользователь") {
  const { username } = useCurrentUser();

  return username || defaultValue;
}
