import { useState } from "react";
import { Link } from "react-router-dom";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";
import { formatDuration } from "@/utils/formatDuration";
import Button from "./Button";

interface Video {
  _id: string;
  title: string;
  thumbnail: string;
  duration: number;
  owner: {
    userName: string;
    fullName: string;
  };
}

interface PlaylistProps {
  playlist: {
    data: {
      _id: string;
      name: string;
      videos: Video[];
    };
  } | null;
  queryParams: {
    index: number;
  };
}

const CustomPlaylist = ({ playlist, queryParams }: PlaylistProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <div className="mx-4 mb-4 border rounded-lg">
      {isCollapsed ? (
        <header className="relative px-2 py-2 bg-[#0f1f24] shadow-md">
          <h1 className="w-[85%] line-clamp-1 text-[16px] font-bold">
            {Number(queryParams.index) >= playlist?.data.videos?.length!
              ? "End of Playlist"
              : `Next: ${
                  playlist?.data.videos[Number(queryParams.index)].title
                }`}
          </h1>
          <div className="flex gap-2 text-[12px] mt-1 ">
            <Link to={`/playlist?list=${playlist?.data._id}`}>
              {playlist?.data.name}
            </Link>
            -
            <p>
              {queryParams.index} / {playlist?.data.videos.length}
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1"
              onClick={toggleCollapse}
            >
              <RiArrowDownSLine size={24} />
            </Button>
          </div>
        </header>
      ) : (
        <header className="relative px-2 py-2 bg-[#202021] shadow-md">
          <h1 className="text-xl">{playlist?.data.name}</h1>
          <div className="flex gap-2 text-[12px] ">
            <Link
              to={`/user/${
                playlist?.data.videos[Number(queryParams.index) - 1]?.owner
                  .userName
              }`}
            >
              {
                playlist?.data.videos[Number(queryParams.index) - 1]?.owner
                  .fullName
              }
            </Link>
            -
            <p>
              {queryParams.index} / {playlist?.data.videos.length}
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1"
              onClick={toggleCollapse}
            >
              <RiArrowUpSLine size={24} />
            </Button>
          </div>
        </header>
      )}

      <div
        className={`flex flex-col gap-2 rounded-b-lg overflow-y-scroll transition-all duration-300 ${
          isCollapsed ? "max-h-0 hidden" : "max-h-[400px]"
        }`}
      >
        {playlist?.data.videos.map((video: Video, index: number) => (
          <div
            key={video._id}
            className="relative flex items-center gap-2 px-1 py-2"
          >
            <p>{index + 1}</p>
            <Link
              to={`/watch?v=${video._id}&list=${playlist.data._id}&index=${
                index + 1
              }`}
              className="relative block w-full sm:w-[40%] md:w-[45%] lg:w-[35%] aspect-video shrink-0"
            >
              <img
                src={video.thumbnail}
                className="block w-full h-full object-cover transition-[border-radius] duration-200 rounded-lg"
              />
              <div className="absolute bottom-1 right-1 bg-secondary-marginal-dark bg-opacity-65 text-white font-semibold text-xs px-1 py-0.5 rounded">
                {formatDuration(video.duration)}
              </div>
            </Link>

            <div className="flex flex-col mt-2 sm:mt-0">
              <Link
                to={`/watch?v=${video._id}&list=${playlist.data._id}&index=${
                  index + 1
                }`}
                className="text-sm font-semibold line-clamp-2 w-[90%]"
              >
                {video.title}
              </Link>
              <Link
                to={`/user/${video.owner.userName}`}
                className="text-xs text-gray-400"
              >
                {video.owner.fullName}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomPlaylist;
