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
  useCreatePlaylistMutation,
} from "@/slices/playlistApiSlice";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface INewPlaylistProps {
  videoId: string;
  close: () => void;
}

const NewPlaylist = ({ close, videoId }: INewPlaylistProps) => {
  const [playlistTitle, setPlaylistTitle] = useState<string>("");
  const [playlistDescription, setPlaylistDescription] = useState<string>("");

  const [createPlaylist, { isLoading }] = useCreatePlaylistMutation({});
  const [addVideoToPlaylist] = useAddVideoToPlaylistMutation({});

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

      await addVideoToPlaylist({
        videoId,
        playlistId: createdPlaylist._id,
      }).unwrap();

      toast.success(`Added to ${createdPlaylist.name}`);

      setTimeout(() => {
        close();
      }, 1000);
    } catch (error) {
      console.log("Failed to add video to playlist: ", error);
      toast.error("Failed to add video to playlist");
    }
  };

  return (
    <>
      <Dialog open={true} onOpenChange={close}>
        <DialogContent className="sm:max-w-[325px] bg-[#383838] text-white rounded-3xl px-6 py-5">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">
              New Playlist
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            {/* Title Field */}
            <div className="relative">
              <input
                id="name"
                value={playlistTitle}
                placeholder=" "
                className="peer bg-[#282828] text-white placeholder-transparent border border-gray-600 rounded-lg px-3 py-4 focus:outline-none focus:ring-2 focus:ring-gray-500 w-full"
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
                className="peer bg-[#282828] text-white placeholder-transparent border border-gray-600 rounded-lg px-3 py-5 focus:outline-none focus:ring-2 focus:ring-gray-500 w-full"
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
                onClick={close}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="outline"
                className="w-full px-4 py-2 text-white bg-blue-600 rounded-3xl hover:bg-blue-700"
                onClick={handleCreatePlaylist}
                disabled={
                  isLoading ||
                  playlistTitle === "" ||
                  playlistDescription === ""
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
    </>
  );
};

export default NewPlaylist;
