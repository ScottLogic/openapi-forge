# https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.0.md#fixed-fields-7
Feature: HTTP verbs section

  Scenario: Handles a GET Method
    Given an API with the following specification
    """
    {
      "openapi":"3.0.2",
      "info" : {"title": "test", "version": "0.0.0"},
      "servers": [{ "url": "https://example.com/api/v3" }],
      "paths": {
        "/test/testBody": {
          "get": {
            "operationId": "sendString",
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
    When calling the spied method sendString without params
    Then the request method should be of type get

  Scenario: Handles a POST Method
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
    When calling the spied method testBody without params
    Then the request method should be of type post

  Scenario: Handles a PATCH Method
    Given an API with the following specification
    """
    {
      "openapi":"3.0.2",
      "info" : {"title": "test", "version": "0.0.0"},
      "servers": [{ "url": "https://example.com/api/v3" }],
      "paths": {
        "/test/testBody": {
          "patch": {
            "operationId": "testBody",
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
    When calling the spied method testBody without params
    Then the request method should be of type patch

  Scenario: Handles a HEAD Method
    Given an API with the following specification
    """
    {
      "openapi":"3.0.2",
      "info" : {"title": "test", "version": "0.0.0"},
      "servers": [{ "url": "https://example.com/api/v3" }],
      "paths": {
        "/test/testBody": {
          "head": {
            "operationId": "testBody",
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
    When calling the spied method testBody without params
    Then the request method should be of type head

  Scenario: Handles a OPTIONS Method
    Given an API with the following specification
    """
    {
      "openapi":"3.0.2",
      "info" : {"title": "test", "version": "0.0.0"},
      "servers": [{ "url": "https://example.com/api/v3" }],
      "paths": {
        "/test/testBody": {
          "options": {
            "operationId": "testBody",
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
    When calling the spied method testBody without params
    Then the request method should be of type options

  Scenario: Handles a DELETE Method
    Given an API with the following specification
    """
    {
      "openapi":"3.0.2",
      "info" : {"title": "test", "version": "0.0.0"},
      "servers": [{ "url": "https://example.com/api/v3" }],
      "paths": {
        "/test/testBody": {
          "delete": {
            "operationId": "testBody",
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
    When calling the spied method testBody without params
    Then the request method should be of type delete

  Scenario: Handles a PUT Method
    Given an API with the following specification
    """
    {
      "openapi":"3.0.2",
      "info" : {"title": "test", "version": "0.0.0"},
      "servers": [{ "url": "https://example.com/api/v3" }],
      "paths": {
        "/test/testBody": {
          "put": {
            "operationId": "testBody",
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
    When calling the spied method testBody without params
    Then the request method should be of type put

  Scenario: Handles a TRACE Method
    Given an API with the following specification
    """
    {
      "openapi":"3.0.2",
      "info" : {"title": "test", "version": "0.0.0"},
      "servers": [{ "url": "https://example.com/api/v3" }],
      "paths": {
        "/test/testBody": {
          "trace": {
            "operationId": "testBody",
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
    When calling the spied method testBody without params
    Then the request method should be of type trace






