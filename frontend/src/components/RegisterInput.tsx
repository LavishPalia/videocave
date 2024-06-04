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
}

const RegisterInput = ({
  placeholder,
  name,
  label,
  control,
  type,
}: RegisterInputProps) => {
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
              className="bg-gray-300 text-gray-900 placeholder-gray-500 
              focus:outline-none focus:bg-white border border-gray-300 
              rounded-md py-2 px-4 placeholder:text-gray-950 
              focus:placeholder:text-gray-600"
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

export default RegisterInput;
