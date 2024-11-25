import { Control, Path, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface LoginInputProps<T extends FieldValues> {
  placeholder?: string;
  name: Path<T>;
  label: string;
  control: Control<T>;
  type: string;
  trailingIcon?: React.ReactNode;
}

const LoginInput = <T extends FieldValues>({
  placeholder,
  name,
  label,
  control,
  type,
  trailingIcon,
}: LoginInputProps<T>) => {
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
                className="px-4 py-2 text-white placeholder-gray-500 border-0 border-gray-300 rounded-md focus:outline-none outline-0"
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

export default LoginInput;
