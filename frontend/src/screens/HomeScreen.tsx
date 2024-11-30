import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import PageHeader from "@/components/PageHeader";
import Sidebar from "@/components/Sidebar";
import VideoGridItems, {
  VideoGridItemProps,
} from "@/components/VideoGridItems";
import VideoCardShimmer from "@/shimmers/VideoCardShimmer";

import { useGetAllVideosQuery } from "@/slices/videoApiSlice";

const HomeScreen = () => {
  const [page, setPage] = useState(1);
  const [videos, setVideos] = useState<VideoGridItemProps[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const contentRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, isFetching } = useGetAllVideosQuery(
    {
      page,
      limit: 12,
    },
    {
      skip: !hasMore,
    }
  );

  useEffect(() => {
    if (data?.data?.videos) {
      setVideos((prevVideos) => [...prevVideos, ...data.data.videos]);
      setHasMore(page < data.data.totalPages);
    } else if (data?.data?.totalPages === 0) {
      setHasMore(false); // No more data available
    }
  }, [data]);

  const handleScroll = useCallback(() => {
    const container = contentRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;

    if (
      scrollHeight - scrollTop <= clientHeight + 50 &&
      !isFetching &&
      hasMore
    ) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [isFetching, hasMore]);

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const renderedVideos = useMemo(
    () =>
      videos?.map((video: VideoGridItemProps) => (
        <VideoGridItems key={video._id} {...video} />
      )),
    [videos]
  );

  const noVideosFound = !isLoading && videos?.length === 0;

  return (
    <section className="flex flex-col max-h-screen">
      <PageHeader />
      <div className="grid grid-cols-[auto,1fr] flex-grow overflow-auto">
        <Sidebar />
        <div ref={contentRef} className="px-4 pb-4 overflow-x-hidden md:px-8">
          {noVideosFound ? (
            <div className="flex items-center justify-center min-h-screen">
              <p className="text-3xl">No videos found.</p>
            </div>
          ) : (
            <>
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
            </>
          )}
          <div
            className={`grid gap-4 ${
              videos?.length
                ? "grid-cols-[repeat(auto-fill,minmax(300px,1fr))]"
                : ""
            }`}
          >
            {renderedVideos}
          </div>

          {isFetching && (
            <div className="flex items-center justify-center py-4">
              <div className="w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
              <p className="ml-2 text-lg text-gray-300">
                Loading more videos...
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HomeScreen;
