

import { binding, after, then, when } from "cucumber-tsflow";
import { assert } from "chai";
import * as ts from "typescript";

import { BaseModelStep } from "./base";

@binding()
export class ModelSteps extends BaseModelStep {
  private modelSourceFile: ts.SourceFile;
  private typeChecker: ts.TypeChecker;

  getClass(name: string): ts.ClassDeclaration | undefined {
    let found: ts.ClassDeclaration | undefined;
    ts.forEachChild(this.modelSourceFile, (child) => {
      if (ts.isClassDeclaration(child) && child.name.text === name) {
        found = child;
      }
    });
    return found;
  }

  getProperty(
    modelName: string,
    propName: string
  ): ts.PropertyDeclaration | undefined {
    const modelClass = this.getClass(modelName);
    let found: ts.PropertyDeclaration | undefined;
    ts.forEachChild(modelClass, (property) => {
      if (ts.isPropertyDeclaration(property)) {
        if ((property.name as ts.Identifier).text === propName) {
          found = property;
        }
      }
    });
    return found;
  }
  
  @after()
  public async after() {
    return this.cleanup();
  }
  
  @when("generating an API from the following specification")
  public async generate(schema: string) {
    await this.generateApi(schema);

    const prog = ts.createProgram({
      rootNames: ["./features/api/model.ts"],
      options: {
        target: ts.ScriptTarget.Latest,
      },
    });
    this.typeChecker = prog.getTypeChecker();
    this.modelSourceFile = prog.getSourceFile("./features/api/model.ts");
  }

  @then(/it should generate a model object named (\w*)/)
  public modelObjectExists(modelName: string) {
    assert.isDefined(
      this.getClass(modelName),
      `Model object named [${modelName}] not found`
    );
  }

  @then(
    /(\w*) should have (an optional|a required) property named (\w*) of type (\w*)/
  )
  public modelObjectHasProperty(
    modelName: string,
    requiredOrOptional: string,
    propertyName: string,
    propertyType: string
  ) {
    const property = this.getProperty(modelName, propertyName);
    assert.isDefined(
      property,
      `Model property [${propertyName}] not found on object [${modelName}]`
    );

    const type = this.typeChecker.getTypeAtLocation(property);
    const typeString = this.typeChecker.typeToString(type, property);
    assert.equal(
      typeString,
      propertyType,
      `Property [${propertyName}] has type [${typeString}]`
    );

    if (requiredOrOptional === "an optional") {
      assert.isDefined(property.questionToken);
    } else {
      assert.isUndefined(property.questionToken);
    }
  }
}
