import PageHeader from "@/components/PageHeader";
import Sidebar from "@/components/Sidebar";

import { useSearchVideosAndChannelsQuery } from "@/slices/videoApiSlice";
import { formatDuration } from "@/utils/formatDuration";
import { VIEW_FORMATTER } from "@/components/VideoGridItems";
import { FaCircleCheck } from "react-icons/fa6";
import { formatTimeAgo } from "@/utils/formatTimeAgo";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, BellRing } from "lucide-react";
import { useToggleSubscriptionMutation } from "@/slices/subscriptionsApiSlice";
import { toast } from "react-toastify";
import { saveUserSubscriptions } from "@/slices/subscriptionsSlice";
import { useAppDispatch } from "@/app/hooks";

interface IVideo {
  _id: string;
  title: string;
  thumbnail: string;
  duration: number;
  description: string;
  views: number;
  createdAt: string;
  owner: {
    userName: string;
    fullName: string;
    avatar: string;
  };
}

interface IChannel {
  _id: string;
  userName: string;
  fullName: string;
  avatar: string;
  subscriberCount: number;
  isSubscribedByCurrentUser: boolean;
}

const SearchScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const searchParams = new URLSearchParams(location.search);
  const initialQuery = searchParams.get("query");

  const [query, setQuery] = useState(initialQuery);

  console.log({ query });

  const {
    data: result,
    isLoading,
    isError,
    refetch,
  } = useSearchVideosAndChannelsQuery(query, {
    skip: !query,
  });

  const [toggleSubscription, { isLoading: isTogglingSubscription }] =
    useToggleSubscriptionMutation();

  const handleToggleSubscription = async (channelId: string) => {
    try {
      const response = await toggleSubscription(channelId).unwrap();

      console.log(response);

      dispatch(saveUserSubscriptions(response.data));
      refetch();

      if (response.success) {
        if (response.message === "Subscription removed successfully")
          toast.success(`Subscription removed`);
        else toast.success(`Subscription Added`);
      }
    } catch (error) {
      console.error("Failed to toggle subscription:", error);
    }
  };

  console.log(result?.data.channel);
  console.log(result?.data.videos);

  useEffect(() => {
    const newQuery = new URLSearchParams(location.search).get("query") || "";

    if (newQuery !== query) {
      setQuery(newQuery);
      refetch();
    }
  }, [location.search, query, refetch]);

  const handleNewSearch = (newQuery: string) => {
    if (newQuery.trim()) {
      navigate(`/results?query=${encodeURIComponent(newQuery)}`);
      setQuery(newQuery);
    }
  };

  const renderChannel = (channel: IChannel) => (
    <div className="flex justify-around">
      <img
        src={channel.avatar}
        alt={channel.fullName}
        className="object-cover object-center rounded-full w-36 aspect-square"
      />

      <a href={`/user/${channel.userName}`} className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <p className="text-xl tracking-wide">{channel.fullName}</p>
          <FaCircleCheck className="size-2 md:size-4" />
        </div>

        <div className="flex gap-1 text-[13px] text-secondary-marginal-text">
          <p className="">@{channel.userName} • </p>
          <p>{channel.subscriberCount} Subscribers</p>
        </div>
      </a>
      {/* <p className="text-sm text-gray-600">
        {channel.subscriberCount} subscribers
      </p> */}

      <Button
        onClick={() => handleToggleSubscription(channel._id)}
        className="flex items-center justify-center w-full gap-3 px-6 mt-2 text-lg text-gray-200 dark:bg-gray-800 rounded-3xl sm:w-max sm:mt-0"
        disabled={isTogglingSubscription}
      >
        {channel.isSubscribedByCurrentUser ? (
          <BellRing size={20} />
        ) : (
          <Bell size={20} />
        )}
        <span>
          {channel.isSubscribedByCurrentUser ? "Subscribed" : "Subscribe"}
        </span>
      </Button>
    </div>
  );

  const renderChannelVideos = (videos: IVideo[], channel: IChannel) =>
    videos.map((video: IVideo) => (
      <div
        key={video._id}
        className="flex gap-4 p-4 rounded shadow-sm hover:shadow-md"
      >
        <a
          href={`/watch?v=${video._id}`}
          className="relative block w-[500px] aspect-video shrink-0"
        >
          <img
            src={video.thumbnail}
            className="block w-full h-full object-cover transition-[border-radius] duration-200 rounded-xl"
            loading="lazy"
          />
          <div className="absolute right-6 bottom-1 md:bottom-2 md:right-2 bg-secondary-marginal-dark bg-opacity-90 text-white font-semibold text-[6px] md:text-sm px-1 py-0.5 rounded">
            {formatDuration(video.duration)}
          </div>
        </a>

        <div className="flex flex-col gap-1 w-[350px] md:w-[500px]">
          <a
            href={`/watch?v=${video._id}`}
            className="text-sm md:text-xl line-clamp-2"
          >
            {video.title}
          </a>

          <div className="flex text-sm">
            <div className="text-secondary-marginal-text">
              {VIEW_FORMATTER.format(video.views)} Views &nbsp;
            </div>
            <p className="text-secondary-marginal-text">
              •&nbsp; {formatTimeAgo(new Date(video.createdAt))}
            </p>
          </div>

          <a
            href={`/user/${video.owner.userName || channel.userName}`}
            className="flex items-center gap-2 text-secondary-marginal-text"
          >
            <img
              src={video.owner.avatar || channel.avatar}
              alt={video.owner.fullName || channel.fullName}
              className="object-cover object-center rounded-full size-8"
            />
            <p>{video.owner.fullName || channel.fullName}</p>
            <FaCircleCheck className="size-2 md:size-3" />
          </a>
          <div className="line-clamp-2 mt-4 text-secondary-marginal-text text-[8px] md:text-sm w-[150px] md:w-[500px]">
            {video.description}
          </div>
        </div>
      </div>
    ));

  const renderVideos = (videos: IVideo[]) =>
    videos.map((video: IVideo) => (
      <div
        key={video._id}
        className="flex gap-4 p-4 rounded shadow-sm hover:shadow-md"
      >
        <a
          href={`/watch?v=${video._id}`}
          className="relative block w-[500px] aspect-video shrink-0"
        >
          <img
            src={video.thumbnail}
            className="block w-full h-full object-cover transition-[border-radius] duration-200 rounded-xl"
            loading="lazy"
          />
          <div className="absolute right-6 bottom-1 md:bottom-2 md:right-2 bg-secondary-marginal-dark bg-opacity-90 text-white font-semibold text-[6px] md:text-sm px-1 py-0.5 rounded">
            {formatDuration(video.duration)}
          </div>
        </a>

        <div className="flex flex-col gap-1 w-[350px] md:w-[500px]">
          <a
            href={`/watch?v=${video._id}`}
            className="text-sm md:text-xl line-clamp-2"
          >
            {video.title}
          </a>

          <div className="flex text-sm">
            <div className="text-secondary-marginal-text">
              {VIEW_FORMATTER.format(video.views)} Views &nbsp;
            </div>
            <p className="text-secondary-marginal-text">
              •&nbsp; {formatTimeAgo(new Date(video.createdAt))}
            </p>
          </div>

          <a
            href={`/user/${video.owner.userName}`}
            className="flex items-center gap-2 text-secondary-marginal-text"
          >
            <img
              src={video.owner.avatar}
              alt={video.owner.fullName}
              className="object-cover object-center rounded-full size-8"
            />
            <p>{video.owner.fullName}</p>
            <FaCircleCheck className="size-2 md:size-3" />
          </a>
          <div className="line-clamp-2 mt-4 text-secondary-marginal-text text-[8px] md:text-sm w-[150px] md:w-[500px]">
            {video.description}
          </div>
        </div>
      </div>
    ));

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <p>Loading...</p>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex items-center justify-center h-full">
          <p>Something went wrong. Please try again later.</p>
        </div>
      );
    }

    if (
      !result.data.channel &&
      (!result.data.videos || result.data.videos.length === 0)
    ) {
      return (
        <div className="flex items-center justify-center h-full">
          <p>No results found for "{query}".</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {result.data.channel && (
          <div>
            {renderChannel(result.data.channel)}
            <hr className="mt-3" />
          </div>
        )}
        {result.data.channel?.latestVideos.length > 0 && (
          <div>
            <div className="flex flex-col">
              <h1 className="py-1 pl-4 text-2xl font-bold">
                Latest from {result.data.channel.fullName}
              </h1>
              {renderChannelVideos(
                result.data.channel.latestVideos,
                result.data.channel
              )}
            </div>

            <hr />
          </div>
        )}

        {result.data.videos?.length > 0 && (
          <div>
            <div className="flex flex-col">
              {renderVideos(result.data.videos)}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col max-h-screen" key={query}>
      <PageHeader onSearch={handleNewSearch} />
      <div className="flex flex-grow overflow-hidden">
        <Sidebar />
        <div className="flex flex-col-reverse flex-grow pt-2 overflow-y-auto xl:flex-row">
          <div className="flex-grow px-4 pb-4 md:px-8">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default SearchScreen;
