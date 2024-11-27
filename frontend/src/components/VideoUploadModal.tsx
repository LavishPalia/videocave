import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

interface VideoUploadFormData {
  title: string;
  description: string;
  videoFile: File | null;
  thumbnail: File | null;
}

export function VideoUploadModel() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadProgress, setShowUploadProgress] = useState(false);
  const [uploadedData, setUploadedData] = useState<{
    title: string;
    thumbnailUrl: string;
  } | null>(null);

  const [publishVideo, { isLoading }] = usePublishVideoMutation();

  const {
    register,
    handleSubmit,
    watch,
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
        toast.success("Video Published successfully");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(`${err?.data?.error}`);
      setShowUploadProgress(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Upload size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        {showUploadProgress ? (
          <section className="flex flex-col items-center justify-center w-full max-w-2xl p-8 mx-auto space-y-6 text-gray-200 shadow-2xl rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 animate-fade-in">
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
          <>
            <DialogHeader>
              <DialogTitle>Upload Video</DialogTitle>
              <DialogDescription className="text-[18px]">
                Please provide the details below to upload your video. Ensure
                that the title and description accurately reflect the content of
                your video. Once you've selected your thumbnail and video file,
                click 'Upload' to start the upload process.
              </DialogDescription>
            </DialogHeader>
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
                    validate: (file: File | null) => {
                      if (file && file.size > 100 * 1024 * 1024) {
                        return "Upload a file with size less than 100 MB";
                      }
                    },
                  })}
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
                    validate: (file: File | null) => {
                      if (file && file.size > 6 * 1024 * 1024) {
                        return "Upload a file with size less than 6 MB";
                      }
                    },
                  })}
                />
                {errors.thumbnail && (
                  <p className="w-3/4 mt-1 mb-2 text-xs italic text-red-500">
                    {errors.thumbnail.message}
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button type="submit">Upload</Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
