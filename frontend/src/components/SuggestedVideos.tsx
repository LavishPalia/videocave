import { formatDuration } from "@/utils/formatDuration";
import { formatTimeAgo } from "@/utils/formatTimeAgo";
import { VIEW_FORMATTER } from "@/components/VideoGridItems";
import { FaCircleCheck } from "react-icons/fa6";
import VideoOptionsMenu from "./dropdowns/VideoOptionsMenu";

interface Video {
  _id: string;
  thumbnail: string;
  duration: number;
  title: string;
  owner: { _id: string; fullName: string; userName: string };
  views: number;
  createdAt: string | number | Date;
}

interface SuggestedVideosProps {
  videos: {
    data?: {
      videos?: Video[];
    };
  };
  setVideoId: (id: string) => void;
}

const SuggestedVideos: React.FC<SuggestedVideosProps> = ({
  videos,
  setVideoId,
}) => {
  return (
    <div className="relative flex flex-col gap-2 p-4 sm:p-6 md:p-8 lg:pb-4 lg:pt-0 lg:px-4">
      {videos?.data?.videos?.map((item) => (
        <div
          className="relative flex flex-col gap-2 sm:flex-row sm:gap-4"
          key={item._id}
        >
          <a
            href={`?v=${item._id}`}
            className="relative block w-full sm:w-[40%] md:w-[45%] lg:w-[40%] aspect-video shrink-0"
            onClick={() => setVideoId(item._id)}
          >
            <img
              src={item.thumbnail}
              className="block w-full h-full object-cover transition-[border-radius] duration-200 rounded-lg"
              loading="lazy"
            />
            <div className="absolute bottom-1 right-1 bg-secondary-marginal-dark bg-opacity-65 text-white font-semibold text-xs px-1 py-0.5 rounded">
              {formatDuration(item.duration)}
            </div>
          </a>

          <div className="flex flex-col mt-2 sm:mt-0">
            <a
              href={`/watch?v=${item._id}`}
              className="text-sm font-semibold sm:text-[0.9rem] line-clamp-2 w-[80%]"
            >
              {item.title}
            </a>
            <a
              href={`/user/${item.owner.userName}`}
              className="flex items-center gap-1 text-sm text-secondary-marginal-text"
            >
              {item.owner.fullName}
              <FaCircleCheck size={12} className="hidden sm:inline" />
            </a>
            <div className="mt-1 text-xs sm:text-sm text-secondary-marginal-text sm:mt-0">
              {VIEW_FORMATTER.format(item.views)} Views •{" "}
              {formatTimeAgo(new Date(item.createdAt))}
            </div>
          </div>
          <VideoOptionsMenu videoId={item._id} />
        </div>
      ))}
    </div>
  );
};

export default SuggestedVideos;
