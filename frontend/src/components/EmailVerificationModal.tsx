import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useResendVerificationEmailMutation } from "@/slices/usersApiSlice";
import { toast } from "react-toastify";

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  onClose,
  email,
}) => {
  const [resendVerificationEmail, { isLoading }] =
    useResendVerificationEmailMutation();
  const onResendVerificationEmail = async () => {
    try {
      await resendVerificationEmail({ email }).unwrap();
      toast.success("Verification email resent successfully!");
    } catch (error) {
      toast.error("Failed to resend verification email. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md p-8 space-y-4 bg-gray-800 shadow-2xl rounded-xl">
        <div className="flex items-center justify-center">
          <h2 className="text-2xl font-bold text-center text-purple-400">
            Verify Your Email
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-6 right-6"
          >
            <X />
          </Button>
        </div>
        <p className="text-center text-gray-300">
          We've sent a verification email to{" "}
          <span className="text-2xl underline text-violet-600 underline-offset-4">
            {email}
          </span>
          .
        </p>
        <p className="text-center text-gray-300">
          Please check your inbox and click the verification link to activate
          your account.
        </p>
        <p className="text-sm text-center text-gray-400">
          If you don't see the email, please check your spam folder.
        </p>
        <Button
          className="w-full"
          onClick={onResendVerificationEmail}
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Resend Verification Email"}
        </Button>
      </div>
    </div>
  );
};

export default EmailVerificationModal;
