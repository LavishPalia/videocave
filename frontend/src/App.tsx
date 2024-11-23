// src/App.tsx

import { ThemeProvider } from "./components/theme-provider";
import { SidebarContextProvider } from "./contexts/SidebarContext";

const App = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SidebarContextProvider>{children}</SidebarContextProvider>
    </ThemeProvider>
  );
};

export default App;
