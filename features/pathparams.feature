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

  Scenario: Calling API methods with a path array parameter 
    Given an API with the following specification
    """
    {
      "servers": [{ "url": "https://example.com/api/v3" }],
      "paths": {
        "/test/vegetables/{value}": {
          "get": {
            "operationId": "sendStringArray",
            "parameters": [
              {
                "name": "value",
                "in": "path",
                "schema": { "type": "array", 
                            "items": { "type": "string" } }
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
      }
    }
    """
    When calling the method sendStringArray with array "cabbage,carrots"
    Then the requested URL should be https://example.com/api/v3/test/vegetables/cabbage%2Ccarrots

  Scenario: Calling API methods with a path object parameter 
    Given an API with the following specification
    """
    {
      "servers": [{ "url": "https://example.com/api/v3" }],
      "paths": {
        "/test/values/{value}": {
          "get": {
            "operationId": "sendValueObject",
            "parameters": [
              {
                "name": "value",
                "in": "path",
                "schema": {                   
                  "type": "object",
                  "properties": {
                    "id": { "type": "integer" },
                    "type": { "type": "string" }
                  }
                }
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
      }
    }
    """
    When calling the method sendValueObject with object {"id": 7, "type": "test"}
    Then the requested URL should be https://example.com/api/v3/test/values/id,7,type,test
