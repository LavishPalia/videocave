import { PropsWithChildren, useContext, useEffect, useState } from "react";
import { createContext } from "react";

type SidebarContextType = {
  isLargeOpen: boolean;
  isSmallOpen: boolean;
  toggle: () => void;
  close: () => void;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

export function SidebarContextProvider({ children }: PropsWithChildren) {
  const [isLargeOpen, setIsLargeOpen] = useState(true);
  const [isSmallOpen, setIsSmallOpen] = useState(false);

  useEffect(() => {
    const handler = () => {
      if (!isScreenSmall()) setIsSmallOpen(false);
    };

    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("resize", handler);
    };
  }, []);

  function toggle() {
    if (isScreenSmall()) {
      setIsSmallOpen((s) => !s);
    } else {
      setIsLargeOpen((l) => !l);
    }
  }
  function close() {
    if (isScreenSmall()) {
      setIsSmallOpen(false);
    } else {
      setIsLargeOpen(false);
    }
  }

  function isScreenSmall() {
    return window.innerWidth < 1024;
  }
  return (
    <SidebarContext.Provider
      value={{ isLargeOpen, isSmallOpen, toggle, close }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarContext() {
  const value = useContext(SidebarContext);

  if (value === null) {
    throw new Error(
      "useSidebarContext must be used within a SidebarContextProvider"
    );
  }

  return value;
}
