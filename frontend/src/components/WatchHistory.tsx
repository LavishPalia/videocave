import React, { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { EllipsisVertical, Loader2, X } from "lucide-react";
import { formatDuration } from "@/utils/formatDuration";
import { VIEW_FORMATTER } from "@/components/VideoGridItems";
import { FaCircleCheck } from "react-icons/fa6";
import Button from "./Button";

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
  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null);

  const handleMouseEnter = useCallback(
    (videoId: string) => {
      if (videoId !== hoveredVideoId) {
        setHoveredVideoId(videoId);
      }
    },
    [hoveredVideoId]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredVideoId(null);
  }, []);

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
      <h1 className="text-4xl pb-16 md:pb-8">Watch History</h1>

      {history?.data?.length === 0 ? (
        <div className="flex items-center justify-center text-xl text-gray-200">
          You're all caught up! Start exploring new videos to add to your watch
          history.
        </div>
      ) : (
        history?.data?.map((item) => (
          <div
            className="flex gap-2 md:gap-4 pb-4 relative"
            key={item._id}
            onMouseEnter={() => handleMouseEnter(item._id)}
            onMouseLeave={handleMouseLeave}
          >
            <a
              href={`watch?v=${item._id}`}
              className="relative block min-w-20 max-h-20 md:min-w-40 md:max-h-40 aspect-video shrink-0"
            >
              <img
                src={item.thumbnail}
                className="block w-full h-full object-cover transition-[border-radius] duration-200 rounded-xl"
              />
              <div className="absolute bottom-1 right-1 bg-secondary-marginal-dark bg-opacity-90 text-white font-semibold text-[8px] md:text-sm px-1 py-0.5 rounded">
                {formatDuration(item.duration)}
              </div>
            </a>

            <div
              className={`flex gap-6 text-gray-400 ${
                hoveredVideoId === item._id ? "" : "hidden"
              } absolute top-2 right-2`}
            >
              <Button variant="ghost" className="rounded-full p-0 m-0">
                <X
                  size={32}
                  onClick={() => handleRemoveVideo(item._id)}
                  className="cursor-pointer"
                />
              </Button>
              <Button variant="ghost" className="rounded-full p-0 m-0">
                <EllipsisVertical size={32} className="cursor-pointer" />
              </Button>
            </div>

            <div className="flex flex-col w-[150px] md:w-[290px]">
              <a
                href={`/watch?v=${item._id}`}
                className="text-sm md:text-xl line-clamp-2"
              >
                {item.title}
              </a>
              <Link
                to={`/user/${item.owner.userName}`}
                className="flex gap-2 items-center text-secondary-marginal-text text-[8px] md:text-xs"
              >
                <p>{item.owner.fullName}</p>
                <FaCircleCheck size={12} />
                <div className="text-secondary-marginal-text">
                  {VIEW_FORMATTER.format(item.views)} Views
                </div>
              </Link>
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
