import { useMemo } from "react";

import PageHeader from "@/components/PageHeader";
import Sidebar from "@/components/Sidebar";
import VideoGridItems, {
  VideoGridItemProps,
} from "@/components/VideoGridItems";
import VideoCardShimmer from "@/shimmers/VideoCardShimmer";

import { useAppSelector } from "@/app/hooks";
import { useGetLatestVideoFromSubscribedChannelsQuery } from "@/slices/subscriptionsApiSlice";

const SubscriptionsScreen = () => {
  const { user } = useAppSelector((state) => state.auth);

  const { data: latestVideos, isLoading } =
    useGetLatestVideoFromSubscribedChannelsQuery(user?._id);

  console.log(latestVideos);

  const videoData = latestVideos?.data;

  if (!isLoading && videoData?.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-3xl">No videos found.</p>
      </div>
    );
  }

  const renderedVideos = useMemo(
    () =>
      videoData?.map((video: VideoGridItemProps) => {
        console.log(video);

        return <VideoGridItems key={video._id} {...video} />;
      }),
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
              className={`grid gap-4 grid-cols-[repeat(auto-fill,minmax(300px,1fr))] ${
                isLoading ? "min-h-screen" : ""
              }`}
            >
              {Array.from({ length: 30 }).map((_el, i) => {
                return <VideoCardShimmer key={i} />;
              })}
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

export default SubscriptionsScreen;
