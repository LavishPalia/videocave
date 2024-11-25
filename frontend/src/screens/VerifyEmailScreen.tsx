import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Mail } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { useResendVerificationEmailMutation } from "@/slices/usersApiSlice";
import { useAppSelector } from "@/app/hooks";

const VerifyEmailScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);
  const navigate = useNavigate();
  const [resendVerificationEmail] = useResendVerificationEmailMutation();

  const { user } = useAppSelector((state) => state.auth);

  const email = user?.email;

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, []);

  const handleResendVerification = async () => {
    if (!email) {
      toast.error("Email address not found. Please login again.");
      navigate("/login");
      return;
    }

    setIsLoading(true);
    try {
      const response = await resendVerificationEmail({ email }).unwrap();

      if (response.success) {
        setVerificationEmailSent(true); // Update the state only on success

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
      <div className="w-full max-w-[550px] p-8 bg-gray-800 rounded-lg shadow-2xl">
        <div className="flex flex-col items-center justify-center">
          {!verificationEmailSent ? (
            <>
              <Mail className="w-16 h-16 mb-4 text-blue-400" />
              <h2 className="mb-4 text-2xl font-bold text-center text-gray-100">
                Verify Your Email
              </h2>
              <p className="mb-2 text-center text-gray-200">
                Please verify your email address to activate your account and
                start using VideoCave.
              </p>
              <p className="mb-6 text-center text-gray-200">
                Click the button below to receive a verification email.
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
            </>
          ) : (
            <>
              <h1 className="text-4xl font-medium tracking-wide">
                Email Verification link Sent!
              </h1>
              <p className="px-4 mt-4 text-xl text-center">
                A link to verify your email address has been sent on{" "}
                <span className="text-2xl underline text-violet-600 underline-offset-4">
                  {email}
                </span>
                &nbsp;.
              </p>
              <p className="px-4 mt-4 text-lg text-center">
                Please close this screen and proceed to complete the email
                verification
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailScreen;
