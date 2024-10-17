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
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

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

      toast.error(err?.data?.error || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gray-50 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
            Reset Your Password
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="new-password" className="sr-only">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                {...register("newPassword", {
                  required: "New password is required",
                })}
                className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="New Password"
              />
              {errors.newPassword && (
                <p className="text-xs italic text-red-500">
                  {errors.newPassword.message}
                </p>
              )}
            </div>
            <div>
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
                      return "Your passwords do not match";
                    }
                  },
                })}
                className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
              />
              {errors.confirmPassword && (
                <p className="text-xs italic text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
