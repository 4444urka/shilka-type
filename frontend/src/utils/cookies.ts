/**
 * Получает значение cookie по имени
 * @param name - имя cookie
 * @returns значение cookie или null, если не найдено
 */
export const getCookie = (name: string): string | null => {
  const matches = document.cookie.match(
    new RegExp(
      "(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)"
    )
  );
  return matches ? decodeURIComponent(matches[1]) : null;
};

/**
 * Получает access_token из cookies
 * @returns access_token или пустую строку, если не найден
 */
export const getAccessTokenFromCookie = (): string => {
  return getCookie("access_token") || "";
};
