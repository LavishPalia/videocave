// import React from "react";
// @ts-ignore
import ColorThief from "colorthief";

import Button from "@/components/Button";
import PageHeader from "@/components/PageHeader";
import Sidebar from "@/components/Sidebar";
import { VIEW_FORMATTER } from "@/components/VideoGridItems";
import { formatDuration } from "@/utils/formatDuration";
import { EllipsisVertical, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useGetPlaylistByIdQuery } from "@/slices/playlistApiSlice";
import { formatTimeAgo } from "@/utils/formatTimeAgo";

interface IPlayListVideo {
  _id: string;
  thumbnail: string;
  duration: number;
  title: string;
  views: number;
  updatedAt: string;
  owner: {
    fullName: string;
    userName: string;
    _id: string;
  };
}

const SinglePlayListScreen = ({ listId }: { listId: string }) => {
  const [gradient, setGradient] = useState("");

  const { data: playlist, isLoading: playlistLoading } =
    useGetPlaylistByIdQuery(listId);

  console.log(playlist);

  useEffect(() => {
    if (playlist?.data?.videos?.length > 0) {
      const img = document.createElement("img");
      img.crossOrigin = "Anonymous";
      img.src = playlist?.data?.videos[0]?.thumbnail;

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
  }, [playlist]);

  const noPlaylistFound = !playlistLoading && !playlist?.data?.videos?.length;

  return (
    <section className="flex flex-col max-h-screen">
      <PageHeader />
      <div className="grid grid-cols-[auto,1fr] flex-grow overflow-auto">
        <Sidebar />
        <div className="px-4 pb-4 overflow-x-hidden md:px-8">
          {playlistLoading ? (
            <div className="flex flex-col items-center justify-center min-h-screen gap-8">
              <Loader2 size={48} className="animate-spin" />
              <p className="text-4xl">Loading Data...</p>
            </div>
          ) : noPlaylistFound ? (
            <div className="flex flex-col items-center justify-start min-h-screen">
              <p className="text-2xl"> No Videos in the playlist.</p>
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
                {playlist?.data?.videos[0]?.thumbnail && (
                  <img
                    src={playlist?.data?.videos[0]?.thumbnail}
                    alt="liked videos"
                    className="object-fill origin-center rounded-md aspect-video"
                  />
                )}
                <h1 className="mt-1 text-3xl font-semibold lg:mt-0 lg:text-2xl">
                  {playlist?.data?.name}
                </h1>

                <div className="flex items-center gap-2 text-left">
                  {/* <p className="text-xl lg:text-lg">
                    {loggedInUser?.data?.fullName || "User"}
                  </p> */}
                  <p>Playlist</p> •
                  <p className="text-lg lg:text-[16px]">
                    {playlist?.data?.videos?.length} Videos
                  </p>
                </div>

                <div>
                  <p>{playlist?.data?.description}</p>
                </div>
              </section>

              {/* Right Section */}
              <section className="py-2">
                {playlist?.data?.videos?.map(
                  (video: IPlayListVideo, index: number) => (
                    <div
                      className="relative flex gap-2 pb-4 md:gap-4"
                      key={video._id}
                    >
                      <Link
                        to={`/watch?v=${video._id}&list=${listId}&index=${
                          index + 1
                        }`}
                        className="relative block min-w-20 max-h-20 md:min-w-40 md:max-h-40 aspect-video shrink-0"
                      >
                        <img
                          src={video.thumbnail}
                          className="block w-full h-full object-cover transition-[border-radius] duration-200 rounded-xl"
                        />
                        <div className="absolute bottom-1 right-1 bg-secondary-marginal-dark bg-opacity-90 text-white font-semibold text-[8px] md:text-sm px-1 py-0.5 rounded">
                          {formatDuration(video.duration)}
                        </div>
                      </Link>

                      <div
                        className={`flex gap-6 text-gray-400 absolute top-16 right-2`}
                      >
                        <Button
                          variant="ghost"
                          className="rounded-full dark:hover:bg-gray-900"
                        >
                          <EllipsisVertical
                            size={24}
                            className="cursor-pointer"
                          />
                        </Button>
                      </div>

                      <div className="flex flex-col w-[150px] md:w-[480px]">
                        <Link
                          to={`/watch?v=${video._id}&list=${listId}&index=${index}`}
                          className="text-lg font-bold md:text-xl line-clamp-2 lg:line-clamp-3"
                        >
                          {video.title}
                        </Link>
                        <Link
                          to={`/user/${video.owner.userName}`}
                          className="flex flex-wrap gap-2 items-center text-secondary-marginal-text text-[10px] lg:text-xs"
                        >
                          <p className="font-medium">{video.owner.fullName}</p>•
                          <div className="text-secondary-marginal-text">
                            {VIEW_FORMATTER.format(video.views)} Views
                          </div>
                          •<div>{formatTimeAgo(new Date(video.updatedAt))}</div>
                        </Link>
                      </div>
                    </div>
                  )
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SinglePlayListScreen;
