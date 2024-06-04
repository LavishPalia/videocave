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
  Library,
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

  return (
    <>
      <aside className="sticky top-0 overflow-y-auto pb-4 flex flex-col ml-1 lg:hidden scrollbar-hidden">
        <SmallSiderbarItem Icon={Home} url="/" title="Home" />
        <SmallSiderbarItem Icon={Repeat} url="/shorts" title="Shorts" />
        <SmallSiderbarItem
          Icon={Clapperboard}
          url="/subscriptions"
          title="Subscriptions"
        />
        <SmallSiderbarItem Icon={Library} url="/library" title="Library" />
      </aside>

      <aside className="w-56 lg:sticky absolute top-0 overflow-y-auto scrollbar-hidden pb-4 flex-col lg:flex hidden gap-2 px-4">
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
        <div className="ml-4 mt-2 text-lg mb-1 font-semibold text-secondary-marginal-dark tracking-wide dark:text-gray-50">
          {title}
        </div>
      )}
      {visibleChildren}
      {showExpandedButton && (
        <Button
          variant="ghost"
          className="w-full flex items-center rounded-lg gap-4 p-3"
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
          className="size-6 rounded-full object-cover object-center"
          alt="channel-image"
        />
      ) : (
        <Icon className="size-6" />
      )}
      <div className="whitespace-nowrap overflow-hidden text-ellipsis">
        {title}
      </div>
    </Link>
  );
};

export default Sidebar;
