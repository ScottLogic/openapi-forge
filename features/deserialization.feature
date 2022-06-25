Feature: Model object deserialization

  Scenario: the API returns an Object response
    Given an API with the following specification
    """
    {
      "servers": [{ "url": "https://example.com/api/v3" }],
      "paths": {
        "/test/get": {
          "get": {
            "operationId": "getResponse",
            "responses": {
              "200": {
                "content": {
                  "application/json": {
                    "schema": { "$ref": "#/components/schemas/ObjectResponse" }
                  }
                }
              }
            }
          }
        }
      },
      "components": {
        "schemas": {
          "ObjectResponse": {
            "type": "object",
            "properties": {
              "id": { "type": "integer" },
              "value": { "type": "string" }
            }
          }
        }
      }
    }
    """
    When calling the method getResponse and the server responds with
    """
    { "id": 56, "value": "foo" }
    """
    Then the response should be of type ObjectResponse
    And the response should have a property id with value 56
    And the response should have a property value with value foo

  Scenario: the API returns an primitive
    Given an API with the following specification
    """
    {
      "servers": [{ "url": "https://example.com/api/v3" }],
      "paths": {
        "/test/get": {
          "get": {
            "operationId": "getResponse",
            "responses": {
              "200": {
                "content": {
                  "application/json": {
                    "schema": { "type": "string" }
                  }
                }
              }
            }
          }
        }
      }
    }
    """
    When calling the method getResponse and the server responds with
    """
    "hello world"
    """
    Then the response should be of type String
    And the response should be equal to "hello world"

  Scenario: the API returns an array of objects
    Given an API with the following specification
    """
    {
      "servers": [{ "url": "https://example.com/api/v3" }],
      "paths": {
        "/test/get": {
          "get": {
            "operationId": "getResponse",
            "responses": {
              "200": {
                "content": {
                  "application/json": {
                    "schema": {
                      "type": "array",
                      "items": { "$ref": "#/components/schemas/ObjectResponse" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "components": {
        "schemas": {
          "ObjectResponse": {
            "type": "object",
            "properties": {
              "id": { "type": "integer" },
              "value": { "type": "string" }
            }
          }
        }
      }
    }
    """
    When calling the method getResponse and the server responds with
    """
    [{ "id": 1, "value": "foo" }, { "id": 2, "value": "bar" }]
    """
    Then the response should be an array
    When extracting the object at index 0
    Then the response should be of type ObjectResponse
    And the response should have a property id with value 1
    And the response should have a property value with value foo

  