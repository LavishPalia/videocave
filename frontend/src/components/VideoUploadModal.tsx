import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { usePublishVideoMutation } from "@/slices/videoApiSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface VideoUploadFormData {
  title: string;
  description: string;
  videoFile: FileList | null;
  thumbnail: FileList | null;
}

export function VideoUploadModel() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadProgress, setShowUploadProgress] = useState(false);
  const [uploadedData, setUploadedData] = useState<{
    title: string;
    thumbnailUrl: string;
  } | null>(null);

  const navigate = useNavigate();

  const [publishVideo, { isLoading }] = usePublishVideoMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VideoUploadFormData>();

  const handleFormSubmit = async (data: VideoUploadFormData) => {
    const thumbnailFile =
      data.thumbnail instanceof FileList ? data.thumbnail[0] : null;
    const videoFile =
      data.videoFile instanceof FileList ? data.videoFile[0] : null;

    const videoData = {
      title: data.title,
      description: data.description,
      videoFile,
      thumbnail: thumbnailFile,
    };

    const thumbnailUrl = thumbnailFile && URL.createObjectURL(thumbnailFile);
    setUploadedData({
      title: data.title,
      thumbnailUrl: thumbnailUrl as string,
    });

    setShowUploadProgress(true);
    try {
      const response = await publishVideo({
        data: videoData,
        onProgress: (progress: number) => setUploadProgress(progress),
      }).unwrap();

      if (response.success) {
        setUploadProgress(100);
        setShowUploadProgress(false);

        reset({
          title: "",
          description: "",
          videoFile: null,
          thumbnail: null,
        });

        toast.success("Video Published successfully");
        navigate("/your-videos");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(
        `${err?.data?.error}` ||
          "Something went wrong during upload, please try after sometime"
      );
      setShowUploadProgress(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 rounded-full"
        >
          <Upload size={16} />
          <span className="font-semibold">Create</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-7xl bg-[#202021]">
        {showUploadProgress ? (
          <section className="flex flex-col items-center justify-center w-full max-w-4xl p-8 mx-auto space-y-6 text-gray-200 shadow-2xl rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 animate-fade-in">
            {/* Heading */}
            <h1 className="text-4xl font-extrabold text-center text-purple-400">
              Upload in Progress 🚀
            </h1>

            {/* Video Thumbnail */}
            {uploadedData?.thumbnailUrl && (
              <div className="flex justify-center w-full">
                <img
                  src={uploadedData.thumbnailUrl}
                  alt="Video Thumbnail"
                  className="object-cover object-center h-48 rounded-md aspect-video"
                />
              </div>
            )}

            {/* Video Title */}
            {uploadedData?.title && (
              <p className="mx-auto mt-4 text-lg font-semibold text-center text-gray-300 max-w-96">
                {uploadedData.title}
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
              <p className="text-lg font-semibold text-center text-green-400 animate-pulse">
                🎉 Upload complete! Processing your data...
              </p>
            )}
          </section>
        ) : (
          <div className="grid items-center grid-cols-1 gap-2 sm:grid-cols-2">
            <section>
              <DialogHeader>
                <DialogTitle className="text-3xl">Upload Video</DialogTitle>
              </DialogHeader>

              <hr className="my-2" />

              <form
                onSubmit={handleSubmit(handleFormSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    type="text"
                    {...register("title", {
                      required: "Title is required",
                    })}
                  />
                  {errors.title && (
                    <p className="w-3/4 mt-1 mb-2 text-xs italic text-red-500">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register("description", {
                      required: "Description is required",
                    })}
                  />

                  {errors.description && (
                    <p className="w-3/4 mt-1 mb-2 text-xs italic text-red-500">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video">Video</Label>
                  <Input
                    id="video"
                    type="file"
                    accept="video/*"
                    {...register("videoFile", {
                      required: "Video file is required",
                    })}
                    onChange={(e) => {
                      const fileList = e.target.files;
                      if (fileList && fileList[0]) {
                        const file = fileList[0];
                        if (file.size > 100 * 1024 * 1024) {
                          toast.error(
                            "File size exceeds 100 MB. Please select a smaller video."
                          );
                          e.target.value = ""; // Reset the file input
                        }
                      }
                    }}
                  />

                  {errors.videoFile && (
                    <p className="w-3/4 mt-1 mb-2 text-xs italic text-red-500">
                      {errors.videoFile.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnail">Thumbnail</Label>
                  <Input
                    id="thumbnail"
                    type="file"
                    accept="image/*"
                    {...register("thumbnail", {
                      required: "Thumbnail is required",
                    })}
                    onChange={(e) => {
                      const fileList = e.target.files;
                      if (fileList && fileList[0]) {
                        const file = fileList[0];
                        if (file.size > 6 * 1024 * 1024) {
                          toast.error(
                            "File size exceeds 6 MB. Please select a smaller thumbnail."
                          );
                          e.target.value = ""; // Reset the file input
                        }
                      }
                    }}
                  />

                  {errors.thumbnail && (
                    <p className="w-3/4 mt-1 mb-2 text-xs italic text-red-500">
                      {errors.thumbnail.message}
                    </p>
                  )}
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={isLoading} className="w-full">
                    Upload
                  </Button>
                </DialogFooter>
              </form>
            </section>

            {/* Guideline section */}
            <section className="hidden w-full max-w-xl p-8 space-y-4 text-sm text-gray-200 sm:block rounded-r-xl">
              <h1 className="text-3xl font-bold text-purple-400">
                Video Upload Guidelines
              </h1>
              <p className="text-gray-400">
                Please follow these instructions to ensure a smooth video upload
                process.
              </p>

              <div className="space-y-2">
                <h2 className="flex items-center text-lg font-semibold text-purple-300">
                  <span className="mr-2">🎥</span> Video File
                </h2>
                <ul className="pl-6 space-y-1 list-disc">
                  <li>The video file is required.</li>
                  <li>Allowed formats: MP4, MOV, AVI, MKV.</li>
                  <li>Maximum file size: 100 MB.</li>
                  {/* <li>
                    Ensure the video is of high quality and does not violate any
                    content policies.
                  </li> */}
                </ul>
              </div>

              <div className="space-y-2">
                <h2 className="flex items-center text-lg font-semibold text-purple-300">
                  <span className="mr-2">🖼️</span> Thumbnail
                </h2>
                <ul className="pl-6 space-y-1 list-disc">
                  <li>The thumbnail image is required.</li>
                  <li>Allowed formats: JPEG, PNG.</li>
                  <li>Maximum file size: 6 MB.</li>
                  <li>Recommended dimensions: 1280 x 720 pixels.</li>
                  <li>
                    Choose a visually appealing thumbnail relevant to your video
                    content.
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h2 className="flex items-center text-lg font-semibold text-purple-300">
                  <span className="mr-2">📝</span> Video Title & Description
                </h2>
                <ul className="pl-6 space-y-1 list-disc">
                  <li>
                    The title is required and should be concise yet descriptive.
                  </li>
                  <li>
                    Provide a detailed description to give viewers context about
                    your video.
                  </li>
                  <li>Avoid using inappropriate or misleading language.</li>
                </ul>
              </div>
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
