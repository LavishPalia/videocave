import { Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Sidebar from "@/components/Sidebar";

import Button from "@/components/Button";
import { useGetVideosDataByChannelQuery } from "@/slices/videoApiSlice";
import { VIEW_FORMATTER } from "@/components/VideoGridItems";
import { useAppSelector } from "@/app/hooks";
import { useState } from "react";
import { extractDate } from "@/utils/extractDate";
import { RiDraftLine } from "react-icons/ri";
import { BiTask } from "react-icons/bi";
import { VideoUploadModel } from "@/components/VideoUploadModal";
import StepwiseUpload from "@/components/upload/StepwiseUpload";
// import { toast } from "react-toastify";

/**
 * videos, visibility, date, views, comments, likes
 *
 */

const ChannelContent = () => {
  const [activeTab, setActiveTab] = useState("Videos");
  const { user } = useAppSelector((state) => state.auth);

  const channelId = user?._id;

  const { data: videos, isLoading: isVideosLoading } =
    useGetVideosDataByChannelQuery(channelId, { skip: !channelId });

  const noVideosFound = videos?.data?.length === 0;

  return (
    <div className="flex flex-col max-h-screen">
      <PageHeader />
      <div className="grid grid-cols-[auto,1fr] flex-grow overflow-auto">
        <Sidebar />
        <div className="px-4 pb-4 overflow-x-hidden md:px-8">
          {/* {(isChannelLoading || !channel) && (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 size={40} className="animate-spin" />
              &nbsp;<p className="text-3xl">Loading...</p>
            </div>
          )} */}

          <div className="px-2 pb-4 overflow-x-hidden md:px-8">
            <h1 className="text-3xl font-bold">Channel Content</h1>

            <div className="flex justify-center gap-4 mt-8 sm:justify-start md:gap-6">
              <Button
                variant="ghost"
                className={`dark:hover:bg-transparent tracking-wider p-0 relative
                ${
                  activeTab === "Videos"
                    ? "text-gray-100 font-bold"
                    : "text-gray-400"
                }
              `}
                onClick={() => setActiveTab("Videos")}
              >
                Videos
                {/* Underline */}
                {activeTab === "Videos" && (
                  <span
                    className="absolute -bottom-2 left-0 bg-gray-100 h-0.5 w-full transition-transform"
                    style={{ transform: "translateX(0%)" }}
                  />
                )}
              </Button>
              <Button
                variant="ghost"
                className={`dark:hover:bg-transparent tracking-wider p-0 relative
                ${
                  activeTab === "Playlists"
                    ? "text-gray-100 font-bold"
                    : "text-gray-400"
                }
              `}
                onClick={() => setActiveTab("Playlists")}
              >
                Playlists
                {/* Underline */}
                {activeTab === "Playlists" && (
                  <span
                    className="absolute -bottom-2 left-0 bg-gray-100 h-0.5 w-full transition-transform"
                    style={{ transform: "translateX(0%)" }}
                  />
                )}
              </Button>
              <Button
                variant="ghost"
                className={`dark:hover:bg-transparent tracking-wider p-0 relative
                ${
                  activeTab === "Community"
                    ? "text-gray-100 font-bold"
                    : "text-gray-400"
                }
              `}
                onClick={() => setActiveTab("Community")}
              >
                Community
                {/* Underline */}
                {activeTab === "Community" && (
                  <span
                    className="absolute -bottom-2 left-0 bg-gray-100 h-0.5 w-full transition-transform"
                    style={{ transform: "translateX(0%)" }}
                  />
                )}
              </Button>
            </div>

            <hr className="mt-2" />

            <div className="">
              {isVideosLoading && (
                <div className="flex items-center justify-center min-h-screen">
                  <Loader2 size={40} className="animate-spin" />
                  &nbsp;<p className="text-3xl">Loading videos...</p>
                </div>
              )}

              <div className="grid grid-cols-8 gap-4 py-2 text-sm font-semibold text-center text-gray-300 border-b border-gray-6800/50">
                <span className="col-span-3 text-left">Video</span>
                <span>Visibility</span>
                <span>Date</span>
                <span>Views</span>
                <span>comments</span>
                <span>Likes</span>
              </div>

              {noVideosFound && (
                <div className="flex flex-col items-center justify-center space-y-2 min-h-48">
                  <p>This channel has not created any content yet.</p>
                  <p className="mt-2 text-2xl">
                    Start by uploading your first video and see them come to
                    life here.
                  </p>

                  <VideoUploadModel />
                </div>
              )}

              {videos?.data?.map(
                (video: {
                  thumbnail: string;
                  title: string;
                  duration: number;
                  likes: number;
                  videoFile: string;
                  description: string;
                  comments: number;
                  isPublished: boolean;
                  _id: string;
                  views: number | bigint;
                  createdAt: Date;
                }) => (
                  <div
                    className="grid items-center grid-cols-8 gap-4 py-2 text-sm text-gray-200"
                    key={video._id}
                  >
                    {/* Video */}
                    <section className="flex items-start col-span-3 gap-4">
                      <a
                        href={`/watch?v=${video._id}`}
                        className="flex-shrink-0"
                      >
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="object-cover object-center rounded-lg w-28 aspect-video"
                          loading="lazy"
                        />
                      </a>

                      <div>
                        <a
                          href={`/watch?v=${video._id}`}
                          className="max-w-full text-sm font-medium line-clamp-1 md:max-w-[224px]"
                        >
                          {video.title}
                        </a>

                        <StepwiseUpload
                          initialStep={2}
                          type="Edit"
                          editData={{
                            ...video,
                            visibility: video.isPublished
                              ? "public"
                              : "private",
                          }}
                        />
                      </div>
                    </section>

                    {/* Visibility */}
                    <div className="text-center">
                      {video.isPublished ? (
                        <p className="flex items-center justify-center gap-2">
                          <BiTask size={14} />
                          Public
                        </p>
                      ) : (
                        <p className="flex items-center justify-center gap-2">
                          <RiDraftLine size={14} />
                          Draft
                        </p>
                      )}
                    </div>

                    {/* Date */}
                    <div className="text-center">
                      {extractDate(video.createdAt)}
                    </div>

                    {/* Views */}
                    <div className="text-lg text-center">
                      {VIEW_FORMATTER.format(video.views)}
                    </div>

                    {/* Comments */}
                    <div className="text-lg text-center">
                      {VIEW_FORMATTER.format(video.comments)}
                    </div>

                    {/* Likes */}
                    <div className="text-lg text-center">
                      {VIEW_FORMATTER.format(video.likes)}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelContent;
