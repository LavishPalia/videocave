import { EllipsisVertical, Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Sidebar from "@/components/Sidebar";
import { formatTimeAgo } from "@/utils/formatTimeAgo";

import { useAppSelector } from "@/app/hooks";
import "react-toastify/dist/ReactToastify.css";
import { useGetUserPlaylistsQuery } from "@/slices/playlistApiSlice";
import NoThumbnail from "../assets/no_thumbnail.png";
import Button from "@/components/Button";

interface IPlaylist {
  name: string;
  description: string;
  _id: string;
  updatedAt: string;
  videos: {
    _id: string;
    title: string;
    duration: number;
    thumbnail: string;
    views: number;
  }[];
}

const PlaylistsScreen = () => {
  const { user } = useAppSelector((state) => state.auth);
  const userId = user?._id;

  const { data: playlists, isLoading: isPlaylistsLoading } =
    useGetUserPlaylistsQuery(userId);

  const noPlaylistsFound = !isPlaylistsLoading && playlists?.data?.length === 0;

  return (
    <div className="flex flex-col h-screen">
      <PageHeader />
      <div className="grid grid-cols-[auto,1fr] flex-grow overflow-hidden">
        <Sidebar />
        <div className="px-4 pb-6 overflow-auto md:px-8">
          {isPlaylistsLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 size={48} className="animate-spin text-muted" />
              <p className="ml-4 text-2xl font-medium">Loading playlists...</p>
            </div>
          ) : noPlaylistsFound ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-3xl font-semibold text-muted-foreground">
                No playlists found.
              </p>
              <p className="mt-2 text-lg text-muted-foreground">
                Start creating one to see it here!
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {playlists?.data?.map((playlist: IPlaylist) => {
                const firstVideo = playlist.videos[0];
                let watchUrl = firstVideo
                  ? `/watch?v=${firstVideo._id}&list=${playlist._id}`
                  : `/playlist?list=${playlist._id}`;
                return (
                  <div
                    key={playlist._id}
                    className="flex flex-col rounded-lg shadow-md"
                  >
                    <a href={watchUrl} className="block">
                      <img
                        src={playlist?.videos[0]?.thumbnail || NoThumbnail}
                        alt={playlist.name}
                        className="object-cover w-full h-full rounded-lg aspect-video"
                        loading="lazy"
                      />
                    </a>
                    <div className="relative py-2">
                      <a href={watchUrl}>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 max-w-[70%]">
                          {playlist.name}
                        </h2>
                      </a>
                      <div className="flex items-center gap-2 my-2">
                        <p className="text-sm text-muted-foreground">
                          updated {formatTimeAgo(new Date(playlist.updatedAt))}{" "}
                          •
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {playlist.videos.length}{" "}
                          {playlist.videos.length === 1 ? "video" : "videos"}
                        </p>
                      </div>

                      <a href={`/playlist?list=${playlist._id}`}>
                        View full playlist
                      </a>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-1"
                        aria-label="Playlist Options"
                      >
                        <EllipsisVertical />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistsScreen;
