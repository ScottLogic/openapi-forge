import Configuration from "../api/configuration";

export async function get(
  config: Configuration,
  path: string,
  query: [string, string][],
  pathParams: [string, string][]
): Promise<any> {
  // simply resolve with the input args
  return Promise.resolve(JSON.stringify({
    path,
    query,
    pathParams
  }));
}

export async function post(
  config: Configuration,
  path: string,
  value: any
): Promise<any> {
  // simply resolve with the input args
  return Promise.resolve(JSON.stringify({
    path,
    value
  }));
}
