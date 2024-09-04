import { Link } from "react-router-dom";
import { formatDuration } from "@/utils/formatDuration";
import { formatTimeAgo } from "@/utils/formatTimeAgo";
import { VIEW_FORMATTER } from "@/components/VideoGridItems";
import { FaCircleCheck } from "react-icons/fa6";

interface Video {
  _id: string;
  thumbnail: string;
  duration: number;
  title: string;
  owner: { _id: string; fullName: string; userName: string }[];
  views: number;
  createdAt: string | number | Date;
}

interface SuggestedVideosProps {
  videos: {
    data?: {
      searchedVideos?: Video[];
    };
  };
  setVideoId: (id: string) => void;
}

const SuggestedVideos: React.FC<SuggestedVideosProps> = ({
  videos,
  setVideoId,
}) => {
  return (
    <div className="relative flex flex-col gap-2 p-4 sm:p-8 md:pb-4 md:pt-0 md:px-4">
      {videos?.data?.searchedVideos?.map((item) => (
        <div className="flex gap-2" key={item._id}>
          <Link
            to={`?v=${item._id}`}
            className="relative block min-w-44 max-h-24 aspect-video shrink-0"
            onClick={() => setVideoId(item._id)}
          >
            <img
              src={item.thumbnail}
              className="block w-full h-full object-cover transition-[border-radius] duration-200 rounded-lg"
            />
            <div className="absolute bottom-1 right-1 bg-secondary-marginal-dark bg-opacity-65 text-white font-semibold text-xs px-1 py-0.5 rounded">
              {formatDuration(item.duration)}
            </div>
          </Link>

          <div className="flex flex-col">
            <Link
              to={`/watch?v=${item._id}`}
              className="text-sm font-semibold line-clamp-1"
            >
              {item.title}
            </Link>
            <Link
              to={`/user/${item.owner[0].userName}`}
              className="flex items-center gap-1 text-sm text-secondary-marginal-text"
            >
              {item.owner[0].fullName}
              <FaCircleCheck size={12} />
            </Link>
            <div className="text-sm text-secondary-marginal-text">
              {VIEW_FORMATTER.format(item.views)} Views •{" "}
              {formatTimeAgo(new Date(item.createdAt))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SuggestedVideos;
