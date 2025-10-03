import { Box, Button, Stack, Text } from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import ShilkaField from "../../components/ShilkaInput/ShilkaField";
import { signUpSchema } from "../../lib/validation/signUpSchema";
import {
  login,
  register as registerUser,
  fetchCurrentUser,
} from "../../api/auth/authRequests";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAppDispatch } from "../../store";
import { setUser } from "../../slices/userSlice";

type SignUpFormValues = yup.InferType<typeof signUpSchema>;

const SignUp = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    clearErrors,
  } = useForm<SignUpFormValues>({
    resolver: yupResolver(signUpSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const onSubmit = async (values: SignUpFormValues) => {
    try {
      clearErrors();
      await registerUser({
        username: values.username,
        password: values.password,
      });

      await login({
        username: values.username,
        password: values.password,
      });

      const me = await fetchCurrentUser();
      dispatch(setUser(me)); // Обновляем состояние пользователя в Redux

      reset();
      navigate("/stats");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data as { detail?: string } | undefined;
        const detail = data?.detail;
        if (status === 400) {
          // Возможные бизнес-ошибки, например "Username already registered"
          if (typeof detail === "string") {
            setError("username", { type: "server", message: detail });
          } else {
            setError("username", {
              type: "server",
              message: "Ошибка регистрации",
            });
          }
        } else if (status === 422) {
          // Валидация: покажем под username как общий фоллбек
          setError("username", {
            type: "server",
            message: "Проверьте правильность заполнения формы",
          });
        } else {
          setError("username", {
            type: "server",
            message: "Произошла ошибка. Попробуйте позже.",
          });
        }
      } else {
        setError("username", {
          type: "server",
          message: "Неизвестная ошибка. Попробуйте позже.",
        });
      }
    }
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
            bg="primaryColor"
            width="100%"
            size="lg"
            loading={isSubmitting}
          >
            Зарегистрироваться
          </Button>

          <Text as="span" color="primaryColor" textStyle="input">
            Уже есть аккаунт?{" "}
            <NavLink to="/signin" style={{ textDecoration: "underline wavy" }}>
              Войти
            </NavLink>
          </Text>
        </Stack>
      </Box>
    </Box>
  );
};

export default SignUp;
