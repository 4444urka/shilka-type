import { Box, Button, Stack, Text } from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import ShilkaField from "../../components/ShilkaInput/ShilkaField";
import { fetchCurrentUser, login } from "../../api/auth/authRequests";
import type { Me } from "../../types/User";
import { useAppDispatch } from "../../store";
import { setUser } from "../../slices/userSlice";
import { signInSchema } from "../../lib/validation/signInSchema";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { setPoints } from "../../slices/shilkaCoinsSlice";

type ErrorDetailItem = { loc?: (string | number)[]; msg?: string };
type ErrorResponse = { detail?: string | ErrorDetailItem[] };

type SignInFormValues = yup.InferType<typeof signInSchema>;

const SignIn = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    clearErrors,
  } = useForm<SignInFormValues>({
    resolver: yupResolver(signInSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onSubmit = async (values: SignInFormValues) => {
    try {
      clearErrors();
      const response = await login({
        username: values.username,
        password: values.password,
      });

      const me: Me = await fetchCurrentUser();
      dispatch(
        setUser({
          id: me.id,
          username: me.username,
          access_token: response.access_token,
        })
      );
      dispatch(setPoints(me.shilka_coins));
      reset();
      navigate("/stats");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data as ErrorResponse | undefined;
        const detail = data?.detail;
        if (status === 401) {
          setError("password", {
            type: "server",
            message: "Неверное имя пользователя или пароль",
          });
        } else if (status === 422 && Array.isArray(detail)) {
          // Pydantic validation errors
          detail.forEach((item) => {
            const loc = item.loc;
            const msg = item.msg || "Некорректное значение";
            const field = Array.isArray(loc) ? loc[loc.length - 1] : undefined;
            if (field && (field === "username" || field === "password")) {
              setError(field as keyof SignInFormValues, {
                type: "server",
                message: msg,
              });
            }
          });
          // Фоллбек: если структура не совпала, покажем под username
          setError("username", {
            type: "server",
            message: "Проверьте правильность заполнения формы",
          });
        } else {
          setError("username", {
            type: "server",
            message:
              typeof detail === "string"
                ? detail
                : "Произошла ошибка. Попробуйте позже.",
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
          <Button
            type="submit"
            textStyle="input"
            variant="solid"
            colorPalette="cyan"
            width="100%"
            size="lg"
            loading={isSubmitting}
          >
            Войти
          </Button>
          <Text as="span" color="primaryColor" textStyle="input">
            Нет аккаунта?{" "}
            <NavLink to="/signup" style={{ textDecoration: "underline wavy" }}>
              Зарегистрироваться
            </NavLink>
          </Text>
        </Stack>
      </Box>
    </Box>
  );
};

export default SignIn;
