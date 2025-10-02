import * as yup from "yup";

export const signInSchema = yup
  .object({
    username: yup.string().trim().required("Введите имя пользователя"),
    password: yup.string().required("Введите пароль"),
  })
  .required();
