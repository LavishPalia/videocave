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
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const dispatch = useAppDispatch();
  const handleLogoutUser = () => {
    toast.success("Logout Successful");
    setTimeout(() => {
      dispatch(logoutUser(null));
    }, 800);
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <User size={20} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-2 mx-8">
        <DropdownMenuGroup>
          <a href={`/user/${user?.userName}`} className="flex gap-2 mt-2 mb-4">
            <img
              src={user?.avatar}
              alt={user?.fullName}
              className="object-cover object-center rounded-full size-14"
              loading="lazy"
            />
            <div className="flex flex-col">
              <p className="text-lg">{user?.fullName}</p>
              <p className="text-sm">@{user?.userName}</p>
            </div>
          </a>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <button onClick={handleLogoutUser} className="w-full">
          <DropdownMenuItem>
            <LogOut className="w-4 h-4 mr-2" />
            <span>Log out</span>
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </button>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Settings className="w-4 h-4 mr-2" />
            <span>Settings</span>
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Keyboard className="w-4 h-4 mr-2" />
            <span>Keyboard shortcuts</span>
            <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
