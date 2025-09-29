import { Box, Button, Stack } from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import ShilkaField from "../../components/ShilkaInput/ShilkaField";
import { signUpSchema } from "../../lib/validation/signUpSchema";

type SignUpFormValues = yup.InferType<typeof signUpSchema>;

const SignUp = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignUpFormValues>({
    resolver: yupResolver(signUpSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const onSubmit = (values: SignUpFormValues) => {
    // TODO: заменить на вызов API регистрации
    console.log("Sign up payload", values);
    reset();
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" h="70vh">
      <Box as="form" onSubmit={handleSubmit(onSubmit)} w="30%">
        <Stack gap={10} justifyContent="center" alignItems="center" w="100%">
          <ShilkaField
            placeholder="Имя пользователя"
            label="Имя пользователя"
            width="100%"
            isInvalid={!!errors.username}
            errorText={errors.username?.message}
            registration={register("username")}
          />
          <ShilkaField
            placeholder="Пароль"
            label="Пароль"
            width="100%"
            isInvalid={!!errors.password}
            errorText={errors.password?.message}
            registration={register("password")}
            inputProps={{ type: "password" }}
          />
          <ShilkaField
            placeholder="Подтвердите пароль"
            label="Подтвердите пароль"
            width="100%"
            isInvalid={!!errors.confirmPassword}
            errorText={errors.confirmPassword?.message}
            registration={register("confirmPassword")}
            inputProps={{ type: "password" }}
          />
          <Button
            type="submit"
            textStyle="input"
            variant="solid"
            colorPalette="cyan"
            width="100%"
            size="lg"
            loading={isSubmitting}
          >
            Зарегистрироваться
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default SignUp;
