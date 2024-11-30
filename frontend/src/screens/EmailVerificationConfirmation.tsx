import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";
import { useVerifyEmailMutation } from "../slices/usersApiSlice";
import { useAppDispatch } from "@/app/hooks";
import { updateUserPostEmailVerification } from "@/slices/authSlice";

const EmailVerificationConfirmation: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [countdown, setCountdown] = useState(3);
  const [verificationStatus, setVerificationStatus] = useState<
    "pending" | "success" | "error"
  >("pending");

  const [verifyEmail] = useVerifyEmailMutation();

  useEffect(() => {
    const performVerification = async () => {
      try {
        const result = await verifyEmail(token).unwrap();

        dispatch(updateUserPostEmailVerification(result.data));

        setVerificationStatus("success");
      } catch (error: any) {
        console.error("Email verification failed:", error.data.error);
        setVerificationStatus("error");
      }
    };

    performVerification();
  }, [token, verifyEmail]);

  useEffect(() => {
    if (verificationStatus === "success") {
      const timer = setInterval(() => {
        setCountdown((prevCount) => prevCount - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [verificationStatus]);

  useEffect(() => {
    if (countdown === 0) {
      navigate("/login");
    }
  }, [countdown, navigate]);

  if (verificationStatus === "pending") {
    return <div>Verifying your email...</div>;
  }

  if (verificationStatus === "error") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-full max-w-md p-8 space-y-8 text-center bg-gray-800 shadow-2xl rounded-xl">
          <XCircle className="w-24 h-24 mx-auto text-red-500" />
          <h2 className="text-3xl font-bold text-red-400">
            Verification Failed
          </h2>
          <p className="text-xl text-gray-300">
            There was an error verifying your email. Please try again or contact
            support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 text-center bg-gray-800 shadow-2xl rounded-xl">
        <CheckCircle className="w-24 h-24 mx-auto text-green-500" />
        <h2 className="text-3xl font-bold text-purple-400">Email Verified!</h2>
        <p className="text-xl text-gray-300">
          Your account has been successfully verified.
        </p>
        <p className="text-gray-400">
          Redirecting to Profile screen in {countdown} seconds...
        </p>
      </div>
    </div>
  );
};

export default EmailVerificationConfirmation;
