import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import LoginInput from "./LoginInput";
import { useLoginMutation } from "@/slices/usersApiSlice";
import { useNavigate } from "react-router-dom";
import { setUserCredentials } from "@/slices/authSlice";
import { Loader2 } from "lucide-react";
import { useAppDispatch } from "@/app/hooks";
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

export const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const LoginForm = () => {
  const [login, { isLoading }] = useLoginMutation();

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

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

      dispatch(setUserCredentials({ ...response.data?.user! }));
      toast.success(`Logged In Successfully`);
      setTimeout(() => {
        navigate("/");
      }, 800); // Delay of 2 seconds to allow the toast to be visible
    } catch (err: unknown) {
      if (isErrorReponse(err)) {
        console.error(err);
        toast.error(`${err?.data?.error}`);
      }
    }
  }

  return (
    <Form {...form}>
      <div className="flex justify-center items-center h-screen">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full max-w-sm"
        >
          <LoginInput
            type="email"
            name="email"
            label="Email"
            placeholder="Enter your email"
            control={form.control}
          />
          <LoginInput
            type="password"
            name="password"
            label="Password"
            placeholder="Enter your password"
            control={form.control}
          />

          <div className="flex flex-col gap-1">
            <Button
              type="submit"
              className="text-2xl rounded-lg font-semibold text-white shadow-form dark:text-black"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  &nbsp;Loading...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </div>
        </form>
        <ToastContainer
          autoClose={2000}
          hideProgressBar={true}
          position="bottom-left"
          theme="dark"
          transition={Slide}
          stacked
        />
      </div>
    </Form>
  );
};

export default LoginForm;
