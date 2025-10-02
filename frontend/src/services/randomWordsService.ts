import { generate } from "random-words";

const getRandomLengthWords = async (
  numberOfChars: number,
  minLength: number,
  maxLength: number
): Promise<string[]> => {
  let wordsArr: string[] = [];
  while (wordsArr.reduce((acc, word) => acc + word.length, 0) < numberOfChars) {
    const randomWords = await generate({
      minLength: minLength,
      maxLength: maxLength,
      exactly: 1,
    });
    wordsArr = [...wordsArr, ...randomWords];
  }
  return wordsArr;
};

export { getRandomLengthWords };
