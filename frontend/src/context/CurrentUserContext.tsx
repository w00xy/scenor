import React, { createContext, useContext, useEffect, useState } from "react";
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

const DEFAULT_USERNAME = "Пользователь";

export function CurrentUserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

      const data = await userApi.getUser(decoded.sub);
      const user: CurrentUser = {
        id: data.id,
        username: data.username,
        email: data.email,
        role: (data as Record<string, unknown>).globalRole as string || data.role || 'USER',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
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

export function useCurrentUser() {
  const context = useContext(CurrentUserContext);

  if (!context) {
    throw new Error("useCurrentUser must be used within CurrentUserProvider");
  }

  return context;
}
