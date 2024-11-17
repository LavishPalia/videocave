import { useSearchParams } from "react-router-dom";
// import WatchLaterScreen from "../screens/WatchLaterScreen";
import LikedVideosScreen from "../screens/LikedVideosScreen";

const PlayListScreen = () => {
  const [searchParams] = useSearchParams();
  const listType = searchParams.get("list");

  switch (listType) {
    case "WL":
      return <p>Stay tuned for Watch Later feature</p>;
    case "LL":
      return <LikedVideosScreen />;
    default:
      return <div>Invalid playlist type. Please check the URL.</div>;
  }
};

export default PlayListScreen;
