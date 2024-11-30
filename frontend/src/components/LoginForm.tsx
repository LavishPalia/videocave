import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import LoginInput from "./LoginInput";
import { useLoginMutation } from "@/slices/usersApiSlice";
import { Link, useNavigate } from "react-router-dom";
import { clearLogoutMessage, setUserCredentials } from "@/slices/authSlice";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";

export const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const LoginForm = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const [login, { isLoading }] = useLoginMutation();

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoggedIn, user, logoutMessage } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (logoutMessage) {
      toast.info(logoutMessage, {
        autoClose: 4000,
      });

      dispatch(clearLogoutMessage());
    }
  }, [logoutMessage, dispatch]);

  useEffect(() => {
    if (!isLoggedIn) return;
    if (!user?.isEmailVerified) {
      navigate("/verify-email");
    } else if (user?.userName.startsWith("user_")) {
      navigate("/update-profile");
    } else {
      navigate("/");
    }
  }, [isLoggedIn, user, navigate]);

  // 1. Define your form.
  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(userData: z.infer<typeof loginFormSchema>) {
    try {
      const response = await login({ ...userData }).unwrap();

      dispatch(setUserCredentials(response.data));

      toast.success(`Logged In Successfully`);
    } catch (err: any) {
      console.error(err);
      toast.error(`${err?.data?.error}`);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-900 to-gray-800">
      <div className="w-full max-w-lg p-8 bg-gray-800 rounded-lg shadow-2xl">
        <h2 className="mb-6 text-3xl font-bold text-center text-gray-100">
          Welcome to{" "}
          <span className="inline-block text-transparent transition-all delay-100 bg-transparent hover:scale-105 bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            VideoCave!
          </span>
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <LoginInput
              type="email"
              name="email"
              label="Email"
              placeholder="Enter your email"
              control={form.control}
            />
            <LoginInput
              type={isPasswordVisible ? "text" : "password"}
              name="password"
              label="Password"
              placeholder="Enter your password"
              control={form.control}
              trailingIcon={
                // Add eye icon here
                isPasswordVisible ? (
                  <EyeOff
                    className="text-gray-400"
                    onClick={() => setIsPasswordVisible(false)}
                  />
                ) : (
                  <Eye
                    className="text-gray-400"
                    onClick={() => setIsPasswordVisible(true)}
                  />
                )
              }
            />
            <div className="flex items-center justify-center mb-6">
              {/* <label className="flex items-center">
                <input
                  type="checkbox"
                  className="bg-gray-700 border-gray-600 form-checkbox"
                />
                <span className="ml-2 text-sm text-gray-300">Remember me</span>
              </label> */}
              <Link
                to="/forgot-password"
                className="tracking-wide text-blue-400 hover:underline hover:underline-offset-4"
              >
                Forgot password? Reset it here
              </Link>
            </div>
            <Button
              type="submit"
              className="w-full py-3 font-semibold text-white transition duration-300 ease-in-out transform rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Log In"
              )}
            </Button>
          </form>
        </Form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-lg text-blue-400 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
