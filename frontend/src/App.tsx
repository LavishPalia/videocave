// src/App.tsx

import { Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { ThemeProvider } from "./components/theme-provider";
import { SidebarContextProvider } from "./contexts/SidebarContext";

const App = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SidebarContextProvider>
        {children}

        <ToastContainer
          position="bottom-left"
          autoClose={2000}
          hideProgressBar
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="dark"
          transition={Slide}
        />
      </SidebarContextProvider>
    </ThemeProvider>
  );
};

export default App;
