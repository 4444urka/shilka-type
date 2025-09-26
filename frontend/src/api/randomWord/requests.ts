import randomWordApiInstance from "..";

export const getRandomWords = async (number: number, length?: number) => {
  let url = `/word?number=${number}`;
  if (length) {
    url += `&length=${length}`;
  }
  const response = await randomWordApiInstance.get(url);
  return response.data;
};
