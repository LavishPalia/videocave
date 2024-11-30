import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import RegisterInput from "./RegisterInput";
import { useRegisterMutation } from "@/slices/usersApiSlice";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useState } from "react";
import EmailVerificationModal from "./EmailVerificationModal";

export const registerFormSchema = z
  .object({
    fullName: z
      .string()
      .min(3, "Full name must be at least 3 characters long")
      .max(50, "Full name must be at most 50 characters long")
      .regex(
        /^[a-zA-Z\s]+$/,
        "Full name must contain only alphabetical characters and spaces"
      ),

    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/\d/, "Password must contain at least one digit")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

const RegisterForm = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const [register, { isLoading }] = useRegisterMutation();

  // 1. Define your form.
  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      confirmPassword: "",
    },
  });

  // 2. Define a submit handler.
  const onSubmit = async (userData: z.infer<typeof registerFormSchema>) => {
    try {
      const response = await register(userData).unwrap();

      console.log(response);

      toast.success(
        "User Registered. Please check your email for verification."
      );

      setRegisteredEmail(userData.email);
      setIsModalOpen(true);
    } catch (err: any) {
      console.error("error registering user", err);
      toast.error(`${err?.data?.error}`);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-center min-h-screen px-8 py-4 bg-gray-900 md:gap-2 lg:gap-0">
      {/* left section */}
      <Form {...form}>
        <div className="w-full max-w-lg p-8 space-y-8 bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl rounded-l-xl md:min-h-[656px] h-full">
          <h2 className="text-3xl font-bold text-center text-purple-400">
            Join VideoCave
          </h2>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <RegisterInput
              type="text"
              name="fullName"
              label="Full Name"
              placeholder="John Doe"
              control={form.control}
              // icon={<User className="w-5 h-5 text-gray-400" />}
            />

            <RegisterInput
              type="email"
              name="email"
              label="Email"
              placeholder="you@example.com"
              control={form.control}
              // icon={<Mail className="w-5 h-5 text-gray-400" />}
            />

            <RegisterInput
              type={isPasswordVisible ? "text" : "password"}
              name="password"
              label="Password"
              placeholder="••••••••"
              control={form.control}
              // icon={<Lock className="w-5 h-5 text-gray-400" />}
              trailingIcon={
                // Add eye icon here
                isPasswordVisible ? (
                  <EyeOff
                    className="text-gray-400 "
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

            <RegisterInput
              type={isConfirmPasswordVisible ? "text" : "password"}
              name="confirmPassword"
              label="Confirm Password"
              placeholder="••••••••"
              control={form.control}
              // icon={<Lock className="w-5 h-5 text-gray-400" />}
              trailingIcon={
                // Add eye icon here
                isConfirmPasswordVisible ? (
                  <EyeOff
                    className="text-gray-400 "
                    onClick={() => setIsConfirmPasswordVisible(false)}
                  />
                ) : (
                  <Eye
                    className="text-gray-400"
                    onClick={() => setIsConfirmPasswordVisible(true)}
                  />
                )
              }
            />

            <Button
              type="submit"
              className="w-full py-3 text-lg font-semibold text-white transition-colors duration-300 bg-purple-600 rounded-lg shadow-lg hover:bg-purple-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 size={24} className="mr-2 animate-spin" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
          <p className="text-center text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-400 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </Form>

      {/* Right side */}
      <section className="w-full max-w-xl py-8 pl-4 pr-2 space-y-8 text-gray-200 shadow-2xl bg-gradient-to-br from-gray-800 to-gray-900 rounded-r-xl">
        <h1 className="text-3xl font-bold text-center text-purple-400">
          Registration Guidelines
        </h1>
        <p className="text-center text-gray-400">
          Follow these tips to complete your registration without any errors.
        </p>

        {/* Full Name Guidelines */}
        <div className="space-y-2">
          <h2 className="flex items-center text-lg font-semibold text-purple-300">
            <span className="mr-2">🔤</span> Full Name
          </h2>
          <ul className="pl-6 space-y-1 list-disc">
            <li>Only use English alphabets [(a-z) or (A-Z)] and spaces.</li>
            <li>
              Example: <span className="text-purple-400">John Doe</span>
            </li>
          </ul>
        </div>

        {/* Email Guidelines */}
        <div className="space-y-2">
          <h2 className="flex items-center text-lg font-semibold text-purple-300">
            <span className="mr-2">📧</span> Email
          </h2>
          <ul className="pl-6 space-y-1 list-disc">
            <li>Provide an accessible email address for verification.</li>
            <li>
              Use a valid format such as{" "}
              <span className="text-purple-400">you@example.com</span>.
            </li>
            <li>
              Example:{" "}
              <span className="text-purple-400">john.doe@gmail.com</span>
            </li>
          </ul>
        </div>

        {/* Password Guidelines */}
        <div className="space-y-2">
          <h2 className="flex items-center text-lg font-semibold text-purple-300">
            <span className="mr-2">🔒</span> Password
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

      <EmailVerificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        email={registeredEmail}
      />
    </div>
  );
};

export default RegisterForm;
