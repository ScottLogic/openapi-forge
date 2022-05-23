import Configuration from "./configuration";
import { ApiResponse, Category, Pet, Tag, Order, User } from "./model";
import { get, post } from "./httpVerbs";

export default class Api {
  private config: Configuration;

  constructor(config: Configuration) {
    this.config = config;
  }

  // Finds Pets by status
  // Multiple status values can be provided with comma separated strings
  // @param status Status values that need to be considered for filter
  async findPetsByStatus(status: string[]): Promise<Pet[]> {
    return get(
      this.config,
      "/pet/findByStatus",
      [["status", status.toString()]],
      []
    );
  }

  // Finds Pets by tags
  // Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.
  // @param tags Tags to filter by
  async findPetsByTags(tags: string[]): Promise<Pet[]> {
    return get(this.config, "/pet/findByTags", [["tags", tags.toString()]], []);
  }

  // Find pet by ID
  // Returns a single pet
  // @param petId ID of pet to return
  async getPetById(petId: number): Promise<Pet> {
    return get(this.config, "/pet/{petId}", [], [["petId", petId.toString()]]);
  }

  // Find purchase order by ID
  // For valid response try integer IDs with value &gt;&#x3D; 1 and &lt;&#x3D; 10. Other values will generated exceptions
  // @param orderId ID of pet that needs to be fetched
  async getOrderById(orderId: number): Promise<Order> {
    return get(
      this.config,
      "/store/order/{orderId}",
      [],
      [["orderId", orderId.toString()]]
    );
  }

  // Returns pet inventories by status
  // Returns a map of status codes to quantities
  async getInventory(): Promise<object> {
    return get(this.config, "/store/inventory", [], []);
  }

  // Get user by user name
  //
  // @param username The name that needs to be fetched. Use user1 for testing.
  async getUserByName(username: string): Promise<User> {
    return get(
      this.config,
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
    return get(
      this.config,
      "/user/login",
      [
        ["username", username.toString()],
        ["password", password.toString()],
      ],
      []
    );
  }

  // Add a new pet to the store
  //
  // @param body Pet object that needs to be added to the store
  async addPet(value: Pet): Promise<Pet> {
    return post(this.config, "/pet", value);
  }

  // Place an order for a pet
  //
  // @param body order placed for purchasing the pet
  async placeOrder(value: Order): Promise<Order> {
    return post(this.config, "/store/order", value);
  }

  // Creates list of users with given input array
  //
  // @param body List of user object
  async createUsersWithArrayInput(value: User[]): Promise<User[]> {
    return post(this.config, "/user/createWithArray", value);
  }

  // Creates list of users with given input array
  //
  // @param body List of user object
  async createUsersWithListInput(value: User[]): Promise<User[]> {
    return post(this.config, "/user/createWithList", value);
  }

  // Create user
  // This can only be done by the logged in user.
  // @param body Created user object
  async createUser(value: User): Promise<User> {
    return post(this.config, "/user", value);
  }
}
