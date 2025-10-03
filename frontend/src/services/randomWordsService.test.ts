import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { getRandomLengthWords } from "./randomWordsService";
import { generate } from "random-words";

// Мокируем random-words модуль
vi.mock("random-words");

describe("randomWordsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("должен генерировать слова до достижения нужного количества символов", async () => {
    // Мокируем generate чтобы возвращать слова по одному
    (generate as Mock)
      .mockResolvedValueOnce(["hello"]) // 5 символов
      .mockResolvedValueOnce(["world"]) // 5 символов
      .mockResolvedValueOnce(["test"]); // 4 символа

    const result = await getRandomLengthWords(12, 3, 6);

    // Должно вернуть массив с общей длиной >= 12 символов
    const totalLength = result.reduce((acc, word) => acc + word.length, 0);
    expect(totalLength).toBeGreaterThanOrEqual(12);
    expect(result).toContain("hello");
    expect(result).toContain("world");
  });

  it("должен вызывать generate с правильными параметрами", async () => {
    (generate as Mock).mockResolvedValue(["word"]);

    await getRandomLengthWords(10, 4, 8);

    expect(generate).toHaveBeenCalledWith({
      minLength: 4,
      maxLength: 8,
      exactly: 1,
    });
  });

  it("должен собирать слова пока не наберётся нужное количество символов", async () => {
    (generate as Mock)
      .mockResolvedValueOnce(["cat"]) // 3 символа
      .mockResolvedValueOnce(["dog"]) // 3 символа
      .mockResolvedValueOnce(["bird"]); // 4 символа

    const result = await getRandomLengthWords(8, 2, 5);

    // Должно быть хотя бы 2 слова (3+3 = 6, потом 6+4 = 10 >= 8)
    expect(result.length).toBeGreaterThanOrEqual(2);
  });
});
