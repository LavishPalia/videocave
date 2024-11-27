import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useResetPasswordMutation } from "../slices/usersApiSlice";
import { toast } from "react-toastify";

interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [resetPassword] = useResetPasswordMutation();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      const response = await resetPassword({
        token,
        newPassword: data.newPassword,
      }).unwrap();
      if (response.success) {
        toast.success(response.message || "Password reset successfully");
        navigate("/login");
      } else {
        toast.error(response.message || "Failed to reset password");
      }
    } catch (err: any) {
      console.log(err);

      if (err?.data?.error === "jwt expired") {
        toast.error("Reset password link has expired. Please try again");
        return;
      }
      toast.error(err?.data?.error || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap justify-center min-h-screen bg-gray-900 md:items-center sm:px-6 lg:px-8">
      <div className="w-full max-w-xl p-4 space-y-8 rounded-l-lg bg-gradient-to-br from-gray-800 to-gray-900 min-h-[388px] flex flex-col justify-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-center text-purple-400">
            Reset Your Password
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div className="flex flex-col items-center">
              <label htmlFor="new-password" className="sr-only">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                {...register("newPassword", {
                  required: "New password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters long",
                  },
                  pattern: {
                    value:
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                    message:
                      "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
                  },
                })}
                className="relative block w-3/4 px-3 py-2 text-gray-200 placeholder-gray-500 bg-black border border-gray-300 rounded-none appearance-none rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="New Password"
              />
              {errors.newPassword && (
                <p className="w-3/4 mt-1 mb-2 text-xs italic text-red-500">
                  {errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="flex flex-col items-center">
              <label htmlFor="confirm-password" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                {...register("confirmPassword", {
                  required: "Confirm password is required",
                  validate: (val: string) => {
                    if (watch("newPassword") != val) {
                      return "Passwords do not match";
                    }
                  },
                })}
                className="relative block w-3/4 px-3 py-2 text-gray-200 placeholder-gray-500 bg-black border border-gray-300 rounded-none appearance-none rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
              />
              {errors.confirmPassword && (
                <p className="w-3/4 mt-1 mb-2 text-xs italic text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isLoading}
              className="relative flex justify-center w-3/4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
      <section className="w-full max-w-xl p-8 space-y-8 text-gray-200 shadow-2xl bg-gradient-to-tl from-gray-800 to-gray-900 rounded-r-xl">
        <h1 className="text-3xl font-bold text-purple-400">
          Reset Password Guidelines
        </h1>
        <p className="text-gray-400">
          Follow these tips to reset your password without any errors.
        </p>

        {/* Password Guidelines */}
        <div className="space-y-2">
          <h2 className="flex items-center text-lg font-semibold text-purple-300">
            <span className="mr-2">🔒</span>New Password
          </h2>
          <ul className="pl-6 space-y-1 list-disc">
            <li>At least 8 characters long.</li>
            <li>Includes at least one uppercase letter.</li>
            <li>Includes at least one lowercase letter.</li>
            <li>Includes at least one digit.</li>
            <li>Includes at least one special character (e.g., @, $, !).</li>
            <li>
              Example: <span className="text-purple-400">Secure@123</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default ResetPassword;
