import { Control, FieldPath } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { loginFormSchema } from "./LoginForm";

interface LoginInputProps {
  placeholder?: string;
  name: FieldPath<z.infer<typeof loginFormSchema>>;
  label: string;
  control: Control<z.infer<typeof loginFormSchema>>;
  type: string;
}

const LoginInput = ({
  placeholder,
  name,
  label,
  control,
  type,
}: LoginInputProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field: { value, onChange, ...fieldProps } }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              placeholder={placeholder}
              {...fieldProps}
              type={type}
              className="px-4 py-2 text-gray-900 rounded-md focus:border-0 focus:outline-none focus:text-gray-200 focus:placeholder:text-gray-200"
              onChange={
                type === "file"
                  ? (event) =>
                      onChange(event.target.files && event.target.files[0])
                  : (event) => {
                      onChange(event.target.value);
                    }
              }
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default LoginInput;
