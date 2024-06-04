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
import { useState, ChangeEvent, FormEvent } from "react";
import { Textarea } from "./ui/textarea";
import { usePublishVideoMutation } from "@/slices/videoApiSlice";
import { Slide, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type ErrorResponse = {
  status: number;
  data: {
    error: string;
    success: boolean;
    errors: any[];
  };
};

function isErrorReponse(obj: any): obj is ErrorResponse {
  return (
    obj &&
    typeof obj.status === "number" &&
    obj.data &&
    typeof obj.data.error === "string" &&
    typeof obj.data.success === "boolean" &&
    Array.isArray(obj.data.errors)
  );
}

export function VideoUploadModel() {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [publishVideo, { isLoading }] = usePublishVideoMutation();

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await publishVideo({
        title,
        description,
        thumbnail,
        videoFile,
      });

      if (response) {
        toast.success("Video Published successfully");
      }
    } catch (err) {
      if (isErrorReponse(err)) {
        console.error(err);
        toast.error(`${err?.data?.error}`);
      }
    }
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (
    e: ChangeEvent<HTMLTextAreaElement>
  ): void => {
    setDescription(e.target.value);
  };

  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      setThumbnail(e.target.files[0]);
    }
  };

  const handleVideoChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      setVideoFile(e.target.files[0]);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Upload />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Upload Video</DialogTitle>
          <DialogDescription className="text-[18px]">
            Please provide the details below to upload your video. Ensure that
            the title and description accurately reflect the content of your
            video. Once you've selected your thumbnail and video file, click
            'Upload' to start the upload process.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={handleTitleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={handleDescriptionChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video">Video</Label>
            <Input
              id="video"
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail</Label>
            <Input
              id="thumbnail"
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              required
            />
          </div>
          <DialogFooter>
            {isLoading ? (
              <p
                className="inline-flex items-center justify-center whitespace-nowrap 
                rounded-md text-sm font-medium ring-offset-background transition-colors 
                focus-visible:outline-none focus-visible:ring-2 
                focus-visible:ring-ring focus-visible:ring-offset-2 
                disabled:pointer-events-none disabled:opacity-50"
              >
                Video upload in progress...
              </p>
            ) : (
              <Button type="submit">Upload</Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
      <ToastContainer
        autoClose={2000}
        hideProgressBar={true}
        position="bottom-left"
        theme="dark"
        transition={Slide}
        stacked
      />
    </Dialog>
  );
}
