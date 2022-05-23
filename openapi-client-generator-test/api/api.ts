import Configuration from "./configuration";
import { ApiResponse, Category, Pet, Tag, Order, User } from "./model";
import { request } from "./util";

export default class Api {
  private config: Configuration;

  constructor(config: Configuration) {
    this.config = config;
  }

  // Finds Pets by status
  // Multiple status values can be provided with comma separated strings
  // @param status Status values that need to be considered for filter
  async findPetsByStatus(status: string[]): Promise<Pet[]> {
    return request(
      this.config.host,
      this.config.basePath,
      "/pet/findByStatus",
      [["status", status.toString()]],
      []
    );
  }

  // Finds Pets by tags
  // Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.
  // @param tags Tags to filter by
  async findPetsByTags(tags: string[]): Promise<Pet[]> {
    return request(
      this.config.host,
      this.config.basePath,
      "/pet/findByTags",
      [["tags", tags.toString()]],
      []
    );
  }

  // Find pet by ID
  // Returns a single pet
  // @param petId ID of pet to return
  async getPetById(petId: number): Promise<Pet> {
    return request(
      this.config.host,
      this.config.basePath,
      "/pet/{petId}",
      [],
      [["petId", petId.toString()]]
    );
  }

  // Find purchase order by ID
  // For valid response try integer IDs with value &gt;&#x3D; 1 and &lt;&#x3D; 10. Other values will generated exceptions
  // @param orderId ID of pet that needs to be fetched
  async getOrderById(orderId: number): Promise<Order> {
    return request(
      this.config.host,
      this.config.basePath,
      "/store/order/{orderId}",
      [],
      [["orderId", orderId.toString()]]
    );
  }

  // Returns pet inventories by status
  // Returns a map of status codes to quantities
  async getInventory(): Promise<object> {
    return request(
      this.config.host,
      this.config.basePath,
      "/store/inventory",
      [],
      []
    );
  }

  // Get user by user name
  //
  // @param username The name that needs to be fetched. Use user1 for testing.
  async getUserByName(username: string): Promise<User> {
    return request(
      this.config.host,
      this.config.basePath,
      "/user/{username}",
      [],
      [["username", username.toString()]]
    );
  }

  // Logs user into the system
  //
  // @param username The user name for login
  // @param password The password for login in clear text
  async loginUser(username: string, password: string): Promise<string> {
    return request(
      this.config.host,
      this.config.basePath,
      "/user/login",
      [
        ["username", username.toString()],
        ["password", password.toString()],
      ],
      []
    );
  }
}
