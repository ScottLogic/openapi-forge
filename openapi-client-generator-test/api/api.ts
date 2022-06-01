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
import { get, post } from "./httpVerbs";

// Swagger Petstore - OpenAPI 3.0
export default class Api {
  private config: Configuration;

  constructor(config: Configuration) {
    this.config = config;
  }

  // Finds Pets by status
  // Multiple status values can be provided with comma separated strings
  // @param status Status values that need to be considered for filter
  async findPetsByStatus(status: string = "available"): Promise<Pet[]> {
    let queryParams: [string, string][] = [];
    if (status !== undefined) {
      queryParams.push(["status", status.toString()]);
    }
    return get(this.config, "/pet/findByStatus", queryParams, []);
  }

  // Finds Pets by tags
  // Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.
  // @param tags Tags to filter by
  async findPetsByTags(tags?: string[]): Promise<Pet[]> {
    let queryParams: [string, string][] = [];
    if (tags !== undefined) {
      queryParams.push(["tags", tags.toString()]);
    }
    return get(this.config, "/pet/findByTags", queryParams, []);
  }

  // Find pet by ID
  // Returns a single pet
  // @param petId ID of pet to return
  async getPetById(petId: number): Promise<Pet> {
    let queryParams: [string, string][] = [];
    return get(this.config, "/pet/{petId}", queryParams, [
      ["petId", petId.toString()],
    ]);
  }

  // Find purchase order by ID
  // For valid response try integer IDs with value &lt;&#x3D; 5 or &gt; 10. Other values will generate exceptions.
  // @param orderId ID of order that needs to be fetched
  async getOrderById(orderId: number): Promise<Order> {
    let queryParams: [string, string][] = [];
    return get(this.config, "/store/order/{orderId}", queryParams, [
      ["orderId", orderId.toString()],
    ]);
  }

  // Logs user into the system

  // @param username The user name for login
  // @param password The password for login in clear text
  async loginUser(username?: string, password?: string): Promise<string> {
    let queryParams: [string, string][] = [];
    if (username !== undefined) {
      queryParams.push(["username", username.toString()]);
    }
    if (password !== undefined) {
      queryParams.push(["password", password.toString()]);
    }
    return get(this.config, "/user/login", queryParams, []);
  }

  // Get user by user name

  // @param username The name that needs to be fetched. Use user1 for testing.
  async getUserByName(username: string): Promise<User> {
    let queryParams: [string, string][] = [];
    return get(this.config, "/user/{username}", queryParams, [
      ["username", username.toString()],
    ]);
  }

  // Add a new pet to the store
  // Add a new pet to the store
  async addPet(value: Pet): Promise<Pet> {
    return post(this.config, "/pet", value);
  }

  // Place an order for a pet
  // Place a new order in the store
  async placeOrder(value: Order): Promise<Order> {
    return post(this.config, "/store/order", value);
  }

  // Create user
  // This can only be done by the logged in user.
  async createUser(value: User): Promise<User> {
    return post(this.config, "/user", value);
  }

  // Creates list of users with given input array
  // Creates list of users with given input array
  async createUsersWithListInput(value: User[]): Promise<User> {
    return post(this.config, "/user/createWithList", value);
  }
}
