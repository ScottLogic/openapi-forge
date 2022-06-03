import Configuration from "./api/configuration";
import Api from "./api/api";
import { ChildObject, ObjectResponse, ParentObject } from "./api/model";
import { Parameter } from "./api/httpVerbs";

const config = new Configuration();
const api = new Api(config);

interface RequestParams {
  path: string;
  method: string;
  params: Parameter[];
}

describe("data types", () => {
  //github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.0.md#data-types
  https: test("primitive data types", async () => {
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

  //github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.0.md#data-types
  test("schema / object data types", async () => {
    api.testObjectDataTypes(new ObjectResponse());
  });
});

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.0.md#oasObject
describe("Open API Document", () => {
  describe("servers", () => {
    expect(config.servers).toEqual(["/api/v3"]);
  });

  // TODO: the generator doesn't support the 'consumes' or 'produces' properties, it assumed JSON

  // https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.0.md#pathsObject
  describe("paths", () => {
    // https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.0.md#operationObject
    describe("operation object ", () => {
      test("operationId", async () => {
        // this maps to the name exposed by the API
        api.testGetMethod("foo");
      });

      // https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.0.md#parameterObject
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
          const results = JSON.parse(
            await api.testPathParameters("foo")
          ) as RequestParams;
          expect(results.path).toBe("/test/{test}/pathParameters");
          expect(results.params).toEqual([
            {
              name: "value",
              value: "foo",
              type: "path",
            },
          ]);
          expect(results.method).toBe("get");
        });
        test("query parameters", async () => {
          const results = JSON.parse(
            await api.testGetMethod("foo")
          ) as RequestParams;
          expect(results.path).toBe("/test/get");
          expect(results.params).toEqual([
            {
              name: "value",
              value: "foo",
              type: "query",
            },
          ]);
          expect(results.method).toBe("get");
        });
        test("parameter default values", async () => {
          const results = JSON.parse(
            await api.testDefaultParam()
          ) as RequestParams;
          expect(results.params).toEqual([
            {
              name: "paramOne",
              type: "query",
            },
            {
              name: "paramTwo",
              value: "valTwo",
              type: "query",
            },
          ]);
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

        // https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.0.md#path-item-object
        describe("items object", () => {
          describe("collectionFormat", () => {
            test("defaults to CSV", async () => {
              const results = JSON.parse(
                await api.testCsvCollectionParams(["one", "two"])
              ) as RequestParams;
              expect(results.params).toEqual([
                {
                  name: "value",
                  value: ["one", "two"],
                  type: "query",
                },
              ]);
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

        // https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.0.md#responseObject
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

    describe("HTTP verbs", () => {
      test("get", async () => {
        const results = JSON.parse(
          await api.testGetMethod("foo")
        ) as RequestParams;
        expect(results.path).toBe("/test/get");
        expect(results.params).toEqual([
          {
            name: "value",
            value: "foo",
            type: "query",
          },
        ]);
        expect(results.method).toBe("get");
      });

      test.skip("put", () => {});
      test.skip("post", () => {});
      test.skip("delete", () => {});
      test.skip("options", () => {});
      test.skip("head", () => {});
      test.skip("patch", () => {});
    });
  });
});

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.0.md#componentsObject
describe("components", () => {
  // https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.0.md#schemaObject
  describe("schemas", () => {
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

    test.skip("additional properties", () => {});
  });
});
