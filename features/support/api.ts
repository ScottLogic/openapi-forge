import { binding, after, then, when, given } from "cucumber-tsflow";
import { assert } from "chai";

import { RequestParameters } from "../../template/request";

import { BaseModelStep } from "./base";

const isJson = (str: string): boolean => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

@binding()
export class ModelSteps extends BaseModelStep {
  private requestParams: RequestParameters;
  private apiResponse: any;
  private serverResponseObject: any;
  private api: any;

  createApi(serverIndex: number = 0): any {
    const apiModule = require("../api/api.ts");
    const configurationModule = require("../api/configuration.ts");

    const mockTransport = async (params: RequestParameters) => {
      this.requestParams = params;
      return this.serverResponseObject;
    };

    const config = new configurationModule.default(mockTransport);
    config.selectedServerIndex = serverIndex;
    return new apiModule.default(config);
  }

  @after()
  public async after() {
    this.serverResponseObject = undefined;
    this.apiResponse = undefined;
    return this.cleanup();
  }

  @given("an API with the following specification")
  public async generate(schema: string) {
    await this.generateApi(schema);
    this.api = this.createApi();
  }

  @when(/calling the method ([a-zA-Z]*) without params/)
  public async callMethod(methodName: string) {
    if (!this.api[methodName]) {
      console.error(`Method ${methodName} not found`);
    }
    await this.api[methodName]();
  }

  @when(/calling the method ([a-zA-Z]*) with parameters "(.*)"/)
  public async callMethodWithParameters(methodName: string, params: string) {
    let values = params.split(",");
    if (!this.api[methodName]) {
      console.error(`Method ${methodName} not found`);
    }
    values = values.map((value) => (isJson(value) ? JSON.parse(value) : value));
    await this.api[methodName].apply(this.api, values);
  }

  @when("selecting the server at index {int}")
  public selectServerAtIndex(index: number) {
    this.api = this.createApi(index);
  }

  @then(/the requested URL should be (.*)/)
  public checkRequest(url: string) {
    assert.equal(this.requestParams.url, url);
  }

  @then(/the request should have a body with value "(.*)"/)
  public checkRequestBody(body: string) {
    assert.equal(this.requestParams.body, body);
  }

  @when(/calling the method ([a-zA-Z]*) and the server provides an empty response/)
  public async callWithoutResponse(methodName: string) {
    this.serverResponseObject = null;
    this.apiResponse = await this.api[methodName]();
  }

  @then(/the response should be null/)
  public checkResponseIsNull() {
    assert.isNull(this.apiResponse);
  }

  @when(/calling the method ([a-zA-Z]*) and the server responds with/)
  public async callWithResponse(methodName: string, response: string) {
    this.serverResponseObject = JSON.parse(response);
    this.apiResponse = await this.api[methodName]();
  }

  @then(/the response should be of type (.*)/)
  public checkResponseType(type: string) {
    assert.equal(this.apiResponse.constructor.name, type);
  }

  @then(/the response should be equal to "(.*)"/)
  public checkResponseValue(value: string) {
    assert.equal(this.apiResponse, value);
  }

  @then(/the response should have a property ([a-zA-Z]*) with value (.*)/)
  public checkResponseProperty(propName: string, propValue: string) {
    const value = this.apiResponse[propName];
    const formattedValue =
      value instanceof Date ? value.toISOString() : value.toString();
    assert.equal(formattedValue, propValue);
  }

  @then(/the response should be an array/)
  public checkArrayResponse() {
    assert.isArray(this.apiResponse);
  }

  @when(/extracting the object at index ([0-9]*)/)
  public extractAtIndex(index: string) {
    this.apiResponse = this.apiResponse[parseInt(index)];
  }
}
