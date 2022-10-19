Feature: Header parameter handling

  Scenario: Calling API methods that have header parameters
    Given an API with the following specification
    """
    {
      "openapi":"3.0.2",
      "info" : {"title": "test", "version": "0.0.0"},
      "servers": [{ "url": "https://example.com/api/v3" }],
      "paths": {
         "/test/headerParameters": {
          "get": {
            "operationId": "headerParameters",
            "parameters": [
              {
                "name": "test",
                "in": "header",
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
    When calling the method headerParameters with parameters "parameterValue"
    Then the request should have a header property with value parameterValue