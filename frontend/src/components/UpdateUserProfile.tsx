import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import { useUpdateProfileDetailsMutation } from "@/slices/usersApiSlice";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import UpdateUserProfileInput from "./UpdateUserProfileInput";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { updateUserPostEmailVerification } from "@/slices/authSlice";

const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];

const fileValidator = (isRequired: boolean) =>
  z
    .union([
      z.instanceof(File), // Accept arrays of files
      z.undefined(), // Allow undefined for optional files
    ])
    .refine(
      (file) => (isRequired ? !!file : true),
      { message: isRequired ? "File is required" : undefined } // If required, ensure at least one file
    )
    .refine((file) => !file || allowedMimeTypes.includes(file.type), {
      message: "File must be a valid image (JPEG, PNG, GIF)",
    });

export const userProfileSchema = z.object({
  userName: z
    .string()
    .min(2, "Username must be at least 2 characters long")
    .max(30, "Username must be at most 30 characters long")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  avatar: fileValidator(true), // Avatar is required
  coverImage: fileValidator(false), // Cover image is optional
});

const UpdateUserProfile = () => {
  const [updateProfileDetails, { isLoading }] =
    useUpdateProfileDetailsMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user } = useAppSelector((state) => state.auth);

  // console.log(user);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // 1. Define your form.
  const form = useForm<z.infer<typeof userProfileSchema>>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      userName: "",
    },
  });

  // 2. Define a submit handler.
  const onSubmit = async (userData: z.infer<typeof userProfileSchema>) => {
    try {
      const response = await updateProfileDetails({ ...userData }).unwrap();

      console.log(response);

      if (response.success) {
        console.log("success ran");
        dispatch(updateUserPostEmailVerification(response.data));

        toast.success("User profile updated", {
          onClose: () => navigate("/"),
        });
      }
    } catch (err: any) {
      console.error("error registering user", err);
      toast.error(`${err?.data?.error}` || "An error occurred while updating!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <Form {...form}>
        <div className="w-full max-w-md p-8 space-y-4 shadow-2xl bg-gradient-to-bl from-gray-800 to-gray-900 rounded-l-xl min-h-[632px] flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-center text-purple-400">
            Update Your Profile
          </h2>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <UpdateUserProfileInput
              type="text"
              name="userName"
              label="Username"
              placeholder="johndoe123"
              control={form.control}
              // icon={<User className="w-5 h-5 text-gray-400" />}
            />

            <UpdateUserProfileInput
              type="file"
              name="avatar"
              label="Profile Picture"
              control={form.control}
              // icon={<Image className="w-5 h-5 text-gray-400" />}
            />
            <UpdateUserProfileInput
              type="file"
              name="coverImage"
              label="Cover Image"
              control={form.control}
              // icon={<FileImage className="w-5 h-5 text-gray-400" />}
            />

            <Button
              type="submit"
              className="w-full py-3 text-lg font-semibold text-white transition-colors duration-300 bg-purple-600 rounded-lg shadow-lg hover:bg-purple-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 size={24} className="mr-2 animate-spin" />
                  <span>Updating...</span>
                </div>
              ) : (
                "Finish Update"
              )}
            </Button>
          </form>
        </div>

        <section className="w-full max-w-xl p-8 space-y-4 text-gray-200 shadow-2xl bg-gradient-to-br from-gray-800 to-gray-900 rounded-r-xl">
          <h1 className="text-3xl font-bold text-purple-400">
            Profile Update Guidelines
          </h1>
          <p className="text-gray-400">
            Please adhere to the following instructions to ensure a smooth
            profile update experience.
          </p>

          <div className="space-y-2">
            <h2 className="flex items-center text-lg font-semibold text-purple-300">
              <span className="mr-2">🔤</span> Username
            </h2>
            <ul className="pl-6 space-y-1 list-disc">
              <li>Must be between 2 and 30 characters long.</li>
              <li>
                Can contain only letters (a-z, A-Z), numbers (0-9), and
                underscores (_).
              </li>
              <li>
                Example: <span className="text-purple-400">john_doe123</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="flex items-center text-lg font-semibold text-purple-300">
              <span className="mr-2">🖼️</span> Profile Picture
            </h2>
            <ul className="pl-6 space-y-1 list-disc">
              <li>File is required.</li>
              <li>Allowed formats: JPEG, PNG, GIF.</li>
              <li>
                It's recommended that you use a picture that's at least 98 x 98
                pixels and 4 MB or less.
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="flex items-center text-lg font-semibold text-purple-300">
              <span className="mr-2">🖼️</span> Cover Image
            </h2>
            <ul className="pl-6 space-y-1 list-disc">
              <li>File is optional.</li>
              <li>Allowed formats: JPEG, PNG, GIF.</li>
              <li>
                For the best results on all devices, use an image that's at
                least 2048 x 1152 pixels and 6 MB or less
              </li>
            </ul>
          </div>
        </section>
      </Form>
    </div>
  );
};

export default UpdateUserProfile;
