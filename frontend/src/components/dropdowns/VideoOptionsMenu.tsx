import { Clock, EllipsisVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RiPlayList2Line, RiShareForwardLine } from "react-icons/ri";
import CreatePlaylist from "../CreatePlaylist";
import React, { useState } from "react";

interface VideoOptionsMenuProps {
  videoId: string;
}

const VideoOptionsMenu = ({ videoId }: VideoOptionsMenuProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);

  const handleCreatePlaylistClick = () => {
    setIsCreatingPlaylist(true);
    setDropdownOpen(false); // Close the dropdown
  };

  const closeCreatePlaylist = () => setIsCreatingPlaylist(false);

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1"
          >
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 p-2 bg-[#202021]">
          <DropdownMenuGroup className="space-y-2">
            <div
              className="flex items-center justify-start gap-2 p-1 rounded-md cursor-pointer hover:bg-secondary-marginal-dark"
              onClick={() => setDropdownOpen(false)}
            >
              <Clock size={24} />
              <span className="text-lg">Save to Watch Later</span>
            </div>
            <div
              className="flex items-center justify-start gap-2 p-1 rounded-md cursor-pointer hover:bg-secondary-marginal-dark"
              onClick={handleCreatePlaylistClick}
            >
              <RiPlayList2Line size={24} />
              <span className="text-lg">Save to Playlist</span>
            </div>
            <div
              className="flex items-center justify-start gap-2 p-1 rounded-md cursor-pointer hover:bg-secondary-marginal-dark"
              onClick={() => setDropdownOpen(false)}
            >
              <RiShareForwardLine size={24} />
              <span className="text-lg">Share</span>
            </div>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {isCreatingPlaylist && (
        <CreatePlaylist
          videoId={videoId}
          close={closeCreatePlaylist} // Pass the close function
        />
      )}
    </>
  );
};

export default React.memo(VideoOptionsMenu);
