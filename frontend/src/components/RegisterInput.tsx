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
import { registerFormSchema } from "./RegisterForm";

interface RegisterInputProps {
  placeholder?: string;
  name: FieldPath<z.infer<typeof registerFormSchema>>;
  label: string;
  control: Control<z.infer<typeof registerFormSchema>>;
  type: string;
  trailingIcon?: React.ReactNode;
}

const RegisterInput = ({
  placeholder,
  name,
  label,
  control,
  type,
  trailingIcon,
}: RegisterInputProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field: { value, onChange, ...fieldProps } }) => (
        <FormItem>
          <FormLabel className="text-base">{label}</FormLabel>
          <FormControl>
            <div className="relative flex items-center">
              <Input
                placeholder={placeholder}
                {...fieldProps}
                type={type}
                className="px-4 py-2 text-white placeholder-gray-500 border-0 border-gray-300 rounded-md focus:outline-none outline-0 "
                onChange={
                  type === "file"
                    ? (event) =>
                        onChange(event.target.files && event.target.files[0])
                    : (event) => {
                        onChange(event.target.value);
                      }
                }
              />
              {trailingIcon && (
                <div className="absolute inset-y-0 flex items-center cursor-pointer right-3">
                  {trailingIcon}
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage className="my-1 text-red-600" />
        </FormItem>
      )}
    />
  );
};

export default RegisterInput;
