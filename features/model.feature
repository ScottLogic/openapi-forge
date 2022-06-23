Feature: Model object generation

  Scenario: Simple object creation
    When generating an API from the following specification 
    """
    {
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
    Then it should generate a model object named ObjectResponse
    And ObjectResponse should have an optional property named id of type number
    And ObjectResponse should have an optional property named value of type string

  Scenario: Required properties
    When generating an API from the following specification 
    """
    {
      "components": {
        "schemas": {
          "ObjectResponse": {
            "type": "object",
            "properties": {
              "id": { "type": "integer" },
              "value": { "type": "string" }
            },
            "required": ["id"]
          }
        }
      }
    }
    """
    Then it should generate a model object named ObjectResponse
    And ObjectResponse should have a required property named id of type number
    And ObjectResponse should have an optional property named value of type string


  Scenario: Object references
    When generating an API from the following specification 
    """
    {
      "components": {
        "schemas": {
          "ChildObject": {
            "type": "object",
            "properties": {}
          },
          "ParentObject": {
            "type": "object",
            "properties": {
              "child": { "$ref": "#/components/schemas/ChildObject" }
            }
          }
        }
      }
    }
    """
    Then it should generate a model object named ChildObject
    And it should generate a model object named ParentObject
    And ParentObject should have an optional property named child of type ChildObject

     