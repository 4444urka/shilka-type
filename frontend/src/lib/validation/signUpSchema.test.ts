import { describe, it, expect } from "vitest";
import { signUpSchema } from "./signUpSchema";

describe("signUpSchema", () => {
  it("должен валидировать корректные данные", async () => {
    const validData = {
      username: "testuser",
      password: "password123",
      confirmPassword: "password123",
    };

    await expect(signUpSchema.validate(validData)).resolves.toEqual(validData);
  });

  it("должен отклонять несовпадающие пароли", async () => {
    const invalidData = {
      username: "testuser",
      password: "password123",
      confirmPassword: "different",
    };

    await expect(signUpSchema.validate(invalidData)).rejects.toThrow();
  });

  it("должен отклонять пустой username", async () => {
    const invalidData = {
      username: "",
      password: "password123",
      confirmPassword: "password123",
    };

    await expect(signUpSchema.validate(invalidData)).rejects.toThrow();
  });

  it("должен отклонять короткий пароль", async () => {
    const invalidData = {
      username: "testuser",
      password: "short",
      confirmPassword: "short",
    };

    await expect(signUpSchema.validate(invalidData)).rejects.toThrow();
  });

  it("должен отклонять слишком длинный пароль", async () => {
    const longPassword = "a".repeat(300);
    const invalidData = {
      username: "testuser",
      password: longPassword,
      confirmPassword: longPassword,
    };

    await expect(signUpSchema.validate(invalidData)).rejects.toThrow();
  });
});
