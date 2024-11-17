import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Mail } from "lucide-react";
import { Slide, toast, ToastContainer } from "react-toastify";
import { Button } from "@/components/ui/button";
import { useResendVerificationEmailMutation } from "@/slices/usersApiSlice";
import { useAppSelector } from "@/app/hooks";

const VerifyEmailScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [resendVerificationEmail] = useResendVerificationEmailMutation();

  const { user } = useAppSelector((state) => state.auth);

  const email = user?.email;

  console.log(user);

  const handleResendVerification = async () => {
    if (!email) {
      toast.error("Email address not found. Please login again.");
      navigate("/login");
      return;
    }

    setIsLoading(true);
    try {
      const response = await resendVerificationEmail({ email }).unwrap();

      console.log(response.success, response.message);

      if (response.success) {
        toast.success(
          response.message || "Verification email sent successfully"
        );
      }
    } catch (err: any) {
      toast.error(err?.data?.error || "Failed to send verification email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-900 to-gray-800">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-2xl">
        <div className="flex flex-col items-center justify-center">
          <Mail className="w-16 h-16 mb-4 text-blue-400" />
          <h2 className="mb-4 text-2xl font-bold text-center text-gray-100">
            Verify Your Email
          </h2>
          <p className="mb-6 text-center text-gray-300">
            Please verify your email address to continue using VideoCave. Click
            the button below to receive a verification email.
          </p>
          <Button
            onClick={handleResendVerification}
            className="w-full py-3 font-semibold text-white transition duration-300 ease-in-out transform rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Verification Email"
            )}
          </Button>
          <Button
            variant="ghost"
            className="mt-4 text-gray-400 hover:text-gray-200"
            onClick={() => navigate("/login")}
          >
            Back to Login
          </Button>
        </div>
      </div>
      <ToastContainer
        autoClose={2000}
        hideProgressBar={true}
        position="bottom-left"
        theme="dark"
        transition={Slide}
        stacked
      />
    </div>
  );
};

export default VerifyEmailScreen;
