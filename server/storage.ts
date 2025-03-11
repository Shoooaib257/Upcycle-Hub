import { 
  users, products, carts, cartItems, orders, orderItems, 
  type User, type InsertUser, 
  type Product, type InsertProduct, 
  type Cart, type InsertCart, 
  type CartItem, type InsertCartItem, 
  type Order, type InsertOrder, 
  type OrderItem, type InsertOrderItem,
  ProductSearchFilters
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getProducts(filters?: ProductSearchFilters): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Cart operations
  getCart(id: number): Promise<Cart | undefined>;
  getCartByUserId(userId: number): Promise<Cart | undefined>;
  createCart(cart: InsertCart): Promise<Cart>;
  
  // CartItem operations
  getCartItems(cartId: number): Promise<(CartItem & { product: Product })[]>;
  addItemToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<boolean>;
  
  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getUserOrders(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // OrderItem operations
  getOrderItems(orderId: number): Promise<(OrderItem & { product: Product })[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private carts: Map<number, Cart>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  
  private userIdCounter: number;
  private productIdCounter: number;
  private cartIdCounter: number;
  private cartItemIdCounter: number;
  private orderIdCounter: number;
  private orderItemIdCounter: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.carts = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    
    this.userIdCounter = 1;
    this.productIdCounter = 1;
    this.cartIdCounter = 1;
    this.cartItemIdCounter = 1;
    this.orderIdCounter = 1;
    this.orderItemIdCounter = 1;
    
    // Initialize with some sample data for development
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample data is for development only
    // Create admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      email: "admin@ecorevive.com",
      firstName: "Admin",
      lastName: "User",
      isSeller: true,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const newUser: User = { ...user, id, isAdmin: false, createdAt: now };
    this.users.set(id, newUser);
    return newUser;
  }

  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProducts(filters?: ProductSearchFilters): Promise<Product[]> {
    let results = Array.from(this.products.values());
    
    if (filters) {
      // Filter by category
      if (filters.category) {
        results = results.filter(product => product.category === filters.category);
      }
      
      // Filter by price range
      if (filters.priceMin !== undefined) {
        results = results.filter(product => product.price >= filters.priceMin!);
      }
      
      if (filters.priceMax !== undefined) {
        results = results.filter(product => product.price <= filters.priceMax!);
      }
      
      // Filter by featured
      if (filters.featured !== undefined) {
        results = results.filter(product => product.featured === filters.featured);
      }
      
      // Filter by new
      if (filters.isNew !== undefined) {
        results = results.filter(product => product.isNew === filters.isNew);
      }
      
      // Search query in name or description
      if (filters.query) {
        const query = filters.query.toLowerCase();
        results = results.filter(
          product => 
            product.name.toLowerCase().includes(query) || 
            product.description.toLowerCase().includes(query)
        );
      }
      
      // Sorting
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'newest':
            results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            break;
          case 'price_low_high':
            results.sort((a, b) => a.price - b.price);
            break;
          case 'price_high_low':
            results.sort((a, b) => b.price - a.price);
            break;
          case 'popular':
            results.sort((a, b) => b.rating - a.rating);
            break;
        }
      }
    }
    
    return results;
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.featured
    );
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const now = new Date();
    const newProduct: Product = { 
      ...product, 
      id, 
      rating: 0, 
      reviewCount: 0, 
      createdAt: now,
      additionalImages: product.additionalImages || []
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;
    
    const updatedProduct = { ...existingProduct, ...product };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Cart operations
  async getCart(id: number): Promise<Cart | undefined> {
    return this.carts.get(id);
  }

  async getCartByUserId(userId: number): Promise<Cart | undefined> {
    return Array.from(this.carts.values()).find(
      (cart) => cart.userId === userId
    );
  }

  async createCart(cart: InsertCart): Promise<Cart> {
    const id = this.cartIdCounter++;
    const now = new Date();
    const newCart: Cart = { ...cart, id, createdAt: now };
    this.carts.set(id, newCart);
    return newCart;
  }

  // CartItem operations
  async getCartItems(cartId: number): Promise<(CartItem & { product: Product })[]> {
    const items = Array.from(this.cartItems.values()).filter(
      (item) => item.cartId === cartId
    );
    
    return items.map(item => {
      const product = this.products.get(item.productId)!;
      return { ...item, product };
    });
  }

  async addItemToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = Array.from(this.cartItems.values()).find(
      (item) => item.cartId === cartItem.cartId && item.productId === cartItem.productId
    );
    
    if (existingItem) {
      // Update quantity if item already exists
      return this.updateCartItemQuantity(existingItem.id, existingItem.quantity + cartItem.quantity) as Promise<CartItem>;
    }
    
    // Otherwise create new item
    const id = this.cartItemIdCounter++;
    const newCartItem: CartItem = { ...cartItem, id };
    this.cartItems.set(id, newCartItem);
    return newCartItem;
  }

  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    const updatedCartItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedCartItem);
    return updatedCartItem;
  }

  async removeCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId
    );
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderIdCounter++;
    const now = new Date();
    const newOrder: Order = { ...order, id, createdAt: now, stripePaymentId: "" };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    // @ts-ignore - status is a string but we know it's valid
    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // OrderItem operations
  async getOrderItems(orderId: number): Promise<(OrderItem & { product: Product })[]> {
    const items = Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId
    );
    
    return items.map(item => {
      const product = this.products.get(item.productId)!;
      return { ...item, product };
    });
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemIdCounter++;
    const newOrderItem: OrderItem = { ...orderItem, id };
    this.orderItems.set(id, newOrderItem);
    return newOrderItem;
  }
}

// Use in-memory storage for this application
export const storage = new MemStorage();
