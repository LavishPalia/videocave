// create a new playlist while publishing a video

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { useCreatePlaylistMutation } from "@/slices/playlistApiSlice";
import { useState } from "react";
import { toast } from "react-toastify";

interface NewChannelPlaylistProps {
  onNewPlaylistCreate: (newPlaylistId: string, newPlaylistName: string) => void;
}

const NewChannelPlaylist = ({
  onNewPlaylistCreate,
}: NewChannelPlaylistProps) => {
  const [playlistTitle, setPlaylistTitle] = useState<string>("");
  const [playlistDescription, setPlaylistDescription] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createPlaylist, { isLoading }] = useCreatePlaylistMutation({});

  const handleCreatePlaylist = async () => {
    if (!playlistTitle.trim() || !playlistDescription.trim()) {
      toast.error("Both title and description are required");
      return;
    }
    try {
      const response = await createPlaylist({
        name: playlistTitle,
        description: playlistDescription,
      }).unwrap();

      const createdPlaylist = response.data;

      // console.log(createdPlaylist);

      setIsModalOpen(false);
      onNewPlaylistCreate(createdPlaylist._id, createdPlaylist.name);
    } catch (error) {
      console.log("Failed to add video to playlist: ", error);
      toast.error("Failed to add video to playlist");
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#282829] text-white hover:bg-[#282826] rounded-3xl px-8 text-lg">
          New Playlist
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] bg-[#383838] text-white rounded-3xl px-6 py-5">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            New Playlist
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          {/* Title Field */}
          <div className="relative">
            <textarea
              id="name"
              value={playlistTitle}
              rows={3}
              placeholder=" "
              className="peer bg-[#282828] text-white placeholder-transparent border border-gray-600 rounded-lg px-3 py-8 focus:outline-none focus:ring-2 focus:ring-gray-500 w-full"
              onChange={(e) => setPlaylistTitle(e.target.value)}
            />
            <label
              htmlFor="name"
              className="absolute left-3 top-3 text-gray-400 text-sm transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-focus:top-[4px] peer-focus:text-xs peer-focus:text-gray-300"
            >
              Title
            </label>
          </div>

          {/* Description Field */}
          <div className="relative">
            <textarea
              id="description"
              value={playlistDescription}
              placeholder=" "
              rows={5}
              className="peer bg-[#282828] text-white placeholder-transparent border border-gray-600 rounded-lg px-3 py-8 focus:outline-none focus:ring-2 focus:ring-gray-500 w-full"
              onChange={(e) => setPlaylistDescription(e.target.value)}
            />
            <label
              htmlFor="description"
              className="absolute left-3 top-3 text-gray-400 text-sm transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-focus:top-[4px] peer-focus:text-sm peer-focus:text-gray-300"
            >
              Description
            </label>
          </div>
        </div>
        <DialogFooter>
          <div className="flex w-full gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-full px-4 py-2 text-gray-400 border border-gray-500 rounded-3xl hover:bg-gray-700"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>

            {/* new playlist creation */}
            <Button
              type="submit"
              variant="outline"
              className="w-full px-4 py-2 text-white bg-blue-600 rounded-3xl hover:bg-blue-700"
              onClick={handleCreatePlaylist}
              disabled={
                isLoading || playlistTitle === "" || playlistDescription === ""
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 animate-spin" />
                  <p>Creating...</p>
                </>
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewChannelPlaylist;
