import { Clock, EllipsisVertical, Trash2 } from "lucide-react";
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
import NewPlaylist from "../NewPlaylist";

interface VideoOptionsMenuProps {
  videoId: string;
  listId?: string;
  playlistName?: string;
  onDeleteVideoFromPlaylist?: (videoId: string) => void;
}

const VideoOptionsMenu = ({
  videoId,
  listId,
  playlistName,
  onDeleteVideoFromPlaylist,
}: VideoOptionsMenuProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [dialogState, setDialogState] = useState<"none" | "create" | "new">(
    "none"
  );

  const openCreatePlaylist = () => setDialogState("create");
  const openNewPlaylist = () => setDialogState("new");
  const closeDialogs = () => setDialogState("none");

  const handleCreatePlaylistClick = () => {
    openCreatePlaylist();
    setDropdownOpen(false); // Close the dropdown
  };

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-0 -right-4 md:right-0"
          >
            <EllipsisVertical className="size-5 md:size-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 p-2 bg-[#202021]">
          <DropdownMenuGroup className="space-y-2">
            <div
              className="flex items-center justify-start gap-2 p-1 rounded-md cursor-pointer hover:bg-secondary-marginal-dark"
              onClick={() => setDropdownOpen(false)}
            >
              <Clock size={20} />
              <span className="text-[16px]">Save to Watch Later</span>
            </div>
            <div
              className="flex items-center justify-start gap-2 p-1 rounded-md cursor-pointer hover:bg-secondary-marginal-dark"
              onClick={handleCreatePlaylistClick}
            >
              <RiPlayList2Line size={20} />
              <span className="text-[16px]">Save to Playlist</span>
            </div>
            {listId && playlistName && (
              <div
                className="flex items-center justify-start gap-2 p-1 rounded-md cursor-pointer hover:bg-secondary-marginal-dark"
                onClick={() => {
                  if (onDeleteVideoFromPlaylist) {
                    onDeleteVideoFromPlaylist(videoId);
                  }
                  setDropdownOpen(false);
                }}
              >
                <Trash2 size={20} />
                <span className="text-[16px]">Remove from {playlistName}</span>
              </div>
            )}
            <div
              className="flex items-center justify-start gap-2 p-1 rounded-md cursor-pointer hover:bg-secondary-marginal-dark"
              onClick={() => setDropdownOpen(false)}
            >
              <RiShareForwardLine size={20} />
              <span className="text-[16px]">Share</span>
            </div>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {dialogState === "create" && (
        <CreatePlaylist
          videoId={videoId}
          close={closeDialogs} // Pass the close function
          openNew={openNewPlaylist}
        />
      )}

      {
        // New playlist dialog
        dialogState === "new" && (
          <NewPlaylist close={closeDialogs} videoId={videoId} />
        )
      }
    </>
  );
};

export default React.memo(VideoOptionsMenu);
