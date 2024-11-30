import { formatDuration } from "@/utils/formatDuration";
import { formatTimeAgo } from "@/utils/formatTimeAgo";
import { GoUnmute } from "react-icons/go";
import { BiVolumeMute } from "react-icons/bi";
import { useEffect, useRef, useState } from "react";
import VideoOptionsMenu from "./dropdowns/VideoOptionsMenu";

export type VideoGridItemProps = {
  _id: string;
  title: string;
  owner: {
    fullName: string;
    _id: string;
    avatar: string;
    userName: string;
  };
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
    const videoElement = videoRef.current;

    if (!videoElement) return;

    const handleTimeUpdate = () => {
      const remainingTime = duration - videoElement.currentTime;
      setRemainingDuration(Math.max(remainingTime, 0));
    };

    const toggleVideoState = async () => {
      if (isVideoPlaying) {
        try {
          videoElement.currentTime = 0;
          await videoElement.play();
          videoElement.addEventListener("timeupdate", handleTimeUpdate);
        } catch (error) {
          console.error("Error playing video", error);
        }
      } else {
        videoElement.pause();
        videoElement.removeEventListener("timeupdate", handleTimeUpdate);
        setRemainingDuration(duration); // Reset remaining duration when video stops
      }
    };

    toggleVideoState();

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
        <a href={`/watch?v=${_id}`} className="relative aspect-video">
          <img
            src={thumbnail}
            className={`block w-full h-full object-cover transition-[border-radius] duration-200 ${
              isVideoPlaying ? "rounded-none" : "rounded-xl"
            }`}
            loading="lazy"
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
        </a>
        {isVideoPlaying && (
          <div>
            {isVideoMuted ? (
              <BiVolumeMute
                className="absolute p-[6px] rounded-full cursor-pointer top-4 right-1 bg-secondary-marginal-dark text-secondary-marginal"
                size={28}
                onClick={() => setIsVideoMuted(false)}
              />
            ) : (
              <GoUnmute
                className="absolute p-[6px] rounded-full cursor-pointer top-4 right-1 bg-secondary-marginal-dark text-secondary-marginal"
                size={28}
                onClick={() => setIsVideoMuted(true)}
              />
            )}
          </div>
        )}
      </div>

      <div className="relative flex gap-2">
        <a href={`/user/${owner.userName}`} className="flex-shrink-0">
          <img
            src={owner.avatar}
            className="object-cover rounded-full size-10"
            loading="lazy"
          />
        </a>
        <div className="flex flex-col w-[70%]">
          <a href={`/watch?v=${_id}`} className="font-bold line-clamp-2">
            {title}
          </a>
          <a
            href={`/user/${owner.userName}`}
            className="text-sm text-secondary-marginal-text"
          >
            {owner.fullName}
          </a>
          <div className="text-sm text-secondary-marginal-text">
            {VIEW_FORMATTER.format(views)} Views •{" "}
            {formatTimeAgo(new Date(createdAt))}
          </div>
        </div>

        <VideoOptionsMenu videoId={_id} />
      </div>
    </div>
  );
};

export default VideoGridItems;
