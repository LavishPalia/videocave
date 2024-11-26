import React, { useEffect } from "react";
import { Loader2, X } from "lucide-react";
import { formatDuration } from "@/utils/formatDuration";
import { VIEW_FORMATTER } from "@/components/VideoGridItems";
import { FaCircleCheck } from "react-icons/fa6";
import VideoOptionsMenu from "./dropdowns/VideoOptionsMenu";
import { Button } from "@/components/ui/button";

interface WatchHistoryProps {
  history: {
    data: {
      _id: string;
      thumbnail: string;
      duration: number;
      title: string;
      owner: {
        _id: string;
        fullName: string;
        userName: string;
      };
      views: number | bigint;
      description: string;
    }[];
  } | null;
  isLoading: boolean;
  deleteVideoFromWatchHistory: (videoId: string) => void;
  refetchHistory: () => void;
}

const WatchHistory: React.FC<WatchHistoryProps> = ({
  history,
  isLoading,
  deleteVideoFromWatchHistory,
  refetchHistory,
}) => {
  useEffect(() => {
    // Add any cleanup logic here if needed
  }, []); // Empty dependency array ensures this runs only on mount

  const handleRemoveVideo = async (videoId: string) => {
    await deleteVideoFromWatchHistory(videoId);
    refetchHistory();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={40} className="animate-spin" />
        &nbsp;<p className="text-3xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-10">
      <h1 className="pb-4 text-4xl md:pb-8">Watch History</h1>

      {history?.data?.length === 0 ? (
        <div className="flex items-center justify-center text-xl text-gray-200">
          You're all caught up! Start exploring new videos to add to your watch
          history.
        </div>
      ) : (
        history?.data?.map((item) => (
          <div
            className="relative flex flex-col gap-1 pb-4 md:gap-2 md:flex-row"
            key={item._id}
          >
            <a
              href={`/watch?v=${item._id}`}
              className="relative block max-w-48 md:min-w-40 aspect-video shrink-0"
            >
              <img
                src={item.thumbnail}
                className="block w-full h-full object-cover transition-[border-radius] duration-200 rounded-xl"
                loading="lazy"
              />
              <div className="absolute right-6 bottom-1 md:bottom-1 md:right-1 bg-secondary-marginal-dark bg-opacity-90 text-white font-semibold text-[6px] md:text-sm px-1 py-0.5 rounded">
                {formatDuration(item.duration)}
              </div>
            </a>

            <div className="absolute top-0 right-0 flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-10"
                onClick={() => handleRemoveVideo(item._id)}
              >
                <X size={28} className="cursor-pointer" />
              </Button>
            </div>

            <div className="absolute right-0 top-1">
              <VideoOptionsMenu videoId={item._id} playlistName="Watch Later" />
            </div>

            <div className="flex flex-col w-[150px] md:w-[290px]">
              <a
                href={`/watch?v=${item._id}`}
                className="text-sm md:text-xl line-clamp-2"
              >
                {item.title}
              </a>
              <a
                href={`/user/${item.owner.userName}`}
                className="flex gap-2 items-center text-secondary-marginal-text text-[8px] md:text-xs"
              >
                <p>{item.owner.fullName}</p>
                <FaCircleCheck className="size-2 md:size-3" />
                <div className="text-secondary-marginal-text">
                  {VIEW_FORMATTER.format(item.views)} Views
                </div>
              </a>
              <div className="line-clamp-2 mt-4 text-secondary-marginal-text text-[8px] md:text-xs w-[150px] md:w-[380px]">
                {item.description}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default WatchHistory;
