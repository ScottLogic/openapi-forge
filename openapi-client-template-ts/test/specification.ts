import Configuration from "./api/configuration";
import Api from "./api/api";
import { ChildObject, ObjectResponse, ParentObject } from "./api/model";

const config = new Configuration();
const api = new Api(config);

describe("data types", () => {
  // https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md#data-types
  test("primitive data types", async () => {
    api.testDataTypes(
      1,
      2,
      3,
      5,
      "string",
      "string",
      "string",
      true,
      new Date(),
      new Date(),
      "string"
    );
  });

  // https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md#data-types
  test("schema / object data types", async () => {
    api.testObjectDataTypes(new ObjectResponse());
  });
});

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md#swagger-object
test("swagger object", async () => {
  expect(config.host).toBe("host.server.com");
  expect(config.basePath).toBe("/v2");
  expect(config.schemes).toEqual(["https"]);

  // TODO: the generator doesn't support the 'consumes' or 'produces' properties, it assumed JSON
});

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md#path-item-object
describe("paths", () => {
  // https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md#operation-object
  describe("operation object ", () => {
    test("operationId", async () => {
      // this maps to the name exposed by the API
      api.testGetMethod("foo");
    });

    // https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md#parameter-object
    describe("parameter object", () => {
      // https://swagger.io/docs/specification/serialization/
      test.skip("parameter encoding", async () => {
        // TODO
      });
      test.skip("required parameters moved to front of signature", async () => {
        api.testRequiredParameters("required");
        api.testRequiredParameters("required", "optional");
      });
      test("path parameters", async () => {
        const results = JSON.parse(await api.testPathParameters("foo"));
        expect(results.path).toBe("/test/{test}/pathParameters");
        expect(results.pathParams).toEqual([["value", "foo"]]);
        expect(results.query).toEqual([]);
      });
      test("query parameters", async () => {
        const results = JSON.parse(await api.testGetMethod("foo"));
        expect(results.path).toBe("/test/get");
        expect(results.query).toEqual([["value", "foo"]]);
        expect(results.pathParams).toEqual([]);
      });
      test.skip("header parameters", async () => {
        // TODO
      });
      test.skip("body parameters", async () => {
        // TODO
      });
      test.skip("form parameters", async () => {
        // TODO
      });

      // https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md#items-object
      describe("items object", () => {
        describe("collectionFormat", () => {
          test("defaults to CSV", async () => {
            const results = JSON.parse(
              await api.testCsvCollectionParams(["one", "two"])
            );
            expect(results.query).toEqual([["value", "one,two"]]);
          });
          test.skip("supports SSV", async () => {
            // TODO
          });
          test.skip("supports TSV", async () => {
            // TODO
          });
          test.skip("supports pipes", async () => {
            // TODO
          });
          test.skip("supports multi", async () => {
            // TODO
          });
        });
      });

      // https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md#responses-object
      describe("responses object", () => {
        test("primitive response type", async () => {
          let str: string = await api.testResponsePrimitive();
        });
        test("object response type", async () => {
          let obj: ObjectResponse = await api.testResponseObject();
        });
      });
    });
  });

  test.skip("$ref", async () => {
    // TODO
  });

  test("get", async () => {
    const results = JSON.parse(await api.testGetMethod("foo"));
    expect(results.path).toBe("/test/get");
    expect(results.query).toEqual([["value", "foo"]]);
    expect(results.pathParams).toEqual([]);
  });

  test.skip("put", async () => {});
  test.skip("post", async () => {});
  test.skip("delete", async () => {});
  test.skip("options", async () => {});
  test.skip("head", async () => {});
  test.skip("patch", async () => {});
});

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md#definitionsObject
describe("definitions", () => {
  test("simple object", () => {
    const obj = new ObjectResponse();
    obj.value = undefined;
    obj.id = undefined;
    expect(obj.id).toBeUndefined();
    expect(obj.value).toBeUndefined();
  });

  test("required properties", () => {
    const obj = new ObjectResponse();
    obj.value = "foo";
    expect(obj.value).toBe("foo");
  });

  test("object references", () => {
    const obj = new ParentObject();
    obj.child = new ChildObject();
  });

  test.skip("additional properties", () => {
  });
});
