import { IVideo } from "@/types";
import { Loader2 } from "lucide-react";

const VideoPlayer = ({
  isLoading,
  video,
}: {
  isLoading: boolean;
  video: IVideo;
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={40} className="animate-spin" />
        &nbsp;<p className="text-3xl">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <video
        className="w-full rounded-lg dark:shadow-custom dark:shadow-neutral-900 aspect-video"
        src={video?.videoFile}
        autoPlay
        controls
      ></video>
    </>
  );
};

export default VideoPlayer;
