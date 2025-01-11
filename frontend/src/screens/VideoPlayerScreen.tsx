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
import { useLocation } from "react-router-dom";
// import { FaEllipsisH } from "react-icons/fa";
import { useToggleVideoLikesMutation } from "@/slices/likesApiSlice";
import { Bell, BellRing } from "lucide-react";
import { useToggleSubscriptionMutation } from "@/slices/subscriptionsApiSlice";
import { toast } from "react-toastify";
import { useGetPlaylistByIdQuery } from "@/slices/playlistApiSlice";
import CustomPlaylist from "@/components/CustomPlayList";
import { useGetCurrentUserQuery } from "@/slices/usersApiSlice";
import { saveUserSubscriptions } from "@/slices/subscriptionsSlice";
import { useAppDispatch } from "@/app/hooks";

const VideoPlayerScreen = () => {
  const [videoId, setVideoId] = useState("");
  const [queryParams, setQueryParams] = useState<{
    list: string | null;
    index: string | number;
  }>({
    list: null,
    index: 1,
  });

  const {
    data: video,
    isLoading: isVideoLoading,
    isFetching: isFetchingVideo,
    refetch: refetchVideo,
  } = useGetVideoByIdQuery(videoId, { skip: !videoId });

  const [isDescriptionShown, setIsDescriptionShown] = useState(false);
  const [isLiked, setIsLiked] = useState(video?.data?.isLiked);
  const [isSubscribed, setIsSubscribed] = useState(video?.data?.isSubscribed);

  const [subscribersCount, setSubscribersCount] = useState<number>(
    video?.data?.subscribers
  );

  const location = useLocation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);

    const id = searchParams.get("v");
    const list = searchParams.get("list");
    const index = searchParams.get("index") || 1;

    if (id) {
      setVideoId(id);
    }

    if (list) {
      setQueryParams({ list, index });
    }
  }, [location.search]);

  const { data: videos } = useGetAllVideosQuery({
    page: 1,
    limit: 50,
  });
  const { data: loggedInUser } = useGetCurrentUserQuery(null);

  const [toggleVideoLikes, { isLoading: isTogglingLike }] =
    useToggleVideoLikesMutation();
  const [toggleSubscription, { isLoading: isTogglingSubscription }] =
    useToggleSubscriptionMutation();

  useEffect(() => {
    if (video?.data?.isLiked !== undefined) {
      setIsLiked(video?.data?.isLiked);
    }
  }, [video]);

  useEffect(() => {
    if (video?.data?.isSubscribed !== undefined) {
      setIsSubscribed(video?.data?.isSubscribed);
    }

    if (video?.data?.subscribers !== undefined) {
      setSubscribersCount(video?.data?.subscribers);
    }
  }, [video]);

  const {
    data: playlist,
    // isLoading: isPlaylistLoading,
    // error: playlistError,
  } = useGetPlaylistByIdQuery(queryParams.list, {
    skip: !queryParams.list,
  });

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
      const response = await toggleSubscription(userId).unwrap();
      dispatch(saveUserSubscriptions(response.data));

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
      <div className="grid grid-cols-[auto,1fr] xl:grid-cols-[auto,2fr,1fr] gap-4 h-[calc(100vh-64px)]">
        <Sidebar />
        {(!video || !video.data) && !(isVideoLoading || isFetchingVideo) ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="mt-4 text-3xl text-center">
              Sorry, the video you are looking for is not available.
            </p>
            <p className="mt-4 text-3xl text-center">
              Please check out our other videos.
            </p>
          </div>
        ) : (
          <div className="px-4 pb-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] md:px-4">
            <div
              key={videoId}
              className="w-full max-w-[1000px] flex flex-col mx-auto relative group"
            >
              <VideoPlayer isLoading={isVideoLoading} video={video?.data} />

              <p className="mt-4 text-base font-semibold sm:text-lg md:text-xl line-clamp-1">
                {video?.data?.title}
              </p>

              <div className="flex flex-col items-start justify-between gap-4 mt-4 lg:flex-row">
                <div className="flex items-start gap-3 lg:w-1/2 xl:w-2/3 sm:w-auto">
                  <a
                    href={`/user/${video?.data?.owner.userName}`}
                    className="flex-shrink-0"
                  >
                    <img
                      src={video?.data?.owner.avatar}
                      alt={video?.data?.owner.userName}
                      className="object-cover object-center rounded-full size-10 sm:size-12"
                      loading="lazy"
                    />
                  </a>
                  <div className="flex items-center justify-between w-full xl:flex-col xl:items-start">
                    <div className="flex-grow min-w-0 max-w-[70%] md:max-w-full">
                      <span className="flex items-center gap-2">
                        <a
                          href={`/user/${video?.data?.owner.userName}`}
                          className="truncate"
                        >
                          <h1 className="text-sm truncate sm:text-base">
                            {video?.data?.owner.fullName}
                          </h1>
                        </a>
                        <FaCircleCheck size={16} />
                      </span>
                      <p className="text-sm text-gray-500 sm:text-base">
                        {subscribersCount}{" "}
                        <span className="text-sm">subscribers</span>
                      </p>
                    </div>

                    {loggedInUser?.data?._id !== video?.data.owner._id && (
                      <Button
                        onClick={() =>
                          handleToggleSubscription(video?.data.owner._id)
                        }
                        className={`flex items-center gap-2 px-3 text-sm rounded-3xl w-max self-start flex-shrink-0 ml-2 xl:ml-0 ${
                          isSubscribed
                            ? "text-gray-100 dark:bg-gray-700"
                            : "text-gray-900 dark:bg-gray-200"
                        }`}
                        disabled={isTogglingSubscription}
                      >
                        {isSubscribed ? (
                          <BellRing size={20} />
                        ) : (
                          <Bell size={20} />
                        )}
                        <span>{isSubscribed ? "Subscribed" : "Subscribe"}</span>
                      </Button>
                    )}
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
                      disabled={isTogglingLike}
                    >
                      {isLiked ? (
                        <BiSolidLike size={20} />
                      ) : (
                        <BiLike size={20} />
                      )}
                      <p>{video?.data?.likes}</p>
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

              <div className="border shadow-custom bg-[#f2f2f2] p-4 my-4 rounded-md text-md dark:bg-[#202021]">
                <p>
                  {VIEW_FORMATTER.format(video?.data?.views)} views &nbsp;
                  {formatTimeAgo(new Date(video?.data?.createdAt))}
                </p>
                <p
                  className={`mt-4 ${
                    isDescriptionShown ? "" : "line-clamp-1 cursor-pointer"
                  }`}
                  onClick={() => setIsDescriptionShown(true)}
                >
                  {video?.data?.description}
                </p>

                <button
                  onClick={() =>
                    setIsDescriptionShown((descShown) => !descShown)
                  }
                  className="mt-4"
                >
                  {isDescriptionShown ? "Show Less" : "...more"}
                </button>
              </div>
              <CommentsSection videoId={videoId} />
              <div className="block mt-4 xl:hidden">
                {playlist && (
                  <CustomPlaylist
                    playlist={playlist}
                    queryParams={{ index: Number(queryParams.index) }}
                  />
                )}
                <SuggestedVideos videos={videos} setVideoId={setVideoId} />
              </div>
            </div>
          </div>
        )}

        <div className="hidden overflow-y-auto xl:block">
          {playlist && (
            <CustomPlaylist
              playlist={playlist}
              queryParams={{ index: Number(queryParams.index) }}
            />
          )}
          <SuggestedVideos videos={videos} setVideoId={setVideoId} />
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerScreen;
