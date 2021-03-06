# https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.0.md#componentsObject
Feature: Components section

  # NOTE: the components/schemas section is tested in the model.feature file

  Scenario: a response defined in the components section
    Given an API with the following specification
    """
    {
      "paths": {
        "/test/get": {
          "get": {
            "operationId": "getResponse",
            "responses": {
              "200": { "$ref": "#/components/responses/responseOne" }
            }
          }
        }
      },
      "components": {
        "responses": {
          "responseOne": {
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/ObjectResponse" }
              }
            }
          }
        },
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

  Scenario: a parameter defined in the components section
    Given an API with the following specification
    """
    {
      "servers": [{ "url": "https://example.com/api/v3" }],
      "paths": {
        "/test/getThings": {
          "get": {
            "operationId": "getThings",
            "parameters": [
              {
                "name": "value",
                "in": "query",
                "schema": { "type": "string" }
              },
              {
                "$ref": "#/components/parameters/limitParam"
              }
            ],
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
      },
      "components": {
        "parameters": {
          "limitParam": {
            "name": "limit",
            "in": "query",
            "schema" : { "type": "integer" }
          }
        }
      }
    }
    """
    When calling the method getThings with parameters "cats,2"
    Then the requested URL should be https://example.com/api/v3/test/getThings?value=cats&limit=2