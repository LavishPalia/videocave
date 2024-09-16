import { useGetAllVideosQuery } from "@/slices/videoApiSlice";
import { Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Sidebar from "@/components/Sidebar";
import VideoGridItems, {
  VideoGridItemProps,
} from "@/components/VideoGridItems";
import { useMemo } from "react";

const HomeScreen = () => {
  const { data: videos, isLoading } = useGetAllVideosQuery(null);
  const videoData = videos?.data?.searchedVideos;

  if (!isLoading && videoData?.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-3xl">No videos found.</p>
      </div>
    );
  }

  const renderedVideos = useMemo(
    () =>
      videoData?.map((video: VideoGridItemProps) => (
        <VideoGridItems key={video._id} {...video} />
      )),
    [videoData]
  );

  return (
    <section className="flex flex-col max-h-screen">
      <PageHeader />
      <div className="grid grid-cols-[auto,1fr] flex-grow overflow-auto">
        <Sidebar />
        <div className="px-4 pb-4 overflow-x-hidden md:px-8">
          {isLoading && (
            <div
              className={`flex items-center justify-center ${
                isLoading ? "min-h-screen" : ""
              }`}
            >
              <Loader2 size={40} className="animate-spin" />
              &nbsp;<p className="text-3xl">Loading...</p>
            </div>
          )}
          <div
            className={`grid gap-4 ${
              videoData?.length
                ? "grid-cols-[repeat(auto-fill,minmax(300px,1fr))]"
                : ""
            }`}
          >
            {renderedVideos}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeScreen;
