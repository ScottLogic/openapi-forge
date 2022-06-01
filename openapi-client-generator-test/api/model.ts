export class Order {
  public id?: number;
  public petId?: number;
  public quantity?: number;
  public shipDate?: string;
  // Order Status
  public status?: string;
  public complete?: boolean;
}
export class Customer {
  public id?: number;
  public username?: string;
  public address?: Address[];
}
export class Address {
  public street?: string;
  public city?: string;
  public state?: string;
  public zip?: string;
}
export class Category {
  public id?: number;
  public name?: string;
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
export class Tag {
  public id?: number;
  public name?: string;
}
export class Pet {
  public id?: number;
  public name: string;
  public category?: Category;
  public photoUrls: string[];
  public tags?: Tag[];
  // pet status in the store
  public status?: string;
}
export class ApiResponse {
  public code?: number;
  public type?: string;
  public message?: string;
}
