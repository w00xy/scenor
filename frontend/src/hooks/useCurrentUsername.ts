import { useCurrentUser } from "../hooks/useCurrentUserContext";

export function useCurrentUsername(defaultValue = "Пользователь") {
  const { username } = useCurrentUser();

  return username || defaultValue;
}
