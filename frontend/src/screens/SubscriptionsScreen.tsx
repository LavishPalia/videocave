import { useEffect, useMemo } from "react";

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

  const {
    data: latestVideos,
    isLoading,
    refetch: refetchLatestVideos,
  } = useGetLatestVideoFromSubscribedChannelsQuery(user?._id);

  const videoData = latestVideos?.data || [];
  const noVideosFound = !isLoading && videoData.length === 0;

  useEffect(() => {
    refetchLatestVideos();
  }, []);

  const renderedVideos = useMemo(
    () =>
      videoData?.map((video: VideoGridItemProps) => {
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
          {isLoading ? (
            <div
              className={`grid gap-4 grid-cols-[repeat(auto-fill,minmax(300px,1fr))] ${
                isLoading ? "min-h-screen" : ""
              }`}
            >
              {Array.from({ length: 30 }).map((_el, i) => {
                return <VideoCardShimmer key={i} />;
              })}
            </div>
          ) : (
            noVideosFound && (
              <div className="flex flex-col items-center justify-start min-h-screen">
                <p className="text-2xl">No Subscriptions Found.</p>
                <p className="text-3xl">
                  Start subscribing to channels to see their latest videos
                </p>
              </div>
            )
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
