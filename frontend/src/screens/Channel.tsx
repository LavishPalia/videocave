import { Bell, BellRing, Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Sidebar from "@/components/Sidebar";
import { Link, useParams } from "react-router-dom";
import { useGetUserChannelDetailsQuery } from "@/slices/usersApiSlice";
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
import { Slide, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaCircleCheck } from "react-icons/fa6";

const Channel = () => {
  const [activeTab, setActiveTab] = useState("Videos");
  const { username } = useParams<{ username: string }>();
  const { user } = useAppSelector((state) => state.auth);
  const userId = user?._id;

  const { data: channel, isLoading: isChannelLoading } =
    useGetUserChannelDetailsQuery(username);

  // Added conditional check for channelId
  const channelId = channel?.data[0]?._id;
  const { data: videos, isLoading: isVideosLoading } = useGetChannelVideosQuery(
    channelId,
    { skip: !channelId }
  );

  const [toggleSubscription] = useToggleSubscriptionMutation();
  const { refetch: refetchSubscriptions } =
    useGetUserSubscriptionsQuery(userId);

  const [isSubscribed, setIsSubscribed] = useState(
    channel?.data[0]?.isSubscribed
  );
  const [subscribersCount, setSubscribersCount] = useState<number>(
    channel?.data[0]?.subscribersCount
  );

  useEffect(() => {
    setIsSubscribed(channel?.data[0]?.isSubscribed);
    setSubscribersCount(channel?.data[0]?.subscribersCount);
  }, [channel]);

  const handleToggleSubscription = async (userId: string) => {
    setIsSubscribed((prev: boolean) => !prev);
    setSubscribersCount((prev) => (isSubscribed ? prev - 1 : prev + 1));

    try {
      await toggleSubscription(userId);
      refetchSubscriptions();
      toast.success(`Subscription ${isSubscribed ? "removed" : "added"}!`);
    } catch (error) {
      setIsSubscribed((prev: boolean) => !prev);
      setSubscribersCount((prev) => (isSubscribed ? prev + 1 : prev - 1));

      toast.error("Failed to update subscription");
    }
  };

  console.log(videos?.data);

  return (
    <div className="max-h-screen flex flex-col">
      <PageHeader />
      <div className="grid grid-cols-[auto,1fr] flex-grow overflow-auto">
        <Sidebar />
        <div className="overflow-x-hidden px-4 md:px-8 pb-4">
          {(isChannelLoading || !channel) && (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 size={40} className="animate-spin" />
              &nbsp;<p className="text-3xl">Loading...</p>
            </div>
          )}
          {channel && (
            <div className="grid grid-cols-1 px-4">
              <img
                src={channel.data[0].coverImage}
                alt={channel.data[0].userName}
                className="h-40 w-full object-cover object-center rounded-lg"
              />

              <div className="mt-8 flex gap-4">
                <img
                  src={channel.data[0].avatar}
                  alt=""
                  className="size-40 rounded-full object-cover object-center"
                />
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2 items-center">
                    <h1 className="text-3xl">{channel.data[0].fullName}</h1>
                    <FaCircleCheck size={16} />
                  </div>
                  <div className="flex gap-1">
                    <h2>@{channel.data[0].userName} ‧ </h2>
                    <p>{subscribersCount} Subscribers ‧ </p>
                    <p>{videos?.data?.videos?.length || 0} Videos</p>
                  </div>

                  {isSubscribed ? (
                    <Button
                      onClick={() =>
                        handleToggleSubscription(channel.data[0]._id)
                      }
                      className="dark:bg-gray-700 text-sm px-3 flex items-center gap-2 text-gray-100 rounded-3xl w-max"
                    >
                      <BellRing size={24} />
                      <span>Subscribed</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={() =>
                        handleToggleSubscription(channel.data[0]._id)
                      }
                      className="dark:bg-gray-200 text-sm px-3 flex items-center gap-2 text-gray-900 rounded-3xl w-max"
                    >
                      <Bell />
                      <span>Subscribe</span>
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex mt-4 gap-6">
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

              <div className="flex flex-wrap gap-2 mt-8">
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
                    <div className="mb-2" key={video._id}>
                      <div className="relative">
                        <a href={`/watch?v=${video._id}`}>
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="h-40 aspect-video object-cover object-center rounded-lg"
                          />
                        </a>

                        <div className="absolute bottom-1 right-1 bg-secondary-marginal-dark text-white text-sm px-1 py-0.5 rounded">
                          {formatDuration(video.duration)}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <div className="flex flex-col gap-2">
                          <Link
                            to={`/watch?v=${video._id}`}
                            className="font-bold line-clamp-2 w-[250px] mt-2"
                          >
                            {video.title}
                          </Link>
                          <div className="text-secondary-marginal-text text-sm">
                            {VIEW_FORMATTER.format(video.views)} Views •{" "}
                            {formatTimeAgo(new Date(video.createdAt))}
                          </div>
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

export default Channel;
