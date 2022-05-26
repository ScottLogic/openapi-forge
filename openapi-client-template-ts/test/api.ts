import Configuration from "./api/configuration";
import Api from "./api/api";

test("testGetMethod", async () => {
  const config = new Configuration();
  const api = new Api(config);
  const results = JSON.parse(await api.testGetMethod("foo"));

  // ensure the request has the correct path
  expect(results.path).toBe("/test/get");
  // ensure that the query string is correct
  expect(results.query).toEqual([["value", "foo"]]);
  // ensure that there are no path params
  expect(results.pathParams).toEqual([]);
});
