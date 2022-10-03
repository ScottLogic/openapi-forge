Feature: Cookie parameter handling

  Scenario: Calling API methods that have cookie parameters
    Given an API with the following specification
    """
    {
      "servers": [{ "url": "https://example.com/api/v3" }],
      "paths": {
         "/test/cookieParameters": {
          "get": {
            "operationId": "cookieParameters",
            "parameters": [
              {
                "name": "test",
                "in": "cookie",
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
    When calling the method cookieParameters with parameters "parameterValue"
    Then the request should have a cookie property with value parameterValue