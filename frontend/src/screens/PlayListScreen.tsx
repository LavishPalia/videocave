import { useNavigate, useSearchParams } from "react-router-dom";
// import WatchLaterScreen from "../screens/WatchLaterScreen";
import LikedVideosScreen from "../screens/LikedVideosScreen";
import SinglePlayListScreen from "./SinglePlayListScreen";
import { useEffect } from "react";

const PlayListScreen = () => {
  const [searchParams] = useSearchParams();
  const listType = searchParams.get("list")!;

  const navigate = useNavigate();

  useEffect(() => {
    if (!listType) {
      navigate("/playlists", {
        replace: true,
      });
    }
  }, [listType, navigate]);

  if (!listType) {
    return null;
  }

  switch (listType) {
    case "WL":
      return <p>Stay tuned for Watch Later feature</p>;
    case "LL":
      return <LikedVideosScreen />;
    default:
      return <SinglePlayListScreen listId={listType} />;
  }
};

export default PlayListScreen;
