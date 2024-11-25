import { Bell, BellRing, Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Sidebar from "@/components/Sidebar";
import { Link, useParams } from "react-router-dom";
import {
  useGetCurrentUserQuery,
  useGetUserChannelDetailsQuery,
} from "@/slices/usersApiSlice";
import Button from "@/components/Button";
import { useGetChannelVideosQuery } from "@/slices/videoApiSlice";
import { formatDuration } from "@/utils/formatDuration";
import { VIEW_FORMATTER } from "@/components/VideoGridItems";
import { formatTimeAgo } from "@/utils/formatTimeAgo";
import {
  useGetUserSubscriptionsQuery,
  useToggleSubscriptionMutation,
} from "@/slices/subscriptionsApiSlice";
import { useAppSelector } from "@/app/hooks";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaCircleCheck } from "react-icons/fa6";
import Channel_Cover from "../assets/channel_cover.png";

const Channel = () => {
  const [activeTab, setActiveTab] = useState("Videos");
  const { username } = useParams<{ username: string }>();
  const { user } = useAppSelector((state) => state.auth);
  const userId = user?._id;

  const { data: channel, isLoading: isChannelLoading } =
    useGetUserChannelDetailsQuery(username);

  // Added conditional check for channelId
  const channelId = channel?.data?._id;
  const { data: videos, isLoading: isVideosLoading } = useGetChannelVideosQuery(
    channelId,
    { skip: !channelId }
  );

  const [toggleSubscription, { isLoading: isTogglingSubscription }] =
    useToggleSubscriptionMutation();

  const { refetch: refetchSubscriptions } =
    useGetUserSubscriptionsQuery(userId);

  const { data: loggedInUser } = useGetCurrentUserQuery(null);

  const [isSubscribed, setIsSubscribed] = useState(channel?.data?.isSubscribed);
  const [subscribersCount, setSubscribersCount] = useState<number>(
    channel?.data?.subscribersCount
  );

  useEffect(() => {
    setIsSubscribed(channel?.data?.isSubscribed);
    setSubscribersCount(channel?.data?.subscribersCount);
  }, [channel]);

  const handleToggleSubscription = async (userId: string) => {
    setIsSubscribed((prev: boolean) => !prev);
    const newSubscribersCount = isSubscribed
      ? subscribersCount - 1
      : subscribersCount + 1;
    setSubscribersCount(newSubscribersCount);
    try {
      await toggleSubscription(userId).unwrap();
      refetchSubscriptions();
      toast.success(`Subscription ${isSubscribed ? "removed" : "added"}!`, {
        autoClose: 500,
      });
    } catch (error) {
      setIsSubscribed((prev: boolean) => !prev);
      setSubscribersCount((prev) => (isSubscribed ? prev + 1 : prev - 1));

      toast.error("Failed to update subscription");
    }
  };

  console.log(videos?.data);

  return (
    <div className="flex flex-col max-h-screen">
      <PageHeader />
      <div className="grid grid-cols-[auto,1fr] flex-grow overflow-auto">
        <Sidebar />
        <div className="px-4 pb-4 overflow-x-hidden md:px-8">
          {(isChannelLoading || !channel) && (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 size={40} className="animate-spin" />
              &nbsp;<p className="text-3xl">Loading...</p>
            </div>
          )}
          {channel && (
            <div className="px-2 pb-4 overflow-x-hidden md:px-8">
              <img
                src={channel.data.coverImage || Channel_Cover}
                alt={channel.data.userName}
                className="object-cover object-center w-full h-40 rounded-lg"
              />

              <div className="flex flex-col gap-4 mt-4 sm:flex-row md:mt-8">
                <img
                  src={channel.data.avatar}
                  alt=""
                  className="object-cover object-center mx-auto rounded-full size-24 md:size-40 sm:mx-0"
                />
                <div className="flex flex-col gap-2 text-center md:gap-3 sm:text-left">
                  <div className="flex items-center justify-center gap-2 sm:justify-start">
                    <h1 className="text-2xl md:text-3xl">
                      {channel.data.fullName}
                    </h1>
                    <FaCircleCheck size={16} />
                  </div>
                  <div className="flex flex-wrap justify-center gap-1 text-sm sm:justify-start md:text-base">
                    <h2>@{channel.data.userName}</h2>
                    <span className="hidden sm:inline">•</span>

                    <p>{subscribersCount} Subscribers</p>
                    <span className="hidden sm:inline">•</span>

                    <p>{videos?.data?.videos?.length || 0} Videos</p>
                  </div>
                  {loggedInUser?.data?._id === channel?.data?._id && (
                    <p>email : {channel.data.email}</p>
                  )}
                  {loggedInUser?.data?._id !== channel?.data?._id && (
                    <Button
                      onClick={() => handleToggleSubscription(channel.data._id)}
                      className="flex items-center justify-center w-full gap-2 px-3 mt-2 text-sm text-gray-100 dark:bg-gray-700 rounded-3xl sm:w-max sm:mt-0"
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
              </div>

              <div className="flex justify-center gap-4 mt-4 sm:justify-start md:gap-6">
                <Button
                  variant="ghost"
                  className={`dark:hover:bg-transparent tracking-wider p-0 relative
          ${activeTab === "Videos" ? "text-gray-100" : "text-gray-400"}
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
          ${activeTab === "Playlists" ? "text-gray-100" : "text-gray-400"}
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
          ${activeTab === "Community" ? "text-gray-100" : "text-gray-400"}
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

              <div className="grid grid-cols-1 gap-4 mt-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {isVideosLoading && (
                  <div className="flex items-center justify-center min-h-screen">
                    <Loader2 size={40} className="animate-spin" />
                    &nbsp;<p className="text-3xl">Loading videos...</p>
                  </div>
                )}
                {videos?.data?.videos?.map(
                  (video: {
                    thumbnail: string;
                    title: string;
                    duration: number;
                    _id: string;
                    views: number | bigint;
                    createdAt: Date;
                  }) => (
                    <div className="w-full mb-2" key={video._id}>
                      <div className="relative aspect-video">
                        <a href={`/watch?v=${video._id}`}>
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="object-cover object-center w-full h-full rounded-lg"
                          />
                        </a>

                        <div className="absolute bottom-1 right-1 bg-secondary-marginal-dark text-white text-sm px-1 py-0.5 rounded">
                          {formatDuration(video.duration)}
                        </div>
                      </div>

                      <div className="mt-2">
                        <Link
                          to={`/watch?v=${video._id}`}
                          className="text-sm font-bold line-clamp-2 md:text-base"
                        >
                          {video.title}
                        </Link>
                        <div className="mt-1 text-xs md:text-sm text-secondary-marginal-text">
                          {VIEW_FORMATTER.format(video.views)} Views •{" "}
                          {formatTimeAgo(new Date(video.createdAt))}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Channel;
