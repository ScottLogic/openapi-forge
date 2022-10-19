Feature: Cookie parameter handling

  Scenario: Calling API methods that have a cookie parameter
    Given an API with the following specification
    """
    {
      "openapi":"3.0.2",
      "info" : {"title": "test", "version": "0.0.0"},
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
    Then the request header should have a cookie property with value test=parameterValue

    Scenario: Calling API methods that have multiple cookie parameters
    Given an API with the following specification
    """
    {
      "openapi":"3.0.2",
      "info" : {"title": "test", "version": "0.0.0"},
      "servers": [{ "url": "https://example.com/api/v3" }],
      "paths": {
         "/test/cookieParameters": {
          "get": {
            "operationId": "cookieParameters",
            "parameters": [
              {
                "name": "cookieOne",
                "in": "cookie",
                "schema": {
                  "type": "string"
                }
              },
              {
                "name": "cookieTwo",
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
    When calling the method cookieParameters with parameters "cookieOneValue,cookieTwoValue"
    Then the request header should have a cookie property with value cookieOne=cookieOneValue;cookieTwo=cookieTwoValue