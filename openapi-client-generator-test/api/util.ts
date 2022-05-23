import fetch from "node-fetch";

export async function request(
  host: string,
  basePath: string,
  path: string,
  query: [string, string][],
  pathParams: [string, string][]
): Promise<any> {
  for (const pathParam of pathParams) {
    path = path.replace(`{${pathParam[0]}}`, pathParam[1]);
  }

  const url =
    `http://${host}${basePath}${path}` +
    (query.length > 0 ? "?" + new URLSearchParams(query) : "");

  const response = await fetch(url, {
    method: "get",
  });

  return await response.json();
}
