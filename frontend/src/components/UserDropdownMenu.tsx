import { Keyboard, LogOut, Settings, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutUser } from "@/slices/authSlice";
import { useAppDispatch } from "@/app/hooks";
import { Slide, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";

export function UserDropdownMenu({
  user,
}: {
  user: {
    _id: string;
    email: string;
    avatar: string;
    fullName: string;
    userName: string;
  };
}) {
  // console.log(user);
  const dispatch = useAppDispatch();
  const handleLogoutUser = () => {
    console.log("ran");
    toast.success("Logout Successful");
    setTimeout(() => {
      dispatch(logoutUser(null));
    }, 800);
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <User />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-2 mx-8">
        <DropdownMenuGroup>
          <Link to={`/user/${user?.userName}`} className="flex gap-2 mt-2 mb-4">
            <img
              src={user?.avatar}
              alt={user?.fullName}
              className="size-14 rounded-full object-cover object-center"
            />
            <div className="flex flex-col">
              <p className="text-lg">{user?.fullName}</p>
              <p className="text-sm">@{user?.userName}</p>
            </div>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <button onClick={handleLogoutUser} className="w-full">
          <DropdownMenuItem>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </button>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Keyboard className="mr-2 h-4 w-4" />
            <span>Keyboard shortcuts</span>
            <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
      <ToastContainer
        autoClose={2000}
        hideProgressBar={true}
        position="bottom-left"
        theme="dark"
        transition={Slide}
        stacked
      />
    </DropdownMenu>
  );
}
