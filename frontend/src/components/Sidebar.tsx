import {
  ChevronDown,
  ChevronUp,
  Clapperboard,
  Clock,
  Film,
  Flame,
  Gamepad2,
  History,
  Home,
  Lightbulb,
  Music2,
  Newspaper,
  PlaySquare,
  Podcast,
  Radio,
  Repeat,
  Shirt,
  ShoppingBag,
  Trophy,
  User,
} from "lucide-react";
import { Children, ElementType, ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import Button, { buttonStyles } from "./Button";
import { twMerge } from "tailwind-merge";
import { BiLike } from "react-icons/bi";
import { useGetUserSubscriptionsQuery } from "@/slices/subscriptionsApiSlice";
import { useAppSelector } from "@/app/hooks";
import { BiSolidPlaylist } from "react-icons/bi";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { PageHeaderFirstSection } from "./PageHeader";

type channelDetail = {
  _id: string;
  avatar: string;
  fullName: string;
  userName: string;
};

const Sidebar = () => {
  const { user } = useAppSelector((state) => state.auth);
  // console.log(user?._id);
  const userId = user?._id;

  const { data: subscriptions } = useGetUserSubscriptionsQuery(userId);
  const { isLargeOpen, isSmallOpen, close } = useSidebarContext();

  return (
    <>
      <aside
        className={`sticky top-0 flex flex-col pb-4 ml-1 overflow-y-auto ${
          isLargeOpen ? "lg:hidden" : "lg:flex"
        } scrollbar-hidden`}
      >
        <SmallSiderbarItem Icon={Home} url="/" title="Home" />
        <SmallSiderbarItem Icon={History} url="/history" title="History" />
        <SmallSiderbarItem
          Icon={BiLike}
          url="/playlist?list=LL"
          title="Liked Videos"
        />
        <SmallSiderbarItem
          Icon={BiSolidPlaylist}
          url="/playlists"
          title="Playlists"
        />

        <SmallSiderbarItem
          Icon={Clapperboard}
          url="/subscriptions"
          title="Subscriptions"
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
          <LargeSidebarItem isActive Icon={Home} url="/" title="Home" />
          <LargeSidebarItem Icon={Repeat} url="/shorts" title="Shorts" />
          <LargeSidebarItem
            Icon={Clapperboard}
            url="/subscriptions"
            title="Subscriptions"
          />
        </LargeSidebarSection>
        <hr />

        <LargeSidebarSection title="You">
          <LargeSidebarItem Icon={User} title="Your Channel" url="/library" />
          <LargeSidebarItem Icon={History} title="History" url="/history" />
          <LargeSidebarItem
            Icon={BiSolidPlaylist}
            title="Playlists"
            url="/playlists"
          />
          <LargeSidebarItem
            Icon={PlaySquare}
            title="Your Videos"
            url="/your-videos"
          />
          <LargeSidebarItem
            Icon={Clock}
            title="Watch Later"
            url="/playlist?list=WL"
          />
          <LargeSidebarItem
            Icon={BiLike}
            title="Liked Videos"
            url="/playlist?list=LL"
          />
        </LargeSidebarSection>
        <hr />

        <LargeSidebarSection title="Subscriptions" visibleItemCount={3}>
          {subscriptions?.data?.subscribedChannels.map(
            (channel: channelDetail) => (
              <LargeSidebarItem
                key={channel._id}
                Icon={channel.avatar}
                title={channel.fullName}
                url={`/user/${channel.userName}`}
              />
            )
          )}
        </LargeSidebarSection>
        <hr />

        <LargeSidebarSection title="Explore">
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
        </LargeSidebarSection>
      </aside>
    </>
  );
};

type SmallSiderbarItemProps = {
  Icon: ElementType;
  title: string;
  url: string;
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

const SmallSiderbarItem = ({ Icon, title, url }: SmallSiderbarItemProps) => {
  return (
    <Link
      to={url}
      className={twMerge(
        buttonStyles({ variant: "ghost" }),
        "py-4 px-1 flex flex-col items-center rounded-lg gap-1"
      )}
    >
      <Icon className="size-6" />
      <div className="text-[10px]">{title}</div>
    </Link>
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
    <Link
      to={url}
      className={twMerge(
        buttonStyles({ variant: "ghost" }),
        `w-full flex items-center rounded-lg gap-4 p-3 hover:text-black ${
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
        />
      ) : (
        <Icon className="size-6" />
      )}
      <div className="overflow-hidden whitespace-nowrap text-ellipsis">
        {title}
      </div>
    </Link>
  );
};

export default Sidebar;
