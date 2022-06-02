import fetch from "node-fetch";
import Configuration from "./configuration";

export async function get(
  config: Configuration,
  path: string,
  query: [string, string][],
  pathParams: [string, string][]
): Promise<any> {
  for (const pathParam of pathParams) {
    path = path.replace(`{${pathParam[0]}}`, encodeURIComponent(pathParam[1]));
  }

  const url =
    config.basePath +
    config.servers[0] +
    path +
    (query.length > 0 ? "?" + new URLSearchParams(query) : "");

  const response = await fetch(url, {
    method: "get",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  return await response.json();
}

export async function post(
  config: Configuration,
  path: string,
  value: any
): Promise<any> {
  const url = config.basePath + config.servers[0] + path;

  const response = await fetch(url, {
    method: "post",
    body: JSON.stringify(value),
    headers: { "Content-Type": "application/json", accept: "application/json" },
  });

  return await response.json();
}
