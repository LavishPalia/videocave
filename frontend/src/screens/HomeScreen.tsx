import { useGetAllVideosQuery } from "@/slices/videoApiSlice";
import { Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Sidebar from "@/components/Sidebar";
import VideoGridItems, {
  VideoGridItemProps,
} from "@/components/VideoGridItems";

const HomeScreen = () => {
  const { data: videos, isLoading } = useGetAllVideosQuery(null);
  const videoData = videos?.data?.searchedVideos;

  return (
    <div className="max-h-screen flex flex-col">
      <PageHeader />
      <div className="grid grid-cols-[auto,1fr] flex-grow overflow-auto">
        <Sidebar />
        <div className="overflow-x-hidden px-4 md:px-8 pb-4">
          {isLoading && (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 size={40} className="animate-spin" />
              &nbsp;<p className="text-3xl">Loading...</p>
            </div>
          )}
          <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
            {videoData?.map((video: VideoGridItemProps) => (
              <VideoGridItems key={video._id} {...video} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
