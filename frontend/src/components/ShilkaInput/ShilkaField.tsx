import {
  Field,
  FieldErrorText,
  Input,
  type FieldRootProps,
  type InputProps,
} from "@chakra-ui/react";
import type { UseFormRegisterReturn } from "react-hook-form";

interface ShilkaFieldProps extends FieldRootProps {
  placeholder?: string;
  label?: string;
  errorText?: string;
  isInvalid?: boolean;
  isDisabled?: boolean;
  inputProps?: InputProps;
  registration?: UseFormRegisterReturn;
}

const ShilkaField = ({
  placeholder,
  label,
  errorText,
  inputProps,
  registration,
  isInvalid,
  ...props
}: ShilkaFieldProps) => {
  return (
    <Field.Root textStyle="input" invalid={isInvalid} {...props}>
      <Field.Label textStyle="input" fontSize="18px">
        {label}
      </Field.Label>
      <Input placeholder={placeholder} {...inputProps} {...registration} />
      {errorText ? (
        <FieldErrorText fontSize="14px">{errorText}</FieldErrorText>
      ) : null}
    </Field.Root>
  );
};

export default ShilkaField;
