import {
  ChangeEvent,
  DragEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  ChevronDown,
  CircleAlert,
  Edit,
  Loader2,
  Search,
  Upload,
} from "lucide-react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useGetUserPlaylistNamesQuery } from "@/slices/playlistApiSlice";
import { useAppSelector } from "@/app/hooks";
import NewChannelPlaylist from "../NewChannelPlaylist";
import { z } from "zod";
import {
  usePublishVideoMutation,
  useUpdateVideoMutation,
} from "@/slices/videoApiSlice";
import { useNavigate } from "react-router-dom";

interface VideoUploadFormData {
  _id?: string;
  title: string;
  description: string;
  videoFile: File | string | null;
  thumbnail: File | string | null;
  visibility: "private" | "public";
  playlists?: string[];
}

interface Step1Props {
  data: Partial<VideoUploadFormData>;
  onNext: (data: Partial<VideoUploadFormData>) => void;
}

interface Step2Props {
  data: Partial<VideoUploadFormData>;
  onNext: (data: Partial<VideoUploadFormData>) => void;
  navigateToStep: (step: number, data: Partial<VideoUploadFormData>) => void;
}

interface Step3Props {
  data: Partial<VideoUploadFormData>;
  navigateToStep: (step: number, data: Partial<VideoUploadFormData>) => void;
  onNext: (data: Partial<VideoUploadFormData>) => void;
  onBack: () => void;
}

interface Step4Props {
  data: Partial<VideoUploadFormData>;
  navigateToStep: (step: number, data: Partial<VideoUploadFormData>) => void;
  onBack: () => void;
  type: "Upload" | "Edit";
}

interface IPlaylist {
  _id: string;
  name: string;
}

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_VIDEO_FILE_SIZE_MB = 100;
const MAX_THUMBNAIL_FILE_SIZE_MB = 100;

const validateFileSize = (file: File, maxFileSize: number) => {
  if (file.size > maxFileSize * 1024 * 1024) {
    toast.error(
      `File size exceeds ${maxFileSize} MB. Please select a smaller video.`
    );
    return false;
  }
  return true;
};

const step2Schema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(MAX_TITLE_LENGTH, "Title cannot exceed 100 characters"),
  description: z
    .string()
    .max(MAX_DESCRIPTION_LENGTH, "Description cannot exceed 5000 characters"),
  thumbnail: z.union([
    z
      .instanceof(File)
      .refine(
        (file) => file.size / 1024 / 1024 < MAX_THUMBNAIL_FILE_SIZE_MB,
        `File size must be less than ${MAX_THUMBNAIL_FILE_SIZE_MB} MB`
      ),
    z.string().url("Invalid URL format for thumbnail"),
  ]),
});

const Step1 = ({ data, onNext }: Step1Props) => {
  console.log(data);
  const fileInputRef = useRef<HTMLInputElement | null>(null); // Reference for hidden input

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files && e.dataTransfer.files[0];
    if (droppedFile && validateFileSize(droppedFile, MAX_VIDEO_FILE_SIZE_MB)) {
      onNext({ videoFile: droppedFile, title: droppedFile.name });
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFileSize(selectedFile, MAX_VIDEO_FILE_SIZE_MB)) {
        onNext({ videoFile: selectedFile, title: selectedFile.name });
      }
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Programmatically open file dialog
    }
  };

  return (
    <>
      <div>
        <DialogHeader className="px-4 pt-4 pb-2 border-b border-b-gray-500">
          <DialogTitle className="text-xl">Upload Video</DialogTitle>
        </DialogHeader>
      </div>

      <div className="flex items-center justify-center min-h-[60vh] text-white">
        <div className="w-full max-w-lg p-6 rounded-lg">
          {/* Drag-and-Drop Box */}
          <div className="flex flex-col items-center px-10 py-5 space-y-1 text-center">
            <div
              className="rounded-full bg-[#0e0f0e] size-28 flex items-center justify-center cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleClick}
            >
              <Upload size={32} />
            </div>
            <p className="text-lg text-center text-gray-200">
              Drag and drop video file to upload
            </p>
            <p className="text-center text-gray-400 text-[12px]">
              Your video will be private until you publish it.
            </p>
            {/* Hidden Input for File Selection */}
            <input
              type="file"
              accept="video/*"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Select Files Button */}
          <div className="mt-5 text-center">
            <label className="px-4 py-2 text-black bg-gray-200 rounded cursor-pointer hover:bg-gray-400">
              Select file
              <input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* <div className="mt-6 text-center">
          <Button onClick={handleNext}>Next</Button>
        </div> */}
      </div>
    </>
  );
};

const Step2 = ({ data, onNext, navigateToStep }: Step2Props) => {
  console.log(data);

  const videoFileUrl = useMemo(
    () =>
      data.videoFile instanceof File
        ? URL.createObjectURL(data.videoFile)
        : data.videoFile,
    [data.videoFile]
  );

  const [title, setTitle] = useState(data.title || "");
  const [description, setDescription] = useState(data.description || "");
  const [thumbnail, setThumbnail] = useState<File | string | null>(
    data.thumbnail || null
  );

  const thumbnailPreview = useMemo(() => {
    if (thumbnail instanceof File) {
      return URL.createObjectURL(thumbnail);
    } else if (typeof thumbnail === "string") {
      return thumbnail;
    }
    return null;
  }, [thumbnail]);
  // const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
  //   (data.thumbnail as string) || null
  // );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate inputs
  const validateInputs = () => {
    const result = step2Schema.safeParse({
      title,
      description,
      thumbnail,
    });
    if (result.success) {
      setErrors({});
      return true;
    } else {
      const errorMessages = result.error.errors.reduce(
        (acc, curr) => ({ ...acc, [curr.path[0]]: curr.message }),
        {}
      );
      setErrors(errorMessages);
      return false;
    }
  };

  useEffect(() => {
    validateInputs();
  }, [title, description, thumbnail]);

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleTitleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setThumbnail(selectedFile);

      // Generate preview
      // setThumbnailPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleNextClick = () => {
    if (validateInputs()) {
      onNext({ thumbnail, title, description, videoFile: data.videoFile });
      setErrors({});
    }
  };

  return (
    <>
      <div className="sticky top-0 bg-[#282829] z-10 p-4 border-b border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl max-w-[650px] line-clamp-1">
            {title}
          </DialogTitle>
        </DialogHeader>
      </div>

      <Stepper
        step={2}
        navigateToStep={(step, stepData) => {
          if (!Object.keys(errors).length) {
            navigateToStep(step, stepData);
          }
        }}
        data={{ description, thumbnail, title, videoFile: data.videoFile }}
        hasErrors={{
          2: !!Object.keys(errors).length,
          3: false,
          4: false,
        }}
      />

      <div className="flex-1 p-4 overflow-y-auto">
        <section className="flex justify-between">
          <div className="grid w-[60%] gap-4">
            <div className="relative group">
              <p className="absolute hidden text-xs font-bold text-gray-500 right-4 bottom-3 group-focus-within:block">
                {title.length}/{MAX_TITLE_LENGTH}
              </p>
              <textarea
                id="name"
                value={title}
                rows={3}
                placeholder="Add a title that describes your video"
                className="peer bg-[#282828] text-sm text-white overflow-hidden resize-none placeholder-gray-500 border border-gray-600 rounded-lg px-3 pt-8 focus:outline-none focus:ring-2 focus:ring-gray-500 w-full"
                onChange={handleTitleChange}
              />
              <label
                htmlFor="name"
                className="absolute left-3 top-2 text-gray-400 text-sm transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-focus:top-[4px] peer-focus:text-xs peer-focus:text-gray-300"
              >
                Title (required)
              </label>
              {errors.title && (
                <p className="mt-1 text-xs text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="relative group">
              <p className="absolute hidden text-xs font-bold text-right text-gray-500 bottom-3 right-4 group-focus-within:block">
                {description.length}/{MAX_DESCRIPTION_LENGTH}
              </p>
              <textarea
                id="description"
                value={description}
                placeholder="Tell viewers about your video"
                rows={12}
                className="peer bg-[#282828] text-sm text-white overflow-hidden resize-none placeholder-gray-500 border border-gray-600 rounded-lg pl-3 pr-20 pt-8 focus:outline-none focus:ring-2 focus:ring-gray-500 w-full"
                onChange={handleDescriptionChange}
              />
              <label
                htmlFor="description"
                className="absolute left-3 top-2 text-gray-400 text-sm transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-focus:top-[4px] peer-focus:text-xs peer-focus:text-gray-300"
              >
                Description
              </label>
              {errors.description && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="flex flex-col">
              <p>Thumbnail</p>
              <div className="mt-4">
                <label
                  htmlFor="thumbnailInput"
                  className={`flex items-center justify-center ${
                    thumbnailPreview
                      ? "w-48 aspect-video overflow-hidden rounded-lg"
                      : "flex-col w-56 aspect-video border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:border-gray-300"
                  }`}
                >
                  {thumbnailPreview ? (
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail Preview"
                      className="object-cover w-full h-full cursor-pointer"
                    />
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-8 h-8 text-gray-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 16v-4m0 0v-4m0 4h4m-4 0H8m12-8H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2z"
                        />
                      </svg>
                      <span className="mt-2 text-sm text-gray-400">
                        Upload file
                      </span>
                    </>
                  )}
                </label>
                <input
                  id="thumbnailInput"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {errors.thumbnail && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.thumbnail}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#1e1e1f] rounded-lg h-max pb-6">
            {videoFileUrl && (
              <video
                src={videoFileUrl}
                className="rounded-t-lg w-80 aspect-video"
                controls
              />
            )}
            <p className="px-2 pt-6 text-sm">Filename:</p>
            <p className="px-2 text-lg font-bold max-w-72">
              {data.videoFile instanceof File
                ? data.videoFile.name
                : data.title}
            </p>
          </div>
        </section>
      </div>

      <div className="flex items-center justify-end w-full bg-[#2782729] p-3 border-t border-gray-700">
        <Button
          onClick={handleNextClick}
          className="px-6 text-lg tracking-wide rounded-3xl"
          disabled={!!Object.keys(errors).length}
        >
          Next
        </Button>
      </div>
    </>
  );
};

const Step3 = ({ data, onNext, onBack, navigateToStep }: Step3Props) => {
  const videoFileUrl = useMemo(
    () =>
      data.videoFile instanceof File
        ? URL.createObjectURL(data.videoFile)
        : data.videoFile,
    [data.videoFile]
  );
  const { register, watch } = useForm<Pick<VideoUploadFormData, "visibility">>({
    defaultValues: { visibility: data.visibility || "private" },
  });

  const selectedVisibility = watch("visibility");

  const handleNextClick = () => {
    onNext({
      visibility: selectedVisibility,
      thumbnail: data.thumbnail,
      title: data.title,
      description: data.description,
      videoFile: data.videoFile,
    });
  };

  return (
    <>
      <div className="sticky top-0 bg-[#282829] z-10 p-4 border-b border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl max-w-[650px] line-clamp-1">
            {data.title}
          </DialogTitle>
        </DialogHeader>
      </div>

      <Stepper
        step={3}
        navigateToStep={navigateToStep}
        data={{ ...data, visibility: selectedVisibility }}
        hasErrors={{
          2: false, // Specify errors for the current step
          3: false,
          4: false,
        }}
      />

      <div className="flex-1 p-4 overflow-y-auto">
        <section className="flex justify-between">
          <form className="px-12 mt-2">
            <h1 className="text-3xl font-bold">Visibility</h1>
            <p className="mb-3 text-sm text-gray-400">
              Choose when to publish and who can see your video
            </p>

            <div className="px-6 py-4 border border-gray-200 rounded-lg">
              <h2 className="text-xl font-semibold">Save or publish</h2>
              <p className="text-gray-400">
                Make your video{" "}
                <span className="font-semibold text-gray-300">public</span>
                ,&nbsp;
                <span className="font-semibold text-gray-300">
                  unlisted
                </span>{" "}
                or&nbsp;
                <span className="font-semibold text-gray-300">private</span>
              </p>

              <div className="mt-4 mb-6 space-y-6">
                {/* Radio Button: Private */}
                <div className="relative flex items-center">
                  <input
                    type="radio"
                    id="private"
                    value="private"
                    {...register("visibility")}
                    className="w-4 h-4 text-blue-600 border-gray-300 cursor-pointer focus:ring-blue-500"
                  />
                  <label
                    htmlFor="private"
                    className="ml-2 text-lg font-medium text-gray-300 cursor-pointer"
                  >
                    Private
                  </label>
                  <p className="absolute ml-6 text-sm text-gray-400 -bottom-[17px]">
                    Only you can watch your video
                  </p>
                </div>

                {/* Radio Button: Public */}
                <div className="relative flex items-center">
                  <input
                    type="radio"
                    id="public"
                    value="public"
                    {...register("visibility")}
                    className="w-4 h-4 text-blue-600 border-gray-300 cursor-pointer focus:ring-blue-500"
                  />
                  <label
                    htmlFor="public"
                    className="ml-2 text-lg font-medium text-gray-300 cursor-pointer"
                  >
                    Public
                  </label>
                  <p className="absolute ml-6 text-sm text-gray-400 -bottom-[17px]">
                    Everyone can watch your video
                  </p>
                </div>
              </div>
            </div>
          </form>

          {/* Video Preview */}
          <div className="bg-[#1e1e1f] rounded-lg h-max pb-6">
            {videoFileUrl && (
              <video
                src={videoFileUrl}
                className="rounded-t-lg w-80 aspect-video"
                controls
              />
            )}
            <p className="px-2 pt-6 text-sm">Filename:</p>
            <p className="px-2 text-lg font-bold max-w-72">{data.title}</p>
          </div>
        </section>
      </div>

      <div className="flex items-center justify-between w-full bg-[#2782729] p-3 border-t border-gray-700">
        <Button
          type="button"
          onClick={onBack}
          className="px-8 text-lg rounded-3xl"
        >
          Back
        </Button>
        <Button
          type="submit"
          className="px-8 text-lg rounded-3xl"
          onClick={handleNextClick}
        >
          Next
        </Button>
      </div>
    </>
  );
};

const Step4 = ({ data, onBack, navigateToStep, type }: Step4Props) => {
  const [searchedPlaylists, setSearchedPlaylists] = useState<IPlaylist[]>([]);
  const [SelectedPlayListIds, setSelectedPlaylistIds] = useState<string[]>(
    data.playlists || []
  );
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadProgress, setShowUploadProgress] = useState(false);

  const navigate = useNavigate();

  const videoFileUrl = useMemo(
    () =>
      data.videoFile instanceof File
        ? URL.createObjectURL(data.videoFile)
        : data.videoFile,
    [data.videoFile]
  );

  const { user } = useAppSelector((state) => state.auth);

  const { data: playlists } = useGetUserPlaylistNamesQuery(user?._id, {
    skip: !user?._id,
  });

  const [publishVideo, { isLoading: isPublishingVideo }] =
    usePublishVideoMutation();
  const [updateVideo, { isLoading: isUpdatingVideo }] =
    useUpdateVideoMutation();

  useEffect(() => {
    setSearchedPlaylists(playlists?.data);
  }, [playlists?.data]);

  const handleSearchPlaylist = (e: ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value.toLowerCase(); // Convert search term to lower case
    const filteredPlaylists = playlists?.data.filter(
      (playlist: IPlaylist) => playlist.name.toLowerCase().includes(searchTerm) // Convert playlist name to lower case
    );

    setSearchedPlaylists(filteredPlaylists);
  };

  const handleCheckboxChange = (playlistId: string) => {
    setSelectedPlaylistIds((prevSelectedIds) => {
      const updatedIds = prevSelectedIds.includes(playlistId)
        ? prevSelectedIds.filter((id) => id !== playlistId)
        : [...prevSelectedIds, playlistId];

      data.playlists = updatedIds;

      return updatedIds;
    });
  };

  // console.log("Selected Playlists", SelectedPlayListIds);

  const handleNewPlaylistCreate = (
    newPlaylistId: string,
    newPlaylistName: string
  ) => {
    const newPlaylistData: IPlaylist = {
      _id: newPlaylistId,
      name: newPlaylistName,
    };
    setSearchedPlaylists((prevPlaylists) => [
      newPlaylistData,
      ...prevPlaylists,
    ]);

    setSelectedPlaylistIds((prevSelectedIds) => {
      const updatedIds = prevSelectedIds.includes(newPlaylistId)
        ? prevSelectedIds.filter((id) => id !== newPlaylistId)
        : [...prevSelectedIds, newPlaylistId];

      data.playlists = updatedIds;

      return updatedIds;
    });
  };

  const handlePublishVideo = async () => {
    const payload = {
      videoFile: data.videoFile,
      title: data.title,
      description: data.description,
      thumbnail: data.thumbnail,
      visibility: data.visibility,
      playlistIds: SelectedPlayListIds,
    };

    setShowUploadProgress(true);

    try {
      const response = await publishVideo({
        data: payload,
        onProgress: (progress: number) => setUploadProgress(progress),
      }).unwrap();

      console.log(response);

      if (response.success) {
        setUploadProgress(100);
        setShowUploadProgress(false);

        toast.success("Video Published successfully");

        navigate("/");
      }
    } catch (error: any) {
      console.log(error?.data?.error || error);
      toast.error(
        `${error?.data?.error}` ||
          "Something went wrong during upload, please try after sometime"
      );
      setShowUploadProgress(false);
    }
  };

  const handleEditVideo = async () => {
    // Update video
    const payload = {
      _id: data._id,
      title: data.title,
      description: data.description,
      thumbnail: data.thumbnail,
      visibility: data.visibility,
      playlistIds: SelectedPlayListIds,
    };

    try {
      const response = await updateVideo({
        data: payload,
      }).unwrap();

      console.log(response);

      if (response.success) {
        toast.success("Changes saved successfully");

        navigate("/");
      }
    } catch (error: any) {
      console.log(error);

      console.log(error?.data?.error);
      toast.error(
        `${error?.data?.error}` ||
          "Something went wrong during saving changes, please try after sometime"
      );
    }
  };

  const handleAction = () => {
    if (type === "Upload") {
      handlePublishVideo();
    } else if (type === "Edit") {
      handleEditVideo();
    }
  };

  return (
    <>
      {showUploadProgress ? (
        <section className="flex flex-col items-center justify-center w-full h-full max-w-5xl p-8 mx-auto space-y-6 text-gray-200 shadow-2xl bg-gradient-to-br from-gray-800 to-gray-900 animate-fade-in">
          {/* Heading */}
          <h1 className="text-4xl font-extrabold text-center text-purple-400">
            Upload in Progress 🚀
          </h1>

          {/* Video Thumbnail */}
          {data.thumbnail && (
            <div className="flex justify-center w-full">
              <img
                src={
                  data.thumbnail instanceof File
                    ? URL.createObjectURL(data.thumbnail)
                    : ""
                }
                alt="Video Thumbnail"
                className="object-cover object-center h-48 rounded-md aspect-video"
              />
            </div>
          )}

          {/* Video Title */}
          {data?.title && (
            <p className="mx-auto mt-4 text-lg font-semibold text-center text-gray-300 max-w-96">
              {data.title}
            </p>
          )}

          {/* Progress Bar */}
          <div className="relative w-full h-5 overflow-hidden bg-gray-700 rounded-full">
            <div
              className="absolute top-0 left-0 h-full transition-all rounded-full bg-gradient-to-r from-purple-500 to-indigo-600"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>

          {/* Upload Percentage */}
          <p className="mt-2 text-lg font-medium text-center text-gray-300">
            {uploadProgress}% complete
          </p>

          {/* Completion Message */}
          {uploadProgress === 100 && (
            <div className="space-y-2">
              <p className="text-lg font-semibold text-center text-green-500">
                🎉 Upload complete!
              </p>
              <p className="text-base font-semibold text-center text-gray-200 animate-pulse">
                Please wait while we finish processing your data...
              </p>
            </div>
          )}
        </section>
      ) : (
        <>
          <div className="sticky top-0 bg-[#282829] z-10 p-4 border-b border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-xl max-w-[650px] line-clamp-1">
                {data.title}
              </DialogTitle>
            </DialogHeader>
          </div>

          <Stepper
            step={4}
            navigateToStep={navigateToStep}
            data={{ ...data, playlists: SelectedPlayListIds }}
            hasErrors={{
              2: false, // Specify errors for the current step
              3: false,
              4: false,
            }}
          />

          <div className="flex-1 p-4 overflow-y-auto">
            <section className="flex justify-between">
              <form className="px-12 mt-2">
                <h1 className="text-3xl font-bold">Playlists</h1>
                <p className="mb-3 text-sm text-gray-400">
                  Add your video to one or more playlists to organize your
                  content for viewers
                </p>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <div
                      // onClick={handleOpenModal}
                      className="flex justify-between px-6 py-4 bg-transparent border border-gray-300 rounded-lg cursor-pointer"
                    >
                      {SelectedPlayListIds.length === 0 && (
                        <p className="text-lg font-semibold">
                          Select Playlists
                        </p>
                      )}

                      {SelectedPlayListIds.length !== 0 && (
                        <p className="text-lg font-semibold">
                          {SelectedPlayListIds.length}{" "}
                          {`playlist${
                            SelectedPlayListIds.length === 1 ? "" : "s"
                          }`}
                        </p>
                      )}

                      <ChevronDown />
                    </div>
                  </DialogTrigger>

                  <DialogContent className="bg-[#1e1e1f] p-0">
                    <DialogHeader>
                      <div className="relative w-full px-4 pt-4">
                        <Search className="absolute top-7 left-7" />

                        <input
                          type="search"
                          name="search a playlist"
                          id="playlistSearch"
                          placeholder="Search for a playlist"
                          className="bg-[#161616] rounded-3xl px-14 py-3 max-w-[420px] w-full"
                          onChange={handleSearchPlaylist}
                        />
                      </div>
                    </DialogHeader>

                    <div className="flex flex-col overflow-y-auto max-h-72">
                      {searchedPlaylists?.length === 0 && (
                        <p className="pb-4 text-lg text-center">
                          No playlists available
                        </p>
                      )}
                      {searchedPlaylists?.length > 0 && (
                        <>
                          {searchedPlaylists
                            .filter((playlist: IPlaylist) =>
                              SelectedPlayListIds.includes(playlist._id)
                            ) // Selected playlists
                            .map((playlist: IPlaylist) => (
                              <div
                                className="flex items-center gap-3 px-4 py-1 hover:bg-[#0a0a0a]"
                                key={playlist._id}
                              >
                                <input
                                  type="checkbox"
                                  name={playlist.name}
                                  id={playlist._id}
                                  className="cursor-pointer bg-[#282829] size-4"
                                  onChange={() =>
                                    handleCheckboxChange(playlist._id)
                                  }
                                  checked={SelectedPlayListIds.includes(
                                    playlist._id
                                  )}
                                />
                                <label
                                  htmlFor={playlist._id}
                                  id={playlist._id}
                                  className="text-base tracking-wider cursor-pointer"
                                >
                                  {playlist.name}
                                </label>
                              </div>
                            ))}
                          {searchedPlaylists
                            .filter(
                              (playlist: IPlaylist) =>
                                !SelectedPlayListIds.includes(playlist._id)
                            ) // Unselected playlists
                            .map((playlist: IPlaylist) => (
                              <div
                                className="flex items-center gap-3 px-4 py-1 hover:bg-[#0a0a0a]"
                                key={playlist._id}
                              >
                                <input
                                  type="checkbox"
                                  name={playlist.name}
                                  id={playlist._id}
                                  className="cursor-pointer bg-[#282829] size-4"
                                  onChange={() =>
                                    handleCheckboxChange(playlist._id)
                                  }
                                  checked={SelectedPlayListIds.includes(
                                    playlist._id
                                  )}
                                />
                                <label
                                  htmlFor={playlist._id}
                                  id={playlist._id}
                                  className="text-base tracking-wider cursor-pointer"
                                >
                                  {playlist.name}
                                </label>
                              </div>
                            ))}
                        </>
                      )}
                    </div>

                    <div className="flex items-center justify-between w-full bg-[#2782729] p-3 border-t border-gray-700">
                      {/* new playlist create */}

                      <NewChannelPlaylist
                        onNewPlaylistCreate={handleNewPlaylistCreate}
                      />

                      <Button
                        type="submit"
                        className="px-8 text-lg rounded-3xl bg-[#282829] text-white hover:bg-[#282826]"
                        onClick={() => setIsModalOpen(false)}
                      >
                        Done
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </form>

              {/* Video Preview */}
              <div className="bg-[#1e1e1f] rounded-lg h-max pb-6">
                {videoFileUrl && (
                  <video
                    src={videoFileUrl}
                    className="rounded-t-lg w-80 aspect-video"
                    controls
                  />
                )}
                <p className="px-2 pt-6 text-sm">Filename:</p>
                <p className="px-2 text-lg font-bold max-w-72">{data.title}</p>
              </div>
            </section>
          </div>

          <div className="flex items-center justify-between w-full bg-[#2782729] p-3 border-t border-gray-700">
            <Button
              type="button"
              onClick={onBack}
              className="px-8 text-lg rounded-3xl"
            >
              Back
            </Button>
            <Button
              type="submit"
              className="px-8 text-lg rounded-3xl"
              onClick={handleAction}
              disabled={isPublishingVideo || isUpdatingVideo}
            >
              {type === "Upload" ? (
                "Publish"
              ) : isUpdatingVideo ? (
                <>
                  <Loader2 size={20} className="mr-2 animate-spin" />
                  <p>Saving Changes</p>
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </>
      )}
    </>
  );
};

interface StepwiseUploadProps {
  initialStep: number;
  type: "Upload" | "Edit";
  editData?: Partial<VideoUploadFormData>;
}

const StepwiseUpload = ({
  initialStep = 1,
  type = "Upload",
  editData,
}: StepwiseUploadProps) => {
  const [step, setStep] = useState(initialStep || 1);
  const [data, setData] = useState<Partial<VideoUploadFormData>>(
    type === "Edit" ? editData! : {}
  );

  const handleNext = (newData: Partial<VideoUploadFormData>) => {
    console.log(newData);

    setData((prev) => ({ ...prev, ...newData }));
    setStep((prev) => prev + 1);
  };

  const handleBack = () => setStep((prev) => prev - 1);

  const handleNavigateToStep = (
    finalStep: number,
    newData: Partial<VideoUploadFormData>
  ) => {
    console.log(newData);

    setData((prev) => ({ ...prev, ...newData }));
    setStep(finalStep);
  };

  const stepStyles: Record<number, string> = {
    1: "bg-[#282829] p-0 sm:max-w-5xl max-h-[90vh] h-full",
    2: "bg-[#282829] p-0 sm:max-w-5xl flex flex-col max-h-[90vh] h-full",
    3: "bg-[#282829] p-0 sm:max-w-5xl flex flex-col max-h-[90vh] h-full",
    4: "bg-[#282829] p-0 sm:max-w-5xl flex flex-col max-h-[90vh] h-full",
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {type === "Upload" ? (
          <Button
            variant="outline"
            className="flex items-center gap-2 rounded-full"
          >
            <Upload size={16} />
            <span className="font-semibold">Create</span>
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="flex items-center gap-2 rounded-full"
          >
            <Edit size={12} />
            {/* <span className="font-semibold">Edit</span> */}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className={stepStyles[step]}>
        {step === 1 && <Step1 data={data} onNext={handleNext} />}
        {step === 2 && (
          <Step2
            data={data}
            onNext={handleNext}
            navigateToStep={handleNavigateToStep}
          />
        )}
        {step === 3 && (
          <Step3
            data={data}
            onNext={handleNext}
            onBack={handleBack}
            navigateToStep={handleNavigateToStep}
          />
        )}
        {step === 4 && (
          <Step4
            data={data}
            onBack={handleBack}
            navigateToStep={handleNavigateToStep}
            type={type}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

interface StepperProps {
  step: number;
  navigateToStep: (step: number, data: Partial<VideoUploadFormData>) => void;
  data: Partial<VideoUploadFormData>;
  hasErrors: { [step: number]: boolean };
}

const Stepper = ({ step, data, navigateToStep, hasErrors }: StepperProps) => {
  const steps = ["Details", "Visibility", "Add to Playlist"];

  return (
    <main className="relative flex items-center w-full px-8">
      {/* Render the horizontal line */}
      <div className="absolute left-[calc(18%)] right-[calc(18%)] h-[3px] bg-gray-300 top-[81%]"></div>

      {steps.map((label, index) => {
        const stepIndex = index + 2;
        const isCurrent = step === stepIndex;
        const isCompleted = step > stepIndex;
        const isError = hasErrors[stepIndex] || false;

        return (
          <div
            key={index}
            className={`relative flex flex-col items-center text-center w-min`}
            style={{ flex: 1 }}
          >
            <h2
              onClick={() => navigateToStep(index + 2, data)}
              className={`mt-2 text-lg font-semibold cursor-pointer p-2 ${
                isError
                  ? "text-red-500 cursor-not-allowed"
                  : isCurrent
                  ? "text-gray-200 hover:bg-gray-300/80 hover:text-black rounded-lg"
                  : "text-gray-500 hover:bg-gray-400/50 px-4 rounded-lg hover:text-gray-300"
              }`}
            >
              {label}
            </h2>

            {/* Step indicator */}
            <div
              onClick={() => navigateToStep(index + 2, data)}
              className={`z-10 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer ${
                isCurrent
                  ? `w-7 h-7 ${
                      isError && "dark:bg-black border-[4px] border-red-500"
                    }`
                  : "w-5 h-5"
              }`}
            >
              {/* {isCompleted ? (
                <span className="text-sm text-black">✔</span>
              ) : (
                <span
                  className={`rounded-full bg-gray-950 ${
                    isCurrent ? "w-3.5 h-3.5" : "w-2.5 h-2.5"
                  }`}
                ></span>
              )} */}

              {isCompleted && !isError ? (
                <span className="text-sm text-black">✔</span>
              ) : isError ? (
                <span className="text-sm text-red-500">
                  <CircleAlert />
                </span>
              ) : (
                <span
                  className={`rounded-full ${
                    isCurrent
                      ? "bg-gray-950 w-3.5 h-3.5"
                      : "bg-gray-950 w-2.5 h-2.5"
                  }`}
                ></span>
              )}
            </div>
            {/* Step label */}
          </div>
        );
      })}
    </main>
  );
};

export default StepwiseUpload;
