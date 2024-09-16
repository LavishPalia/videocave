const VideoCardShimmer = () => {
  return (
    <div className="flex flex-col gap-2 animate-pulse">
      <div className="relative h-56 w-[400px] bg-secondary-marginal-text rounded-lg">
        {/* <div className="absolute bottom-1 right-1 bg-secondary-marginal-dark text-white text-sm px-1 py-0.5 rounded"></div> */}
      </div>

      <div className="flex gap-2">
        <div className="rounded-full size-10 bg-secondary-marginal-text"></div>
        <div className="flex flex-col w-[80%] gap-5">
          <div className="h-6 rounded-sm w-72 bg-secondary-marginal-text"></div>

          <div className="h-5 rounded-sm bg-secondary-marginal-text w-60"></div>
          <div className="flex w-[80%] gap-4">
            <div className="w-16 h-5 text-sm rounded-sm bg-secondary-marginal-text"></div>
            <div className="w-24 h-5 text-sm rounded-sm bg-secondary-marginal-text"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCardShimmer;
