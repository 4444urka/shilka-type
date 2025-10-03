import { describe, it, expect } from "vitest";
import { signInSchema } from "./signInSchema";

describe("signInSchema", () => {
  it("должен валидировать корректные данные", async () => {
    const validData = {
      username: "testuser",
      password: "password123",
    };

    await expect(signInSchema.validate(validData)).resolves.toEqual(validData);
  });

  it("должен отклонять пустой username", async () => {
    const invalidData = {
      username: "",
      password: "password123",
    };

    await expect(signInSchema.validate(invalidData)).rejects.toThrow();
  });

  it("должен отклонять пустой password", async () => {
    const invalidData = {
      username: "testuser",
      password: "",
    };

    await expect(signInSchema.validate(invalidData)).rejects.toThrow();
  });

  it("должен отклонять отсутствующие поля", async () => {
    await expect(signInSchema.validate({})).rejects.toThrow();
  });
});
