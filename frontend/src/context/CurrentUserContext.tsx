import React, { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { getAccessToken, userApi } from "../services/api";

interface CurrentUser {
  id: string;
  username: string;
  email: string;
  lastname?: string;
  phone?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface CurrentUserContextType {
  currentUser: CurrentUser | null;
  username: string;
  isLoading: boolean;
  refreshCurrentUser: () => Promise<CurrentUser | null>;
  clearCurrentUser: () => void;
}

const CurrentUserContext = createContext<CurrentUserContextType | undefined>(
  undefined,
);

export { CurrentUserContext };

const DEFAULT_USERNAME = "Пользователь";

export function CurrentUserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const clearCurrentUser = () => {
    setCurrentUser(null);
    setIsLoading(false);
  };

  const refreshCurrentUser = async (): Promise<CurrentUser | null> => {
    const token = getAccessToken();
    if (!token) {
      clearCurrentUser();
      return null;
    }

    setIsLoading(true);
    try {
      const decoded = jwtDecode<{ sub: string }>(token);
      if (!decoded?.sub) {
        clearCurrentUser();
        return null;
      }

      const user = await userApi.getUser(decoded.sub);
      setCurrentUser(user);
      return user;
    } catch {
      clearCurrentUser();
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!getAccessToken()) {
      clearCurrentUser();
      return;
    }

    void refreshCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CurrentUserContext.Provider
      value={{
        currentUser,
        username: currentUser?.username || DEFAULT_USERNAME,
        isLoading,
        refreshCurrentUser,
        clearCurrentUser,
      }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
}
