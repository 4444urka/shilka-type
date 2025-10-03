import * as yup from "yup";

export const signUpSchema = yup
  .object({
    username: yup
      .string()
      .trim()
      .required("Введите имя пользователя")
      .min(3, "Не менее 3 символов")
      .max(20, "Не более 20 символов"),
    password: yup
      .string()
      .required("Введите пароль")
      .min(8, "Пароль должен быть не короче 8 символов")
      .max(30, "Пароль должен быть не длиннее 30 символов"),
    confirmPassword: yup
      .string()
      .required("Подтвердите пароль")
      .oneOf([yup.ref("password")], "Пароли должны совпадать"),
  })
  .required();
