Feature: Path parameter handling

  Scenario: Calling API methods that have path parameters
    Given an API with the following specification
    """
    {
      "servers": [{ "url": "https://example.com/api/v3" }],
      "paths": {
         "/test/{test}/pathParameters": {
          "get": {
            "operationId": "pathParameters",
            "parameters": [
              {
                "name": "test",
                "in": "path",
                "schema": {
                  "type": "string"
                }
              }
            ],
            "responses": {
              "200": {
                "content": {
                  "application/json": {
                    "schema": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    """
    When calling the method pathParameters with parameters "value"
    Then the requested URL should be https://example.com/api/v3/test/value/pathParameters
