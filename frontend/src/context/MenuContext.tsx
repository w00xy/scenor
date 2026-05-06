import React, { createContext, useContext, useEffect, useState } from "react";

interface MenuContextType {
  collapsed: boolean;
  toggleMenu: () => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);
const MENU_COLLAPSED_STORAGE_KEY = "scenor.menu.collapsed";

export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem(MENU_COLLAPSED_STORAGE_KEY) === "true";
  });

  useEffect(() => {
    window.localStorage.setItem(
      MENU_COLLAPSED_STORAGE_KEY,
      String(collapsed),
    );
  }, [collapsed]);

  const toggleMenu = () => setCollapsed((prev) => !prev);

  return (
    <MenuContext.Provider value={{ collapsed, toggleMenu }}>
      {children}
    </MenuContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) throw new Error("useMenu must be used within MenuProvider");
  return context;
};
