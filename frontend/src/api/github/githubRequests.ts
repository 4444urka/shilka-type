import { githubInstance } from "..";

export const getMyAppVer = async () => {
  const response = await githubInstance.get(
    "/repos/4444urka/shilka-type/releases/latest"
  );
  return response.data.tag_name;
};
