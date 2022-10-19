Feature: API responses, including model object deserialization

  Scenario: the API returns an Object response
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
      "openapi":"3.0.2",
      "info" : {"title": "test", "version": "0.0.0"},
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
      "openapi":"3.0.2",
      "info" : {"title": "test", "version": "0.0.0"},
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

  Scenario: the API returns an Object with a date property
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
                "content": {
                  "application/json": {
                    "schema": { "$ref": "#/components/schemas/DateResponse" }
                  }
                }
              }
            }
          }
        }
      },
      "components": {
        "schemas": {
          "DateResponse": {
            "type": "object",
            "properties": {
              "id": { "type": "integer" },
              "date": { "type": "string", "format": "date" },
              "dateTime": { "type": "string", "format": "date-time" }
            }
          }
        }
      }
    }
    """
    When calling the method getResponse and the server responds with
    """
    { "id": 48, "date": "2013-07-21", "dateTime": "2017-07-21T17:32:28Z" }
    """
    Then the response should be of type DateResponse
    And the response should have a property date with value 2013-07-21T00:00:00.000Z
    And the response should have a property dateTime with value 2017-07-21T17:32:28.000Z

  Scenario: the API returns an Object with additionalProperties
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
                "content": {
                  "application/json": {
                    "schema": {
                      "type": "object",
                      "additionalProperties": { "type": "integer" }
                    }
                  }
                }
              }
            }
          }
        },
        "/test/getTwo": {
          "get": {
            "operationId": "getResponseTwo",
             "responses": {
               "200": {
                "content": {
                  "application/json": {
                    "schema": {
                      "type": "object",
                      "additionalProperties": { "type": "string", "format": "date-time" }
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
    { "cats": 35, "dogs": 22 }
    """
    Then the response should have a property cats with value 35
    And the response should have a property dogs with value 22
    When calling the method getResponseTwo and the server responds with
    """
    { "dateOne": "2013-07-21", "dateTwo": "2012-07-21" }
    """
    Then the response should have a property dateOne with value 2013-07-21T00:00:00.000Z
    And the response should have a property dateTwo with value 2012-07-21T00:00:00.000Z
  
  Scenario: a response that lacks content
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
                "description": "successful operation"
              }
            }
          }
        }
      }
    }
    """
    When calling the method getResponse and the server provides an empty response
    Then the response should be null

  Scenario: the API specifies a default response
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
              "default": {
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

  Scenario: the API specifies a plain text response
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
                "content": {
                  "text/plain": {
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
    When calling the method getResponse and the server responds with
    """
    "hello world"
    """
    Then the response should be of type String
    And the response should be equal to "hello world"
