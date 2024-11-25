import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import LoginInput from "../components/LoginInput";
import { useForgotPasswordMutation } from "@/slices/usersApiSlice";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useState } from "react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const ForgetPassword = () => {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [linkSent, setLinkSent] = useState(false);

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: z.infer<typeof forgotPasswordSchema>) {
    try {
      await forgotPassword(data).unwrap();
      setLinkSent(true);
      toast.success("Password reset email sent. Please check your inbox.");
      form.reset();
    } catch (err: any) {
      toast.error(err?.data?.error || "An error occurred. Please try again.");
    }
  }

  if (linkSent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="w-full max-w-md p-8 text-center bg-gray-800 rounded-lg shadow-2xl">
          <h2 className="mb-6 text-3xl font-bold text-gray-100">Email Sent</h2>
          <p className="text-gray-300">
            A password reset link has been sent to your email. Please check your
            inbox and follow the instructions to reset your password.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-900 to-gray-800">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-2xl">
        <h2 className="mb-6 text-3xl font-bold text-center text-gray-100">
          Forgot Password
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
            <Button
              type="submit"
              className="w-full py-3 font-semibold text-white transition duration-300 ease-in-out transform rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ForgetPassword;
