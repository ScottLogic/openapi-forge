Feature: Handles inlin / anonymous objects, i.e. those that are not defined in the components/schemas section
# NOTE: The purpose of this test case is to ensure the generator creates the 'inlines' objects. This
# test doesn't validate the various encoding rules

  Scenario: Creates inline model objects from parameters
    Given an API with the following specification
    """
    {
      "openapi":"3.0.2",
      "info" : {"title": "test", "version": "0.0.0"},
      "servers": [{ "url": "https://example.com/api/v3" }],
      "paths": {
        "/test": {
          "get": {
            "operationId": "getTest",
            "parameters": [
              {
                "name": "test",
                "in": "query",
                "schema": {
                  "type": "object",
                  "properties": {
                    "value": { "type": "string" }
                  }
                }
              }
            ],
            "responses": {
              "200": {
                "description": "description",
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
    When calling the method getTest with object {"value":"test test"}
    Then the requested URL should be https://example.com/api/v3/test?value=test+test

  Scenario: Creates inline objects for request bodies
    Given an API with the following specification
    """
    {
      "openapi":"3.0.2",
      "info" : {"title": "test", "version": "0.0.0"},
      "servers": [{ "url": "https://example.com/api/v3" }],
      "paths": {
        "/test/testBody": {
          "post": {
            "operationId": "testBody",
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "value": { "type": "string" }
                    }
                  }
                }
              }
            },
            "responses": {
              "200": {
                "description": "description",
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
    When calling the method testBody with object {"value":"test"}
    Then the requested URL should be https://example.com/api/v3/test/testBody
    And the request should have a body with value {"value":"test"}
  
  Scenario: Creates inline objects for responses
    Given an API with the following specification
    """
    {
      "openapi":"3.0.2",
      "info" : {"title": "test", "version": "0.0.0"},
      "paths": {
        "/test/get": {
          "get": {
            "operationId": "getResponse",
            "responses": {
              "200": {
                "description": "description",
                "content": {
                  "application/json": {
                    "schema": { 
                      "type": "object",
                      "properties": {
                        "id": { "type": "integer" },
                        "value": { "type": "string" }
                      }
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
    When calling the method getResponse and the server responds with
    """
    { "id": 56, "value": "foo" }
    """
    Then the response should be of type InlineObject1
    And the response should have a property id with value 56
    And the response should have a property value with value foo
