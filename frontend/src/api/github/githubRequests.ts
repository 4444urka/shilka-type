import { githubInstance } from "..";

export interface GitHubRelease {
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
  html_url: string;
}

export const getMyAppVer = async () => {
  const response = await githubInstance.get(
    "/repos/4444urka/shilka-type/releases/latest"
  );
  return response.data.tag_name;
};

export const getLatestRelease = async (): Promise<GitHubRelease> => {
  const response = await githubInstance.get<GitHubRelease>(
    "/repos/4444urka/shilka-type/releases/latest"
  );
  return response.data;
};
