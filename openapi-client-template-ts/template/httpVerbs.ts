import fetch from "node-fetch";
import Configuration from "./configuration";

export async function request(
  config: Configuration,
  path: string,
  method: string,
  params: [string, any][],
  pathParams: [string, string][]
): Promise<any> {
  for (const pathParam of pathParams) {
    path = path.replace(`{${pathParam[0]}}`, encodeURIComponent(pathParam[1]));
  }

  let url =
    config.basePath +
    config.servers[0] +
    path;

  if (method === "get" && params.length > 0) {
    url += "?" + new URLSearchParams(params);
  }

  // TODO: tidy this up a bit ...
  let body;
  let kv = params.find(([key, _]) => key === "body");
  if (kv) {
    body = JSON.stringify(kv[1]);
  }

  const response = await fetch(url, {
    method,
    body,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  return await response.json();
}
