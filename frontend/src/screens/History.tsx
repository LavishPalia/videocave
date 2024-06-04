import PageHeader from "@/components/PageHeader";
import Sidebar from "@/components/Sidebar";
import {
  useClearWatchHistoryMutation,
  useDeleteVideoFromWatchHistoryMutation,
  useGetWatchHistoryQuery,
} from "@/slices/watchHistoryApiSlice";
import WatchHistory from "@/components/WatchHistory";
import { FaRegTrashAlt } from "react-icons/fa";
import Button from "@/components/Button";

const History = () => {
  const {
    data: history,
    isLoading,
    refetch: refetchHistory,
  } = useGetWatchHistoryQuery(null);

  const [deleteVideoFromWatchHistory] =
    useDeleteVideoFromWatchHistoryMutation();

  const [clearWatchHistory] = useClearWatchHistoryMutation();

  const handleClearHistory = async () => {
    await clearWatchHistory(null);
    refetchHistory();
  };

  return (
    <div className="max-h-screen flex flex-col">
      <PageHeader />
      <div className="flex flex-grow overflow-hidden">
        <Sidebar />
        <div className="flex flex-col-reverse xl:flex-row flex-grow overflow-y-auto">
          <div className="flex-grow px-4 md:px-8 pb-4">
            <WatchHistory
              history={history}
              isLoading={isLoading}
              deleteVideoFromWatchHistory={deleteVideoFromWatchHistory}
              refetchHistory={refetchHistory}
            />
          </div>
          <div className="px-4 pb-4 md:px-10 w-full xl:w-1/4 sticky top-0">
            <div className="rounded shadow-md relative">
              <Button
                variant="ghost"
                className="flex gap-3 items-center rounded-3xl md:ml-4 xl:mt-12 xl:ml-0"
                onClick={handleClearHistory}
              >
                <FaRegTrashAlt />
                <p>Clear all watch history</p>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
