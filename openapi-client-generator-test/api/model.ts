export class ApiResponse {
  public code?: number;
  public type?: string;
  public message?: string;
}
export class Category {
  public id?: number;
  public name?: string;
}
export class Pet {
  public id?: number;
  public category?: Category;
  public name?: string;
  public photoUrls?: string[];
  public tags?: Tag[];
  // pet status in the store
  public status?: string;
}
export class Tag {
  public id?: number;
  public name?: string;
}
export class Order {
  public id?: number;
  public petId?: number;
  public quantity?: number;
  public shipDate?: string;
  // Order Status
  public status?: string;
  public complete?: boolean;
}
export class User {
  public id?: number;
  public username?: string;
  public firstName?: string;
  public lastName?: string;
  public email?: string;
  public password?: string;
  public phone?: string;
  // User Status
  public userStatus?: number;
}
