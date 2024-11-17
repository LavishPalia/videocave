import Button from "@/components/Button";
import CommentsSection from "@/components/CommentsSection";
import PageHeader from "@/components/PageHeader";
import Sidebar from "@/components/Sidebar";
import SuggestedVideos from "@/components/SuggestedVideos";
import { VIEW_FORMATTER } from "@/components/VideoGridItems";
import VideoPlayer from "@/components/VideoPlayer";

import {
  useGetAllVideosQuery,
  useGetVideoByIdQuery,
} from "@/slices/videoApiSlice";
import { formatTimeAgo } from "@/utils/formatTimeAgo";
import { useEffect, useState } from "react";
import { RiShareForwardLine } from "react-icons/ri";
import { BiLike, BiDislike, BiSolidLike } from "react-icons/bi";

import { HiDownload } from "react-icons/hi";

import { FaCircleCheck } from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom";
// import { FaEllipsisH } from "react-icons/fa";
import { useToggleVideoLikesMutation } from "@/slices/likesApiSlice";
import { Bell, BellRing } from "lucide-react";
import { useToggleSubscriptionMutation } from "@/slices/subscriptionsApiSlice";
import { toast, ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const VideoPlayerScreen = () => {
  const [videoId, setVideoId] = useState("");

  const {
    data: video,
    isLoading: isVideoLoading,
    refetch: refetchVideo,
  } = useGetVideoByIdQuery(videoId, { skip: !videoId });
  console.log(video?.data[0]?.isSubscribed);

  const [isDescriptionShown, setIsDescriptionShown] = useState(false);
  const [isLiked, setIsLiked] = useState(video?.data[0]?.isLiked);
  const [isSubscribed, setIsSubscribed] = useState(
    video?.data[0]?.isSubscribed
  );
  const [subscribersCount, setSubscribersCount] = useState<number>(
    video?.data[0]?.subscribers
  );

  console.log(isSubscribed);

  // console.log(isLiked);
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get("v");
    if (id) {
      setVideoId(id);
    }
  }, [location.search]);

  const { data: videos } = useGetAllVideosQuery(null);

  const [toggleVideoLikes] = useToggleVideoLikesMutation();
  const [toggleSubscription] = useToggleSubscriptionMutation();

  useEffect(() => {
    if (video?.data[0]?.isLiked !== undefined) {
      setIsLiked(video?.data[0]?.isLiked);
    }
  }, [video]);

  useEffect(() => {
    if (video?.data[0]?.isSubscribed !== undefined) {
      setIsSubscribed(video?.data[0]?.isSubscribed);
    }

    if (video?.data[0]?.subscribers !== undefined) {
      setSubscribersCount(video?.data[0]?.subscribers);
    }
  }, [video]);

  const handleToggleLike = async () => {
    try {
      await toggleVideoLikes(videoId);
      setIsLiked((prev: boolean) => !prev);
      refetchVideo();
    } catch (error) {
      console.log(error);
    }
  };

  const handleToggleSubscription = async (userId: string) => {
    setIsSubscribed((prev: boolean) => !prev);
    setSubscribersCount((prev) => (isSubscribed ? prev - 1 : prev + 1));

    try {
      await toggleSubscription(userId);
      toast.success(`Subscription ${isSubscribed ? "removed" : "added"}!`);
    } catch (error) {
      setIsSubscribed((prev: boolean) => !prev);
      setSubscribersCount((prev) => (isSubscribed ? prev + 1 : prev - 1));

      toast.error("Failed to update subscription");
    }
  };

  return (
    <div className="flex flex-col max-h-screen">
      <PageHeader />
      <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] xl:grid-cols-[auto,2fr,1fr] gap-4 h-[calc(100vh-64px)] p-2 md:p-3 lg:p-4">
        <div className="overflow-y-auto sticky top-0 h-[calc(100vh-64px)] scrollbar-hidden">
          <Sidebar />
        </div>
        <div className="px-4 pb-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] md:px-8">
          <div
            key={videoId}
            className="w-full max-w-[1000px] flex flex-col mx-auto relative group"
          >
            <VideoPlayer isLoading={isVideoLoading} video={video?.data[0]} />

            <p className="mt-4 text-lg font-semibold sm:text-xl md:text-2xl">
              {video?.data[0]?.title}
            </p>

            <div className="flex flex-col items-start justify-between gap-4 mt-4 lg:flex-row">
              <div className="flex items-start gap-3 lg:w-1/2 xl:w-2/3 sm:w-auto">
                <Link
                  to={`/user/${video?.data[0]?.owner.userName}`}
                  className="flex-shrink-0"
                >
                  <img
                    src={video?.data[0]?.owner.avatar}
                    alt={video?.data[0]?.owner.userName}
                    className="object-cover object-center rounded-full size-10 sm:size-12"
                  />
                </Link>
                <div className="flex items-center justify-between w-full xl:flex-col xl:items-start">
                  <div className="flex-grow min-w-0 max-w-[70%] md:max-w-full">
                    <span className="flex items-center gap-2">
                      <Link
                        to={`/user/${video?.data[0]?.owner.userName}`}
                        className="truncate"
                      >
                        <h1 className="text-sm truncate sm:text-base">
                          {video?.data[0]?.owner.fullName}
                        </h1>
                      </Link>
                      <FaCircleCheck size={16} />
                    </span>
                    <p className="text-sm text-gray-500 sm:text-base">
                      {subscribersCount}{" "}
                      <span className="text-sm">subscribers</span>
                    </p>
                  </div>

                  <Button
                    onClick={() =>
                      handleToggleSubscription(video?.data[0].owner._id)
                    }
                    className={`flex items-center gap-2 px-3 text-sm rounded-3xl w-max self-start flex-shrink-0 ml-2 xl:ml-0 ${
                      isSubscribed
                        ? "text-gray-100 dark:bg-gray-700"
                        : "text-gray-900 dark:bg-gray-200"
                    }`}
                  >
                    {isSubscribed ? <BellRing size={20} /> : <Bell size={20} />}
                    <span>{isSubscribed ? "Subscribed" : "Subscribe"}</span>
                  </Button>
                </div>
                {/* <Button variant="dark" className="px-3 rounded-full">
                Join
              </Button> */}
              </div>

              <div className="flex flex-wrap items-center justify-start gap-2 full sm:gap-3 lg:flex-nowrap lg:w-1/2 xl:w-1/3 lg:justify-end">
                <div className="flex items-center bg-[#31302f] rounded-full">
                  <Button
                    variant="dark"
                    className="flex gap-1 items-center bg-[#31302f] rounded-full rounded-r-none px-2 sm:px-3 text-xs sm:text-sm"
                    onClick={handleToggleLike}
                  >
                    {isLiked ? <BiSolidLike size={20} /> : <BiLike size={20} />}
                    <p>{video?.data[0]?.likes}</p>
                  </Button>

                  <div className="border-l border-gray-300 h-5 bg-[#31302f]" />

                  <Button
                    variant="dark"
                    className="flex gap-1 items-center bg-[#31302f] rounded-full rounded-l-none px-2 sm:px-3"
                  >
                    <BiDislike size={20} />
                  </Button>
                </div>

                <Button
                  variant="dark"
                  className="bg-[#31302f] flex gap-1 items-center justify-center rounded-full px-2 sm:px-3 text-xs sm:text-sm"
                >
                  <RiShareForwardLine size={24} className="text-gray-400" />
                  <p className="hidden sm:inline">Share</p>
                </Button>
                <Button
                  variant="dark"
                  className="bg-[#31302f] flex gap-1 items-center rounded-full justify-center px-2 sm:px-3 text-xs sm:text-sm"
                >
                  <HiDownload size={24} className="text-gray-400" />
                  <p className="hidden sm:inline">Download</p>
                </Button>

                {/* <Button variant="dark" size="icon" className="rounded-full">
                <FaEllipsisH />
              </Button> */}
              </div>
            </div>

            <div className="border shadow-custom bg-[#f2f2f2] p-4 my-4 rounded-md text-md dark:bg-[#09090b]">
              <p>
                {VIEW_FORMATTER.format(video?.data[0]?.views)} views &nbsp;
                {formatTimeAgo(new Date(video?.data[0]?.createdAt))}
              </p>
              <p
                className={`${
                  isDescriptionShown ? "" : "line-clamp-1 cursor-pointer"
                }`}
                onClick={() => setIsDescriptionShown(true)}
              >
                {video?.data[0]?.description}
              </p>

              <button
                onClick={() => setIsDescriptionShown((descShown) => !descShown)}
              >
                {isDescriptionShown ? "Show Less" : "...more"}
              </button>
            </div>
            <CommentsSection videoId={videoId} />
            <div className="block xl:hidden">
              <SuggestedVideos videos={videos} setVideoId={setVideoId} />
            </div>
          </div>
        </div>

        <div className="hidden overflow-y-auto xl:block">
          <SuggestedVideos videos={videos} setVideoId={setVideoId} />
        </div>
      </div>

      <ToastContainer
        autoClose={2000}
        hideProgressBar={true}
        position="bottom-left"
        theme="dark"
        transition={Slide}
        stacked
      />
    </div>
  );
};

export default VideoPlayerScreen;
