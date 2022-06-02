import Configuration from "./configuration";
import {
  Order,
  Customer,
  Address,
  Category,
  User,
  Tag,
  Pet,
  ApiResponse,
} from "./model";
import { request } from "./httpVerbs";

// Swagger Petstore - OpenAPI 3.0
export default class Api {
  private config: Configuration;

  constructor(config: Configuration) {
    this.config = config;
  }

  // Update an existing pet
  // Update an existing pet by Id
  async updatePet(body: Pet): Promise<Pet> {
    let params: [string, any][] = [];
    if (body !== undefined) {
      params.push(["body", body]);
    }
    return request(this.config, "/pet", "put", params, []);
  }

  // Add a new pet to the store
  // Add a new pet to the store
  async addPet(body: Pet): Promise<Pet> {
    let params: [string, any][] = [];
    if (body !== undefined) {
      params.push(["body", body]);
    }
    return request(this.config, "/pet", "post", params, []);
  }

  // Finds Pets by status
  // Multiple status values can be provided with comma separated strings
  // @param status Status values that need to be considered for filter
  async findPetsByStatus(status: string = "available"): Promise<Pet[]> {
    let params: [string, any][] = [];
    if (status !== undefined) {
      params.push(["status", status]);
    }
    return request(this.config, "/pet/findByStatus", "get", params, []);
  }

  // Finds Pets by tags
  // Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.
  // @param tags Tags to filter by
  async findPetsByTags(tags?: string[]): Promise<Pet[]> {
    let params: [string, any][] = [];
    if (tags !== undefined) {
      params.push(["tags", tags]);
    }
    return request(this.config, "/pet/findByTags", "get", params, []);
  }

  // Find pet by ID
  // Returns a single pet
  // @param petId ID of pet to return
  async getPetById(petId: number): Promise<Pet> {
    let params: [string, any][] = [];
    if (petId !== undefined) {
      params.push(["petId", petId]);
    }
    return request(this.config, "/pet/{petId}", "get", params, [
      ["petId", petId.toString()],
    ]);
  }

  // Deletes a pet

  // @param api_key
  // @param petId Pet id to delete
  async deletePet(petId: number, api_key?: string): Promise<null> {
    let params: [string, any][] = [];
    if (petId !== undefined) {
      params.push(["petId", petId]);
    }
    if (api_key !== undefined) {
      params.push(["api_key", api_key]);
    }
    return request(this.config, "/pet/{petId}", "delete", params, [
      ["petId", petId.toString()],
    ]);
  }

  // Place an order for a pet
  // Place a new order in the store
  async placeOrder(body: Order): Promise<Order> {
    let params: [string, any][] = [];
    if (body !== undefined) {
      params.push(["body", body]);
    }
    return request(this.config, "/store/order", "post", params, []);
  }

  // Find purchase order by ID
  // For valid response try integer IDs with value &lt;&#x3D; 5 or &gt; 10. Other values will generate exceptions.
  // @param orderId ID of order that needs to be fetched
  async getOrderById(orderId: number): Promise<Order> {
    let params: [string, any][] = [];
    if (orderId !== undefined) {
      params.push(["orderId", orderId]);
    }
    return request(this.config, "/store/order/{orderId}", "get", params, [
      ["orderId", orderId.toString()],
    ]);
  }

  // Delete purchase order by ID
  // For valid response try integer IDs with value &lt; 1000. Anything above 1000 or nonintegers will generate API errors
  // @param orderId ID of the order that needs to be deleted
  async deleteOrder(orderId: number): Promise<null> {
    let params: [string, any][] = [];
    if (orderId !== undefined) {
      params.push(["orderId", orderId]);
    }
    return request(this.config, "/store/order/{orderId}", "delete", params, [
      ["orderId", orderId.toString()],
    ]);
  }

  // Create user
  // This can only be done by the logged in user.
  async createUser(body: User): Promise<User> {
    let params: [string, any][] = [];
    if (body !== undefined) {
      params.push(["body", body]);
    }
    return request(this.config, "/user", "post", params, []);
  }

  // Creates list of users with given input array
  // Creates list of users with given input array
  async createUsersWithListInput(body: User[]): Promise<User> {
    let params: [string, any][] = [];
    if (body !== undefined) {
      params.push(["body", body]);
    }
    return request(this.config, "/user/createWithList", "post", params, []);
  }

  // Logs user into the system

  // @param username The user name for login
  // @param password The password for login in clear text
  async loginUser(username?: string, password?: string): Promise<string> {
    let params: [string, any][] = [];
    if (username !== undefined) {
      params.push(["username", username]);
    }
    if (password !== undefined) {
      params.push(["password", password]);
    }
    return request(this.config, "/user/login", "get", params, []);
  }

  // Get user by user name

  // @param username The name that needs to be fetched. Use user1 for testing.
  async getUserByName(username: string): Promise<User> {
    let params: [string, any][] = [];
    if (username !== undefined) {
      params.push(["username", username]);
    }
    return request(this.config, "/user/{username}", "get", params, [
      ["username", username.toString()],
    ]);
  }

  // Update user
  // This can only be done by the logged in user.
  // @param username name that need to be deleted
  async updateUser(username: string, body: User): Promise<null> {
    let params: [string, any][] = [];
    if (username !== undefined) {
      params.push(["username", username]);
    }
    if (body !== undefined) {
      params.push(["body", body]);
    }
    return request(this.config, "/user/{username}", "put", params, [
      ["username", username.toString()],
    ]);
  }

  // Delete user
  // This can only be done by the logged in user.
  // @param username The name that needs to be deleted
  async deleteUser(username: string): Promise<null> {
    let params: [string, any][] = [];
    if (username !== undefined) {
      params.push(["username", username]);
    }
    return request(this.config, "/user/{username}", "delete", params, [
      ["username", username.toString()],
    ]);
  }
}
