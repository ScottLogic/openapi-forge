import fetch from "node-fetch";
import Configuration from "./configuration";

interface Parameter {
  name: string;
  value: any;
  type: string;
}

interface Headers {
  [index: string]: string;
}

export async function request(
  config: Configuration,
  path: string,
  method: string,
  params: Parameter[]
): Promise<any> {
  for (const pathParam of params.filter((p) => p.type === "path")) {
    path = path.replace(
      `{${pathParam.name}}`,
      encodeURIComponent(pathParam.value)
    );
  }

  let url = config.basePath + config.servers[0] + path;

  const queryParams = params.filter((p) => p.type === "query");
  if (method === "get" && queryParams.length > 0) {
    const q: [string, string][] = queryParams.map((p) => [
      p.name,
      `${p.value}`,
    ]);
    url += "?" + new URLSearchParams(q);
  }

  // TODO: tidy this up a bit ...
  let body;
  let kv = params.find((p) => p.type === "body");
  if (kv) {
    body = JSON.stringify(kv.value);
  }

  const additionalHeaders = params
    .filter((p) => p.type === "header")
    .reduce<Headers>((acc, param) => {
      acc[param.name] = `${param.value}`;
      return acc;
    }, {});

  const response = await fetch(url, {
    method,
    body,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      ...additionalHeaders
    },
  });

  return await response.json();
}
