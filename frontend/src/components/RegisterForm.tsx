import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import RegisterInput from "./RegisterInput";
import { useRegisterMutation } from "@/slices/usersApiSlice";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
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

export const registerFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  userName: z.string().min(2).max(30),
  fullName: z.string().min(2).max(50),
  avatar: z.any().refine(
    (files) => {
      return Array.from(files).every((file) => file instanceof File);
    },
    { message: "Expected a file" }
  ),
  coverImage: z
    .any()
    .refine(
      (files) => {
        return Array.from(files).every((file) => file instanceof File);
      },
      { message: "Expected a file" }
    )
    .optional(),
});

const RegisterForm = () => {
  const [register, { isLoading }] = useRegisterMutation();

  const navigate = useNavigate();

  // 1. Define your form.
  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
    },
  });

  // 2. Define a submit handler.
  const onSubmit = async (userData: z.infer<typeof registerFormSchema>) => {
    try {
      toast.info(`User Registration in progress..."`);
      await register({ ...userData }).unwrap();

      toast.success("User Registered.");

      setTimeout(() => navigate("/login"), 2000);

      console.log("user registered successfully");
    } catch (err: unknown) {
      if (isErrorReponse(err)) {
        console.error("error registering user", err);
        toast.error(`${err?.data?.error}`);
      }
    }
  };

  return (
    <Form {...form}>
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 shadow-2xl rounded-xl">
          <h2 className="text-3xl font-bold text-center text-purple-400">
            Join VideoCave
          </h2>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <RegisterInput
                type="text"
                name="fullName"
                label="Full Name"
                placeholder="John Doe"
                control={form.control}
                // icon={<User className="w-5 h-5 text-gray-400" />}
              />
              <RegisterInput
                type="text"
                name="userName"
                label="Username"
                placeholder="johndoe123"
                control={form.control}
                // icon={<User className="w-5 h-5 text-gray-400" />}
              />
            </div>
            <RegisterInput
              type="email"
              name="email"
              label="Email"
              placeholder="you@example.com"
              control={form.control}
              // icon={<Mail className="w-5 h-5 text-gray-400" />}
            />
            <RegisterInput
              type="password"
              name="password"
              label="Password"
              placeholder="••••••••"
              control={form.control}
              // icon={<Lock className="w-5 h-5 text-gray-400" />}
            />
            <RegisterInput
              type="file"
              name="avatar"
              label="Profile Picture"
              control={form.control}
              // icon={<Image className="w-5 h-5 text-gray-400" />}
            />
            <RegisterInput
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
                  <span>Registering...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
          <p className="text-center text-gray-400">
            Already have an account?{" "}
            <a href="/login" className="text-purple-400 hover:underline">
              Log in
            </a>
          </p>
        </div>
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </Form>
  );
};

export default RegisterForm;
