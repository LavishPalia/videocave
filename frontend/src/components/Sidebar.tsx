import {
  ChevronDown,
  ChevronUp,
  Clapperboard,
  Clock,
  History,
  Home,
  PlaySquare,
} from "lucide-react";

import { Children, ElementType, ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Button, { buttonStyles } from "./Button";
import { twMerge } from "tailwind-merge";
import { BiLike } from "react-icons/bi";
import { useGetUserSubscriptionsQuery } from "@/slices/subscriptionsApiSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { BiSolidPlaylist } from "react-icons/bi";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { PageHeaderFirstSection } from "./PageHeader";
import { saveUserSubscriptions } from "@/slices/subscriptionsSlice";

type channelDetail = {
  _id: string;
  avatar: string;
  fullName: string;
  userName: string;
};

const Sidebar = () => {
  const location = useLocation();

  const currentPath = location.pathname + location.search;

  const { user } = useAppSelector((state) => state.auth);
  const userId = user?._id;

  const dispatch = useAppDispatch();
  const subscriptions = useAppSelector((state) => state.subscriptions);
  const rehydrated = useAppSelector(
    (state) => state.subscriptions._persist.rehydrated
  );

  console.log(subscriptions);

  const { data: fetchedSubscriptions } = useGetUserSubscriptionsQuery(userId, {
    skip: rehydrated && Object.keys(subscriptions).length > 1 ? true : false,
  });

  const { isLargeOpen, isSmallOpen, close } = useSidebarContext();

  useEffect(() => {
    if (fetchedSubscriptions) {
      dispatch(
        saveUserSubscriptions(fetchedSubscriptions?.data?.subscribedChannels)
      );
    }
  }, [fetchedSubscriptions?.data?.subscribedChannels]);

  return (
    <>
      <aside
        className={`sticky top-0 flex flex-col pb-4 ml-1 overflow-y-auto ${
          isLargeOpen ? "lg:hidden" : "lg:flex"
        } scrollbar-hidden`}
      >
        <SmallSiderbarItem
          Icon={Home}
          url="/"
          title="Home"
          isActive={currentPath === "/"}
        />
        <SmallSiderbarItem
          Icon={History}
          url="/history"
          title="History"
          isActive={currentPath === "/history"}
        />
        <SmallSiderbarItem
          Icon={BiLike}
          url="/playlist?list=LL"
          title="Liked Videos"
          isActive={currentPath === "/playlist?list=LL"}
        />
        <SmallSiderbarItem
          Icon={BiSolidPlaylist}
          url="/playlists"
          title="Playlists"
          isActive={currentPath === "/playlists"}
        />

        <SmallSiderbarItem
          Icon={Clapperboard}
          url="/subscriptions"
          title="Subscriptions"
          isActive={currentPath === "/subscriptions"}
        />
      </aside>
      {isSmallOpen && (
        <div
          onClick={close}
          className="lg:hidden fixed inset-0 z-[999] dark:bg-gray-950 opacity-50"
        />
      )}
      <aside
        className={`absolute top-0 flex-col w-56 gap-2 px-4 pb-4 overflow-y-auto lg:sticky scrollbar-hidden ${
          isLargeOpen ? "lg:flex" : "lg:hidden"
        } ${isSmallOpen ? "flex z-[999] bg-black max-h-screen" : "hidden"}`}
      >
        <div className="sticky top-0 p-2 px-2 pb-4 bg-black lg:hidden">
          <PageHeaderFirstSection />
        </div>
        <LargeSidebarSection>
          <LargeSidebarItem
            isActive={currentPath === "/"}
            Icon={Home}
            url="/"
            title="Home"
          />
          {/* <LargeSidebarItem Icon={Repeat} url="/shorts" title="Shorts" /> */}
          <LargeSidebarItem
            Icon={Clapperboard}
            url="/subscriptions"
            title="Subscriptions"
            isActive={currentPath === "/subscriptions"}
          />
        </LargeSidebarSection>
        <hr />

        <LargeSidebarSection title="You">
          {/* <LargeSidebarItem Icon={User} title="Your Channel" url="/library" /> */}
          <LargeSidebarItem
            Icon={History}
            title="History"
            url="/history"
            isActive={currentPath === "/history"}
          />
          <LargeSidebarItem
            Icon={BiSolidPlaylist}
            title="Playlists"
            url="/playlists"
            isActive={currentPath === "/playlists"}
          />
          <LargeSidebarItem
            Icon={PlaySquare}
            title="Your Videos"
            url="/your-videos"
            isActive={currentPath === "/your-videos"}
          />
          <LargeSidebarItem
            Icon={Clock}
            title="Watch Later"
            url="/playlist?list=WL"
            isActive={currentPath === "/playlist?list=WL"}
          />
          <LargeSidebarItem
            Icon={BiLike}
            title="Liked Videos"
            url="/playlist?list=LL"
            isActive={currentPath === "/playlist?list=LL"}
          />
        </LargeSidebarSection>
        <hr />

        <LargeSidebarSection title="Subscriptions" visibleItemCount={3}>
          {subscriptions &&
            Object.values(subscriptions).length > 0 &&
            Object.values(subscriptions)
              .filter((channel) => typeof channel === "object" && channel._id) // Filter out invalid entries
              .map((channel: channelDetail) => {
                return (
                  <LargeSidebarItem
                    key={channel._id}
                    Icon={channel.avatar}
                    title={channel.fullName}
                    url={`/user/${channel.userName}`}
                    isActive={currentPath === `/user/${channel.userName}`}
                  />
                );
              })}
        </LargeSidebarSection>

        <hr />

        {/* <LargeSidebarSection title="Explore">
          <LargeSidebarItem Icon={Flame} title="Trending" url="/trending" />
          <LargeSidebarItem
            Icon={ShoppingBag}
            title="Shopping"
            url="/shopping"
          />
          <LargeSidebarItem Icon={Music2} title="Music" url="/music" />
          <LargeSidebarItem Icon={Film} title="Movies & Tv" url="/music" />
          <LargeSidebarItem Icon={Radio} title="Live" url="/live" />
          <LargeSidebarItem Icon={Gamepad2} title="Gaming" url="/gaming" />
          <LargeSidebarItem Icon={Newspaper} title="News" url="/news" />
          <LargeSidebarItem Icon={Trophy} title="Sports" url="/sports" />
          <LargeSidebarItem Icon={Lightbulb} title="Learning" url="/learning" />
          <LargeSidebarItem
            Icon={Shirt}
            title="Fashion & Beauty"
            url="/fashion-beauty"
          />
          <LargeSidebarItem Icon={Podcast} title="Podcasts" url="/podcasts" />
        </LargeSidebarSection> */}
      </aside>
    </>
  );
};

type SmallSiderbarItemProps = {
  Icon: ElementType;
  title: string;
  url: string;
  isActive: boolean;
};

type LargeSiderbarItemProps = {
  Icon: ElementType | string;
  title: string;
  url: string;
  isActive?: boolean;
};

type LargeSiderbarSectionProps = {
  children: ReactNode;
  visibleItemCount?: number;
  title?: string;
};

const SmallSiderbarItem = ({
  Icon,
  title,
  url,
  isActive,
}: SmallSiderbarItemProps) => {
  return (
    <a
      href={url}
      className={twMerge(
        buttonStyles({ variant: "ghost" }),
        `py-2 sm:py-4 px-0 sm:px-1 flex flex-col items-center rounded-lg gap-1 mt-1 ${
          isActive
            ? "font-bold dark:bg-gray-300 bg-neutral-100 hover:bg-secondary-marginal text-black"
            : undefined
        }`
      )}
    >
      <Icon className="size-4 sm:size-6" />
      <div className="text-[10px]">{title}</div>
    </a>
  );
};

const LargeSidebarSection = ({
  children,
  visibleItemCount = Number.POSITIVE_INFINITY,
  title,
}: LargeSiderbarSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const childrenArray = Children.toArray(children).flat();
  const showExpandedButton = childrenArray.length > visibleItemCount;
  const visibleChildren = isExpanded
    ? childrenArray
    : childrenArray.slice(0, visibleItemCount);

  const ButtonIcon = isExpanded ? ChevronUp : ChevronDown;

  return (
    <div>
      {title && (
        <div className="mt-2 mb-1 ml-4 text-lg font-semibold tracking-wide text-secondary-marginal-dark dark:text-gray-50">
          {title}
        </div>
      )}
      {visibleChildren}
      {showExpandedButton && (
        <Button
          variant="ghost"
          className="flex items-center w-full gap-4 p-3 rounded-lg"
          onClick={() => setIsExpanded((prevVal) => !prevVal)}
        >
          <ButtonIcon className="size-6" />
          <div>{isExpanded ? "Show Less" : "Show More"}</div>
        </Button>
      )}
    </div>
  );
};

const LargeSidebarItem = ({
  Icon,
  title,
  url,
  isActive,
}: LargeSiderbarItemProps) => {
  return (
    <a
      href={url}
      className={twMerge(
        buttonStyles({ variant: "ghost" }),
        `w-full flex items-center rounded-lg gap-4 p-3 mt-1 hover:text-black ${
          isActive
            ? "font-bold dark:bg-gray-300 bg-neutral-100 hover:bg-secondary-marginal text-black"
            : undefined
        }`
      )}
    >
      {typeof Icon === "string" ? (
        <img
          src={Icon}
          className="object-cover object-center rounded-full size-6"
          alt="channel-image"
          loading="lazy"
        />
      ) : (
        <Icon className="size-6" />
      )}
      <div className="overflow-hidden whitespace-nowrap text-ellipsis">
        {title}
      </div>
    </a>
  );
};

export default Sidebar;
