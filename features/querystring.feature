Feature: Querystring handling

  Scenario: Calling API methods with a querystring
    Given An API with the following specification
    """
    {
      "servers": [{ "url": "https://example.com/api/v3" }],
      "paths": {
        "/test/get": {
          "get": {
            "operationId": "sendString",
            "parameters": [
              {
                "name": "value",
                "in": "query",
                "schema": { "type": "string" }
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
    When I call the method sendString with parameters "cabbage"
    Then The requested URL should be https://example.com/api/v3/test/get?value=cabbage

  Scenario: Calling API methods with a querystring omitting optional params
    Given An API with the following specification
    """
    {
      "servers": [{ "url": "https://example.com/api/v3" }],
      "paths": {
        "/test/get": {
          "get": {
            "operationId": "sendString",
            "parameters": [
              {
                "name": "value",
                "in": "query",
                "schema": { "type": "string" }
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
    When I call the method sendString without params
    Then The requested URL should be https://example.com/api/v3/test/get

   Scenario: Calling API methods with required and optional params
    Given An API with the following specification
    """
    {
      "servers": [{ "url": "https://example.com/api/v3" }],
      "paths": {
        "/test/required": {
          "get": {
            "operationId": "sendString",
            "parameters": [
              {
                "name": "optionalValue",
                "in": "query",
                "schema": { "type": "string" }
              },
              {
                "name": "requiredValue",
                "in": "query",
                "schema": { "type": "string" },
                "required": true
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
    When I call the method sendString with parameters "one"
    Then The requested URL should be https://example.com/api/v3/test/required?requiredValue=one
    When I call the method sendString with parameters "one,two"
    Then The requested URL should be https://example.com/api/v3/test/required?requiredValue=one&optionalValue=two

  Scenario: Calling API methods with default values
    Given An API with the following specification
    """
    {
      "servers": [{ "url": "https://example.com/api/v3" }],
      "paths": {
         "/test/testDefaultParam": {
          "get": {
            "operationId": "testDefaultParam",
            "parameters": [
              {
                "name": "paramOne",
                "in": "query",
                "schema": { "type": "string" }
              },
              {
                "name": "paramTwo",
                "in": "query",
                "schema": {
                  "type": "string",
                  "default": "valTwo"
                }
              },
              {
                "name": "paramThree",
                "in": "query",
                "schema": {
                  "type": "number",
                  "default": 3.4
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
    When I call the method testDefaultParam without params
    Then The requested URL should be https://example.com/api/v3/test/testDefaultParam?paramTwo=valTwo&paramThree=3.4
    When I call the method testDefaultParam with parameters "hello"
    Then The requested URL should be https://example.com/api/v3/test/testDefaultParam?paramTwo=hello&paramThree=3.4
    When I call the method testDefaultParam with parameters "hello,56"
    Then The requested URL should be https://example.com/api/v3/test/testDefaultParam?paramTwo=hello&paramThree=56
    When I call the method testDefaultParam with parameters "hello,56,sizzle"
    Then The requested URL should be https://example.com/api/v3/test/testDefaultParam?paramTwo=hello&paramThree=56&paramOne=sizzle
    

    