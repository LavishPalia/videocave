import { formatDuration } from "@/utils/formatDuration";
import { formatTimeAgo } from "@/utils/formatTimeAgo";
import { GoUnmute } from "react-icons/go";
import { BiVolumeMute } from "react-icons/bi";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export type VideoGridItemProps = {
  _id: string;
  title: string;
  owner: [
    {
      fullName: string;
      _id: string;
      avatar: string;
      userName: string;
    }
  ];
  views: number;
  createdAt: Date;
  duration: number;
  thumbnail: string;
  videoFile: string;
};

export const VIEW_FORMATTER = new Intl.NumberFormat(undefined, {
  notation: "compact",
});

const VideoGridItems = ({
  _id,
  title,
  thumbnail,
  videoFile,
  views,
  owner,
  createdAt,
  duration,
}: VideoGridItemProps) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [remainingDuration, setRemainingDuration] = useState(duration);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // console.log("useEffect fired");
    const videoElement = videoRef.current;

    if (!videoElement) return;

    const handleTimeUpdate = () => {
      const remainingTime = duration - videoElement.currentTime;
      setRemainingDuration(Math.max(remainingTime, 0));
    };

    if (isVideoPlaying) {
      videoElement.currentTime = 0;
      videoElement.play();
      videoElement.addEventListener("timeupdate", handleTimeUpdate);
    } else {
      videoElement.pause();
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      setRemainingDuration(duration); // Reset remaining duration when video stops
    }

    return () => {
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [isVideoPlaying, duration]);

  return (
    <div
      className="flex flex-col gap-2"
      onMouseEnter={() => setIsVideoPlaying(true)}
      onMouseLeave={() => setIsVideoPlaying(false)}
    >
      <div className="relative overflow-hidden aspect-video">
        <Link to={`watch?v=${_id}`} className="relative aspect-video">
          <img
            src={thumbnail}
            className={`block w-full h-full object-cover transition-[border-radius] duration-200 ${
              isVideoPlaying ? "rounded-none" : "rounded-xl"
            }`}
          />
          <video
            ref={videoRef}
            muted={isVideoMuted}
            playsInline
            className={`block h-full object-cover absolute inset-0 transition-opacity duration-200 ${
              isVideoPlaying ? "opacity-100 delay-200" : "opacity-0"
            }`}
            src={videoFile}
          />
          <div className="absolute bottom-1 right-1 bg-secondary-marginal-dark text-white text-sm px-1 py-0.5 rounded">
            {formatDuration(remainingDuration)}
          </div>
        </Link>
        {isVideoPlaying && (
          <div>
            {isVideoMuted ? (
              <BiVolumeMute
                className="absolute top-4 right-1 bg-secondary-marginal-dark text-secondary-marginal rounded-full p-1"
                size={20}
                onClick={() => setIsVideoMuted(false)}
              />
            ) : (
              <GoUnmute
                className="absolute top-4 right-1 bg-secondary-marginal-dark text-secondary-marginal rounded-full p-1"
                size={20}
                onClick={() => setIsVideoMuted(true)}
              />
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Link to={`/user/${owner[0].userName}`} className="flex-shrink-0">
          <img
            src={owner[0].avatar}
            className="size-10 rounded-full object-cover"
          />
        </Link>

        <div className="flex flex-col w-[80%]">
          <Link to={`/watch?v=${_id}`} className="font-bold line-clamp-2">
            {title}
          </Link>
          <Link
            to={`/user/${owner[0].userName}`}
            className="text-secondary-marginal-text text-sm"
          >
            {owner[0].fullName}
          </Link>
          <div className="text-secondary-marginal-text text-sm">
            {VIEW_FORMATTER.format(views)} Views •{" "}
            {formatTimeAgo(new Date(createdAt))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoGridItems;
