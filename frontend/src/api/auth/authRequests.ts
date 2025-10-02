import instance from "..";
import type { OAuth2PasswordRequestForm } from "../../types/Oauth2PasswordRequestForm";
import type {
  UserLoginResponse,
  UserRegistrationRequest,
  UserRegistrationResponse,
} from "../../types/User";

export const register = async (
  userData: UserRegistrationRequest
): Promise<UserRegistrationResponse> => {
  const response = await instance.post(`/auth/register`, userData);
  return response.data;
};

export const login = async (
  userData: OAuth2PasswordRequestForm
): Promise<UserLoginResponse> => {
  const params = new URLSearchParams();
  params.append("username", userData.username);
  params.append("password", userData.password);

  const response = await instance.post(`/auth/login`, params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return response.data;
};

export const logout = async () => {
  const response = await instance.post(`/auth/logout`);
  return response.data;
};

export const fetchCurrentUser = async () => {
  const response = await instance.get(`/auth/me`);
  return response.data;
};
