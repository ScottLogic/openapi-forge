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
    return request(this.config, "/pet", "put", [
      {
        name: "body",
        value: body,
        type: "query",
      },
    ]);
  }

  // Add a new pet to the store
  // Add a new pet to the store
  async addPet(body: Pet): Promise<Pet> {
    return request(this.config, "/pet", "post", [
      {
        name: "body",
        value: body,
        type: "query",
      },
    ]);
  }

  // Finds Pets by status
  // Multiple status values can be provided with comma separated strings
  // @param status Status values that need to be considered for filter
  async findPetsByStatus(status: string = "available"): Promise<Pet[]> {
    return request(this.config, "/pet/findByStatus", "get", [
      {
        name: "status",
        value: status,
        type: "query",
      },
    ]);
  }

  // Finds Pets by tags
  // Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.
  // @param tags Tags to filter by
  async findPetsByTags(tags?: string[]): Promise<Pet[]> {
    return request(this.config, "/pet/findByTags", "get", [
      {
        name: "tags",
        value: tags,
        type: "query",
      },
    ]);
  }

  // Find pet by ID
  // Returns a single pet
  // @param petId ID of pet to return
  async getPetById(petId: number): Promise<Pet> {
    return request(this.config, "/pet/{petId}", "get", [
      {
        name: "petId",
        value: petId,
        type: "path",
      },
    ]);
  }

  // Deletes a pet

  // @param api_key
  // @param petId Pet id to delete
  async deletePet(petId: number, api_key?: string): Promise<null> {
    return request(this.config, "/pet/{petId}", "delete", [
      {
        name: "petId",
        value: petId,
        type: "path",
      },
      {
        name: "api_key",
        value: api_key,
        type: "header",
      },
    ]);
  }

  // Place an order for a pet
  // Place a new order in the store
  async placeOrder(body: Order): Promise<Order> {
    return request(this.config, "/store/order", "post", [
      {
        name: "body",
        value: body,
        type: "query",
      },
    ]);
  }

  // Find purchase order by ID
  // For valid response try integer IDs with value &lt;&#x3D; 5 or &gt; 10. Other values will generate exceptions.
  // @param orderId ID of order that needs to be fetched
  async getOrderById(orderId: number): Promise<Order> {
    return request(this.config, "/store/order/{orderId}", "get", [
      {
        name: "orderId",
        value: orderId,
        type: "path",
      },
    ]);
  }

  // Delete purchase order by ID
  // For valid response try integer IDs with value &lt; 1000. Anything above 1000 or nonintegers will generate API errors
  // @param orderId ID of the order that needs to be deleted
  async deleteOrder(orderId: number): Promise<null> {
    return request(this.config, "/store/order/{orderId}", "delete", [
      {
        name: "orderId",
        value: orderId,
        type: "path",
      },
    ]);
  }

  // Create user
  // This can only be done by the logged in user.
  async createUser(body: User): Promise<User> {
    return request(this.config, "/user", "post", [
      {
        name: "body",
        value: body,
        type: "query",
      },
    ]);
  }

  // Creates list of users with given input array
  // Creates list of users with given input array
  async createUsersWithListInput(body: User[]): Promise<User> {
    return request(this.config, "/user/createWithList", "post", [
      {
        name: "body",
        value: body,
        type: "query",
      },
    ]);
  }

  // Logs user into the system

  // @param username The user name for login
  // @param password The password for login in clear text
  async loginUser(username?: string, password?: string): Promise<string> {
    return request(this.config, "/user/login", "get", [
      {
        name: "username",
        value: username,
        type: "query",
      },
      {
        name: "password",
        value: password,
        type: "query",
      },
    ]);
  }

  // Get user by user name

  // @param username The name that needs to be fetched. Use user1 for testing.
  async getUserByName(username: string): Promise<User> {
    return request(this.config, "/user/{username}", "get", [
      {
        name: "username",
        value: username,
        type: "path",
      },
    ]);
  }

  // Update user
  // This can only be done by the logged in user.
  // @param username name that need to be deleted
  async updateUser(username: string, body: User): Promise<null> {
    return request(this.config, "/user/{username}", "put", [
      {
        name: "username",
        value: username,
        type: "path",
      },
      {
        name: "body",
        value: body,
        type: "query",
      },
    ]);
  }

  // Delete user
  // This can only be done by the logged in user.
  // @param username The name that needs to be deleted
  async deleteUser(username: string): Promise<null> {
    return request(this.config, "/user/{username}", "delete", [
      {
        name: "username",
        value: username,
        type: "path",
      },
    ]);
  }
}
