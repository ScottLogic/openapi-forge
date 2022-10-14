Feature: Confihguration options

  Scenario: When there are multiple servers, the user can select which configuration to use
    Given an API with the following specification
    """
    {
      "openapi":"3.0.2",
      "info" : {"title": "test", "version": "0.0.0"},
      "servers": [{ "url": "http://test-one.com" }, { "url": "http://test-two.com" }],
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
    When calling the method getResponse without params
    Then the requested URL should be http://test-one.com/test/get
    When selecting the server at index 1
    When calling the method getResponse without params
    Then the requested URL should be http://test-two.com/test/get

