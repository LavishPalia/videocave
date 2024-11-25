import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useAddVideoToPlaylistMutation,
  useGetVideoFlagAndPlayListNamesQuery,
  useRemoveVideoFromPlaylistMutation,
} from "@/slices/playlistApiSlice";
import { Plus } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

interface CreatePlaylistProps {
  videoId: string;
  close: () => void;
  openNew: () => void;
}

interface IPlaylist {
  _id: string;
  name: string;
  containsVideo: boolean;
}

const CreatePlaylist = ({ videoId, close, openNew }: CreatePlaylistProps) => {
  const { data: playlistsData, refetch: refetchPlaylists } =
    useGetVideoFlagAndPlayListNamesQuery(videoId);

  const [addVideoToPlaylist] = useAddVideoToPlaylistMutation();
  const [removeVideoFromPlaylist] = useRemoveVideoFromPlaylistMutation();

  const [localPlaylists, setLocalPlaylists] = useState<IPlaylist[]>([]);

  useEffect(() => {
    if (playlistsData?.data) {
      setLocalPlaylists(playlistsData.data);
    }
  }, [playlistsData]);

  useEffect(() => {
    refetchPlaylists();
  }, []);

  const handleCheckboxChange = async (
    playlistId: string,
    containsVideo: boolean
  ) => {
    setLocalPlaylists((prev) =>
      prev.map((playlist) =>
        playlist._id === playlistId
          ? { ...playlist, containsVideo: !containsVideo }
          : playlist
      )
    );

    try {
      if (containsVideo) {
        await removeVideoFromPlaylist({ videoId, playlistId });
        toast.success(
          `Removed from ${
            localPlaylists.find((playlist) => playlist._id === playlistId)?.name
          }`
        );
      } else {
        await addVideoToPlaylist({ videoId, playlistId });
        toast.success(
          `Added to ${
            localPlaylists.find((playlist) => playlist._id === playlistId)?.name
          }`
        );
      }
    } catch (error) {
      console.error("Failed to update playlist:", error);
      toast.error("Failed to update playlist. Please try again.");
      setLocalPlaylists((prev) =>
        prev.map((playlist) =>
          playlist._id === playlistId
            ? { ...playlist, containsVideo: containsVideo }
            : playlist
        )
      );
    }
  };

  const handleNewPlaylist = () => {
    close();
    openNew();
  };

  return (
    <>
      {/* CreatePlaylist Dialog */}
      <Dialog open={true} onOpenChange={close}>
        <DialogContent className="sm:max-w-[325px] bg-[#202021] text-white rounded-lg shadow-lg p-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Save Video to...
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto">
            {localPlaylists.map((playlist) => {
              const inputId = playlist.name.toLowerCase().replace(" ", "-");
              return (
                <div className="flex items-center gap-3" key={playlist._id}>
                  <input
                    id={inputId}
                    type="checkbox"
                    className="w-5 h-5 text-[#3fa7ff] bg-gray-700 border-gray-600 rounded"
                    checked={playlist.containsVideo}
                    onChange={() =>
                      handleCheckboxChange(playlist._id, playlist.containsVideo)
                    }
                  />
                  <label
                    htmlFor={inputId}
                    className="text-[15px] tracking-wide cursor-pointer"
                  >
                    {playlist.name}
                  </label>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button
              type="button"
              className="w-full bg-[#383838] text-white rounded-3xl"
              variant="secondary"
              onClick={handleNewPlaylist}
            >
              <Plus className="mr-2" />
              <p className="text-lg">New Playlist</p>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default React.memo(CreatePlaylist);
