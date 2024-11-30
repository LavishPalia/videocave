import PageHeader from "@/components/PageHeader";
import Sidebar from "@/components/Sidebar";
import {
  useClearWatchHistoryMutation,
  useDeleteVideoFromWatchHistoryMutation,
  useGetWatchHistoryQuery,
} from "@/slices/watchHistoryApiSlice";
import WatchHistory from "@/components/WatchHistory";
import { FaRegTrashAlt } from "react-icons/fa";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

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

  useEffect(() => {
    refetchHistory();
  }, []);

  return (
    <div className="flex flex-col max-h-screen">
      <PageHeader />
      <div className="flex flex-grow overflow-hidden">
        <Sidebar />
        <div className="flex flex-col-reverse flex-grow pt-2 overflow-y-auto xl:flex-row">
          <div className="flex-grow px-4 pb-4 md:px-8">
            <WatchHistory
              history={history}
              isLoading={isLoading}
              deleteVideoFromWatchHistory={deleteVideoFromWatchHistory}
              refetchHistory={refetchHistory}
            />
          </div>
          <div className="sticky bottom-0 w-full px-4 pb-4 xl:top-0 md:px-10 xl:w-1/4">
            <div className="relative rounded shadow-md">
              <Button
                variant="outline"
                className="flex items-center gap-3 text-base rounded-3xl md:ml-4 xl:mt-12 xl:ml-0"
                onClick={handleClearHistory}
              >
                <FaRegTrashAlt />
                <p>Clear watch history</p>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
