import { 
  users, type User, type InsertUser,
  products, type Product, type InsertProduct,
  cartItems, type CartItem, type InsertCartItem,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  type ProductSearch
} from "@shared/schema";

// Interface for all the storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getProducts(filters?: ProductSearch): Promise<Product[]>;
  getFeaturedProducts(limit?: number): Promise<Product[]>;
  getProductsByCategory(category: string, limit?: number): Promise<Product[]>;
  getProductsBySeller(sellerId: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Cart operations
  getCartItems(userId: number): Promise<CartItem[]>;
  getCartItem(userId: number, productId: number): Promise<CartItem | undefined>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  
  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getUserOrders(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: string, paymentIntentId?: string): Promise<Order | undefined>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private currentUserId: number;
  private currentProductId: number;
  private currentCartItemId: number;
  private currentOrderId: number;
  private currentOrderItemId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.currentUserId = 1;
    this.currentProductId = 1;
    this.currentCartItemId = 1;
    this.currentOrderId = 1;
    this.currentOrderItemId = 1;
    
    // Seed with some initial data for testing
    this.seedData();
  }

  private seedData() {
    // Example data for development/testing purposes
    const user1: User = {
      id: this.currentUserId++,
      username: "johndoe",
      password: "$2a$10$X7S.gU8FsrBfJRm/lQ6oE.eAhzOnXlN6qJqBnJ2HXgZ.V1gHAILcy", // "password123"
      email: "john@example.com",
      fullName: "John Doe",
      location: "Portland, OR",
      createdAt: new Date(),
      role: "seller"
    };
    this.users.set(user1.id, user1);

    const user2: User = {
      id: this.currentUserId++,
      username: "janesmith",
      password: "$2a$10$X7S.gU8FsrBfJRm/lQ6oE.eAhzOnXlN6qJqBnJ2HXgZ.V1gHAILcy", // "password123"
      email: "jane@example.com",
      fullName: "Jane Smith",
      location: "Seattle, WA",
      createdAt: new Date(),
      role: "buyer"
    };
    this.users.set(user2.id, user2);

    // Example products
    const products: InsertProduct[] = [
      {
        title: "Upcycled Wooden Coffee Table",
        description: "Handcrafted coffee table made from reclaimed barn wood",
        price: 189,
        category: "Furniture",
        condition: "Excellent",
        images: ["https://images.unsplash.com/photo-1577215237820-9af15fea5a10"],
        location: "Portland, OR",
        sellerId: 1,
        featured: true,
        status: "available"
      },
      {
        title: "Upcycled Denim Jacket",
        description: "Custom embroidered jacket made from vintage denim",
        price: 75,
        category: "Fashion",
        condition: "Like New",
        images: ["https://images.unsplash.com/photo-1595528862909-17ab1f491c1e"],
        location: "Austin, TX",
        sellerId: 1,
        featured: false,
        status: "available"
      },
      {
        title: "Repurposed Glass Lamp",
        description: "Unique table lamp made from recycled wine bottles",
        price: 59,
        category: "Home Decor",
        condition: "Excellent",
        images: ["https://images.unsplash.com/photo-1584589167171-541ce45f1eea"],
        location: "Seattle, WA",
        sellerId: 1,
        featured: false,
        status: "available"
      },
      {
        title: "Reclaimed Wood Wall Art",
        description: "Geometric wall art piece made from reclaimed pallet wood",
        price: 120,
        category: "Art & Crafts",
        condition: "New",
        images: ["https://images.unsplash.com/photo-1600250395178-40fe752e5189"],
        location: "Denver, CO",
        sellerId: 1,
        featured: true,
        status: "available"
      }
    ];

    for (const product of products) {
      const newProduct: Product = {
        ...product,
        id: this.currentProductId++,
        createdAt: new Date()
      };
      this.products.set(newProduct.id, newProduct);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Product methods
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProducts(filters?: ProductSearch): Promise<Product[]> {
    let filteredProducts = Array.from(this.products.values());

    if (filters) {
      if (filters.query) {
        const query = filters.query.toLowerCase();
        filteredProducts = filteredProducts.filter(product => 
          product.title.toLowerCase().includes(query) || 
          product.description.toLowerCase().includes(query)
        );
      }

      if (filters.category) {
        filteredProducts = filteredProducts.filter(product => 
          product.category === filters.category
        );
      }

      if (filters.minPrice !== undefined) {
        filteredProducts = filteredProducts.filter(product => 
          product.price >= filters.minPrice!
        );
      }

      if (filters.maxPrice !== undefined) {
        filteredProducts = filteredProducts.filter(product => 
          product.price <= filters.maxPrice!
        );
      }

      if (filters.condition) {
        filteredProducts = filteredProducts.filter(product => 
          product.condition === filters.condition
        );
      }

      if (filters.location) {
        filteredProducts = filteredProducts.filter(product => 
          product.location.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }

      // Apply sorting
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'newest':
            filteredProducts.sort((a, b) => 
              b.createdAt.getTime() - a.createdAt.getTime()
            );
            break;
          case 'price_asc':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
          case 'price_desc':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
          case 'popular':
            // In a real app, this would sort by popularity metrics
            filteredProducts.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
            break;
        }
      }
    }

    return filteredProducts;
  }

  async getFeaturedProducts(limit?: number): Promise<Product[]> {
    let featured = Array.from(this.products.values())
      .filter(product => product.featured && product.status === 'available')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return limit ? featured.slice(0, limit) : featured;
  }

  async getProductsByCategory(category: string, limit?: number): Promise<Product[]> {
    let categoryProducts = Array.from(this.products.values())
      .filter(product => product.category === category && product.status === 'available')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return limit ? categoryProducts.slice(0, limit) : categoryProducts;
  }

  async getProductsBySeller(sellerId: number): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(product => product.sellerId === sellerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const newProduct: Product = {
      ...product,
      id,
      createdAt: new Date()
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;

    const updatedProduct: Product = {
      ...existingProduct,
      ...product
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Cart methods
  async getCartItems(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values())
      .filter(item => item.userId === userId);
  }

  async getCartItem(userId: number, productId: number): Promise<CartItem | undefined> {
    return Array.from(this.cartItems.values())
      .find(item => item.userId === userId && item.productId === productId);
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = await this.getCartItem(item.userId, item.productId);
    
    if (existingItem) {
      // Update quantity instead of adding a new item
      const updatedQuantity = (existingItem.quantity || 1) + (item.quantity || 1);
      return (await this.updateCartItemQuantity(existingItem.id, updatedQuantity))!;
    }
    
    const id = this.currentCartItemId++;
    const cartItem: CartItem = {
      ...item,
      id,
      createdAt: new Date()
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;

    const updatedItem: CartItem = {
      ...cartItem,
      quantity
    };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }

  async removeFromCart(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(userId: number): Promise<boolean> {
    const userCartItems = Array.from(this.cartItems.values())
      .filter(item => item.userId === userId);
    
    for (const item of userCartItems) {
      this.cartItems.delete(item.id);
    }
    
    return true;
  }

  // Order methods
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const id = this.currentOrderId++;
    const newOrder: Order = {
      ...order,
      id,
      createdAt: new Date()
    };
    this.orders.set(id, newOrder);

    // Add order items
    for (const item of items) {
      const orderItem: OrderItem = {
        ...item,
        id: this.currentOrderItemId++,
        orderId: id
      };
      this.orderItems.set(orderItem.id, orderItem);
    }

    return newOrder;
  }

  async updateOrderStatus(id: number, status: string, paymentIntentId?: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const updatedOrder: Order = {
      ...order,
      status,
      paymentIntentId: paymentIntentId || order.paymentIntentId
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values())
      .filter(item => item.orderId === orderId);
  }
}

export const storage = new MemStorage();
