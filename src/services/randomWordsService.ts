import { getRandomWords } from "../api/randomWord/requests";

const SHUFFLE_CHUNK_SIZE = 12;
const MIN_LENGTH = 2;
const MAX_LENGTH = 6;

const getRandomLength = () =>
  Math.floor(Math.random() * (MAX_LENGTH - MIN_LENGTH + 1)) + MIN_LENGTH;

const shuffleArray = <T>(values: T[]): T[] => {
  const array = [...values];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const getRandomLengthWords = async (
  numberOfChars: number
): Promise<string[]> => {
  if (numberOfChars <= 0) return [];

  const collected: string[] = [];
  let totalChars = 0;
  while (totalChars < numberOfChars) {
    const chunkSize = Math.min(
      SHUFFLE_CHUNK_SIZE,
      numberOfChars - collected.length
    );
    const newWords = await getRandomWords(chunkSize, getRandomLength());
    collected.push(...newWords);
    totalChars += newWords.join("").length;
  }

  return shuffleArray(collected).slice(0, numberOfChars);
};

export { getRandomLengthWords };
