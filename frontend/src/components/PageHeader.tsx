import { ArrowLeft, Bell, Menu, Mic, Search } from "lucide-react";
import Logo from "../assets/Logo.png";
import Button from "../components/Button";
import { useState } from "react";
import { ModeToggle } from "./mode-toggle";
import { UserDropdownMenu } from "./UserDropdownMenu";
import { useAppSelector } from "@/app/hooks";
import { VideoUploadModel } from "./VideoUploadModal";
import { Link } from "react-router-dom";
// import { useGetCurrentUserQuery } from "@/slices/usersApiSlice";

const PageHeader = () => {
  const [showFullWidthSearch, setShowFullWidthSearch] = useState(false);

  // const { data } = useGetCurrentUserQuery(null);
  // console.log(data);

  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="flex justify-between gap-2 pt-2 mx-2 mb-4 sm:gap-4 md:gap-10 sm:mx-4 sm:mb-8 lg:gap-20">
      <div
        className={`gap-4 items-center flex-shrink-0 ${
          showFullWidthSearch ? "hidden" : "flex"
        }`}
      >
        <Button variant="ghost" size="icon">
          <Menu size={20} />
        </Button>
        <Link to="/">
          <img src={Logo} className="h-4 sm:h-6" />
        </Link>
      </div>
      <form
        className={`gap-4 flex-grow justify-center items-center ${
          showFullWidthSearch ? "flex" : "hidden md:flex "
        }`}
      >
        {showFullWidthSearch && (
          <Button
            onClick={() => setShowFullWidthSearch(false)}
            type="button"
            size="icon"
            variant="ghost"
            className="flex-shrink-0"
          >
            <ArrowLeft />
          </Button>
        )}
        <div className="flex flex-grow max-w-[600px]">
          <input
            type="search"
            placeholder="Search"
            className="rounded-l-full border dark:bg-[#121212] dark:shadow-none dark:border-gray-600 dark:focus:border-blue-500 border-secondary-marginal-border shadow-inner shadow-secondary-marginal
             py-1 px-4 text-lg w-full focus:border-blue-500 outline-none"
          />
          <Button className="py-2 px-4 rounded-r-full dark:bg-[#222222] dark:border-gray-600 border  border-secondary-marginal-border border-l-0 flex-shrink-0">
            <Search />
          </Button>
        </div>
        <Button
          type="button"
          size="icon"
          className="flex-shrink-0 dark:bg-[#222222]"
        >
          <Mic />
        </Button>
      </form>
      <div
        className={`flex-shrink-0 md:gap-2 ${
          showFullWidthSearch ? "hidden" : "flex"
        }`}
      >
        <Button
          size="icon"
          variant="ghost"
          className="md:hidden"
          onClick={() => setShowFullWidthSearch(true)}
        >
          <Search size={20} />
        </Button>
        <Button type="button" size="icon" variant="ghost" className="md:hidden">
          <Mic size={20} />
        </Button>

        <ModeToggle />

        <VideoUploadModel />
        <Button size="icon" variant="ghost">
          <Bell size={20} />
        </Button>
        <UserDropdownMenu user={user} />
      </div>
    </div>
  );
};

export default PageHeader;
