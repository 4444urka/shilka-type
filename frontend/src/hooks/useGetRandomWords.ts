import React from "react";
import { getRandomLengthWords } from "../services/randomWordsService";

const useGetRandomWords = (
  minLength: number,
  maxLength: number,
  totalChars: number
) => {
  const [words, setWords] = React.useState<string[]>([]);
  React.useEffect(() => {
    (async () => {
      setWords(await getRandomLengthWords(totalChars, minLength, maxLength));
    })();
  }, [minLength, maxLength, totalChars]);
  return words;
};
export default useGetRandomWords;
