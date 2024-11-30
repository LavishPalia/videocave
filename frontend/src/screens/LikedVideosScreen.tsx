// import React from "react";
// @ts-ignore
import ColorThief from "colorthief";

import Button from "@/components/Button";
import PageHeader from "@/components/PageHeader";
import Sidebar from "@/components/Sidebar";
import { VIEW_FORMATTER } from "@/components/VideoGridItems";
import { useGetLikedVideosQuery } from "@/slices/likesApiSlice";
import { useGetCurrentUserQuery } from "@/slices/usersApiSlice";
import { formatDuration } from "@/utils/formatDuration";
import { EllipsisVertical, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ILikedVideo {
  _id: string;
  thumbnail: string;
  title: string;
  duration: number;
  views: number;
  createdAt: string;
  owner: {
    fullName: string;
    userName: string;
    _id: string;
  };
}

const LikedVideosScreen = () => {
  const [gradient, setGradient] = useState("");

  const {
    data: likedVideos,
    isLoading: likedVideosLoading,
    refetch: refetchLikedVideos,
  } = useGetLikedVideosQuery({});

  const { data: loggedInUser } = useGetCurrentUserQuery(null);

  useEffect(() => {
    refetchLikedVideos();
  }, [refetchLikedVideos]);

  useEffect(() => {
    if (likedVideos?.data?.length > 0) {
      const img = document.createElement("img");
      img.crossOrigin = "Anonymous";
      img.src = likedVideos?.data[0]?.thumbnail;

      img.onload = () => {
        const colorthief = new ColorThief();
        const dominantColor = colorthief.getColor(img);
        const palette = colorthief.getPalette(img, 2);

        const gradient = `linear-gradient(
          to bottom, 
          rgba(${dominantColor.join(",")}, 0.9), 
          rgba(${palette[1].join(",")}, 0.03)
        )`;

        setGradient(gradient);
      };
    }
  }, [likedVideos]);

  const noVideosFound = !likedVideosLoading && !likedVideos?.data?.length;

  return (
    <section className="flex flex-col max-h-screen">
      <PageHeader />
      <div className="grid grid-cols-[auto,1fr] flex-grow overflow-auto">
        <Sidebar />
        <div className="px-4 pb-4 overflow-x-hidden md:px-8">
          {likedVideosLoading ? (
            <div className="flex flex-col items-center justify-center min-h-screen gap-8">
              <Loader2 size={48} className="animate-spin" />
              <p className="text-4xl">Loading Data...</p>
            </div>
          ) : noVideosFound ? (
            <div className="flex flex-col items-center justify-start min-h-screen">
              <p className="text-2xl"> No liked videos found.</p>
              <p className="text-3xl">
                Start exploring the world of videos and find your favorites.
              </p>
            </div>
          ) : (
            <div className="flex flex-col lg:grid gap-4 md:grid-cols-[360px,_minmax(0,1fr)]">
              {/* Left Section */}
              <section
                className="relative lg:sticky top-0 flex flex-col items-start justify-start gap-4 px-4 py-2 rounded-md lg:h-[600px]"
                style={{ background: gradient }}
              >
                {likedVideos?.data[0]?.thumbnail && (
                  <img
                    src={likedVideos.data[0]?.thumbnail}
                    alt="liked videos"
                    className="object-fill origin-center rounded-md aspect-video"
                    loading="lazy"
                  />
                )}
                <h1 className="mt-1 text-3xl font-semibold lg:mt-0 lg:text-2xl">
                  Liked Videos
                </h1>

                <div className="flex flex-col gap-1 text-left lg:gap-0">
                  <p className="text-xl lg:text-lg">
                    {loggedInUser?.data?.fullName || "User"}
                  </p>
                  <p className="text-lg lg:text-[16px]">
                    {likedVideos?.data?.length} Videos
                  </p>
                </div>
              </section>

              {/* Right Section */}
              <section className="py-2">
                {likedVideos?.data?.map((video: ILikedVideo) => (
                  <div
                    className="relative flex gap-2 pb-4 md:gap-4"
                    key={video._id}
                  >
                    <a
                      href={`/watch?v=${video._id}`}
                      className="relative block min-w-20 max-h-20 md:min-w-40 md:max-h-40 aspect-video shrink-0"
                    >
                      <img
                        src={video.thumbnail}
                        className="block h-full aspect-video object-cover transition-[border-radius] duration-200 rounded-xl"
                        loading="lazy"
                      />
                      <div className="absolute bottom-1 right-1 bg-secondary-marginal-dark bg-opacity-90 text-white font-semibold text-[8px] md:text-sm px-1 py-0.5 rounded">
                        {formatDuration(video.duration)}
                      </div>
                    </a>

                    <div
                      className={`flex gap-6 text-gray-400 absolute top-0 right-2`}
                    >
                      <Button
                        variant="ghost"
                        className="rounded-full dark:hover:bg-gray-900"
                      >
                        <EllipsisVertical className="cursor-pointer size-5 md:size-6" />
                      </Button>
                    </div>

                    <div className="flex flex-col w-[200px] md:w-[480px]">
                      <a
                        href={`/watch?v=${video._id}`}
                        className="text-[10px] font-bold md:text-xl max-w-[70%] md:max-w-[80%] line-clamp-2"
                      >
                        {video.title}
                      </a>
                      <a
                        href={`/user/${video.owner.userName}`}
                        className="flex flex-wrap gap-0 items-start md:flex-row md:gap-2 md:items-center flex-col text-secondary-marginal-text text-[8px] lg:text-xs"
                      >
                        <p className="font-medium">{video.owner.fullName}</p> •
                        <div className="text-secondary-marginal-text">
                          {VIEW_FORMATTER.format(video.views)} Views
                        </div>
                      </a>
                    </div>
                  </div>
                ))}
              </section>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default LikedVideosScreen;
