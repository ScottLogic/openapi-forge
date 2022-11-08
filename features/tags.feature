Feature: Grouping of paths by tags

  Scenario: Path with an empty tag array is present in a tagless API file
    Given an API with the following specification and tag ""
    """
    {
      "openapi":"3.0.2",
      "info" : {"title": "test", "version": "0.0.0"},
      "paths": {
        "/test/get": {
          "get": {
            "tags": [],
            "operationId": "getResponse",
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
    Then the method "getResponse" should be present

    Scenario: Path with a tag = "" is present in a tagless API file
    Given an API with the following specification and tag ""
    """
    {
      "openapi":"3.0.2",
      "info" : {"title": "test", "version": "0.0.0"},
      "paths": {
        "/test/get": {
          "get": {
            "tags": [""],
            "operationId": "getResponse",
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
    Then the method "getResponse" should be present

    Scenario: Path with no tag array is present in a tagless API file
    Given an API with the following specification and tag ""
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
    Then the method "getResponse" should be present

    Scenario: Path with no tag is not present in a tagged API file
    Given an API with the following specification and tag "tag"
    """
    {
      "openapi":"3.0.2",
      "info" : {"title": "test", "version": "0.0.0"},
      "paths": {
        "/test/get": {
          "get": {
            "tags": ["tag"],
            "operationId": "getResponse",
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
        },
        "/test/doNotGet1": {
          "get": {
            "operationId": "doNotGetResponse1",
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
        },
        "/test/doNotGet2": {
          "get": {
            "tags": [],
            "operationId": "doNotGetResponse2",
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
        },
        "/test/doNotGet3": {
          "get": {
            "tags": [""],
            "operationId": "doNotGetResponse3",
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
        },
        "/test/doNotGet4": {
          "get": {
            "tags": ["differentTag"],
            "operationId": "doNotGetResponse4",
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
    Then the method "doNotGetResponse1" should not be present
    And the method "doNotGetResponse2" should not be present
    And the method "doNotGetResponse3" should not be present
    And the method "doNotGetResponse4" should not be present
    
    Scenario: Path with tag "tag" is present in a "tag" API file
    Given an API with the following specification and tag "tag"
    """
    {
      "openapi":"3.0.2",
      "info" : {"title": "test", "version": "0.0.0"},
      "paths": {
        "/test/get": {
          "get": {
            "tags": ["tag"],
            "operationId": "getResponse",
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
    Then the method "getResponse" should be present

        
    Scenario: Path with multiple tags is present in first tag's API file
    Given an API with the following specification and tag "tag"
    """
    {
      "openapi":"3.0.2",
      "info" : {"title": "test", "version": "0.0.0"},
      "paths": {
        "/test/get": {
          "get": {
            "tags": ["tag", "user"],
            "operationId": "getResponse",
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
    Then the method "getResponse" should be present

    Scenario: Path with multiple tags is not present in second tag's API file
    Given an API with the following specification and tag "user"
    """
    {
      "openapi":"3.0.2",
      "info" : {"title": "test", "version": "0.0.0"},
      "paths": {
        "/test/get": {
          "get": {
            "tags": ["user"],
            "operationId": "getResponse",
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
        },
        "/test/doNotGet": {
          "get": {
            "tags": ["tag", "user"],
            "operationId": "doNotGetResponse",
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
    Then the method "getResponse" should be present
    And the method "doNotGetResponse" should not be present
