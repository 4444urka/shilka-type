export type User = {
  id: number;
  username: string;
  access_token: string;
};

export type UserRegistrationResponse = {
  id: number;
  username: string;
  passwordHash: string;
};

export type UserLoginResponse = {
  access_token: string;
  token_type: string;
};

export type UserRegistrationRequest = {
  username: string;
  password: string;
};

export type Me = {
  id: number;
  username: string;
  shilka_coins: number;
  default_time?: number;
  default_words?: number;
  default_language?: string;
  default_mode?: string;
  default_test_type?: string;
};
