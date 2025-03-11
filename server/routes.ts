import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import Stripe from "stripe";
import bcrypt from "bcryptjs";
import {
  insertUserSchema,
  insertProductSchema,
  insertCartItemSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  productSearchSchema
} from "@shared/schema";
import { ZodError } from "zod";

// Check for Stripe API key
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing Stripe Secret Key. Payment functionality will be limited.');
}

// Initialize Stripe with the secret key if available
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" })
  : undefined;

// Configure multer for file uploads
const storage2 = multer.memoryStorage(); // In-memory storage for files
const upload = multer({ storage: storage2 });

// Simple session management (replace with proper session system for production)
const sessions: Record<string, { userId: number, username: string }> = {};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Middleware to parse session from cookies
  app.use((req: Request & { session?: { userId: number, username: string } }, res, next) => {
    const sessionId = req.cookies?.sessionId;
    if (sessionId && sessions[sessionId]) {
      req.session = sessions[sessionId];
    }
    next();
  });

  // Authentication routes
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Create user with hashed password
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      // Create session
      const sessionId = Math.random().toString(36).substring(2, 15);
      sessions[sessionId] = { userId: user.id, username: user.username };

      // Set cookie and return user data (excluding password)
      res.cookie("sessionId", sessionId, { httpOnly: true });
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Error registering user" });
      }
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Validate input
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create session
      const sessionId = Math.random().toString(36).substring(2, 15);
      sessions[sessionId] = { userId: user.id, username: user.username };

      // Set cookie and return user data (excluding password)
      res.cookie("sessionId", sessionId, { httpOnly: true });
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Error logging in" });
    }
  });

  app.post("/api/logout", (req, res) => {
    const sessionId = req.cookies?.sessionId;
    if (sessionId) {
      delete sessions[sessionId];
      res.clearCookie("sessionId");
    }
    res.status(200).json({ message: "Logged out successfully" });
  });

  app.get("/api/me", async (req: Request & { session?: { userId: number } }, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Error fetching user data" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const queryParams = req.query;
      const filters = {
        query: queryParams.query as string,
        category: queryParams.category as string,
        minPrice: queryParams.minPrice ? Number(queryParams.minPrice) : undefined,
        maxPrice: queryParams.maxPrice ? Number(queryParams.maxPrice) : undefined,
        condition: queryParams.condition as string,
        location: queryParams.location as string,
        sortBy: queryParams.sortBy as any
      };

      const validatedFilters = productSearchSchema.parse(filters);
      const products = await storage.getProducts(validatedFilters);
      res.status(200).json(products);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid query parameters", errors: error.errors });
      } else {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Error fetching products" });
      }
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const products = await storage.getFeaturedProducts(limit);
      res.status(200).json(products);
    } catch (error) {
      console.error("Error fetching featured products:", error);
      res.status(500).json({ message: "Error fetching featured products" });
    }
  });

  app.get("/api/products/category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const products = await storage.getProductsByCategory(category, limit);
      res.status(200).json(products);
    } catch (error) {
      console.error("Error fetching products by category:", error);
      res.status(500).json({ message: "Error fetching products by category" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.status(200).json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Error fetching product" });
    }
  });

  app.post("/api/products", upload.array("images", 5), async (req: Request & { session?: { userId: number } }, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      // Temporary image URLs in place of real file uploads
      const imageUrls = [
        "https://images.unsplash.com/photo-1577215237820-9af15fea5a10",
        "https://images.unsplash.com/photo-1595528862909-17ab1f491c1e",
        "https://images.unsplash.com/photo-1584589167171-541ce45f1eea",
        "https://images.unsplash.com/photo-1600250395178-40fe752e5189"
      ];
      
      // In a real app, we would process uploaded files here
      const productData = insertProductSchema.parse({
        ...req.body,
        price: parseFloat(req.body.price),
        sellerId: req.session.userId,
        images: [imageUrls[Math.floor(Math.random() * imageUrls.length)]]
      });

      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid product data", errors: error.errors });
      } else {
        console.error("Error creating product:", error);
        res.status(500).json({ message: "Error creating product" });
      }
    }
  });

  // Cart routes
  app.get("/api/cart", async (req: Request & { session?: { userId: number } }, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const cartItems = await storage.getCartItems(req.session.userId);
      
      // Fetch product details for each cart item
      const cartWithDetails = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product: product || null
          };
        })
      );
      
      res.status(200).json(cartWithDetails);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Error fetching cart" });
    }
  });

  app.post("/api/cart", async (req: Request & { session?: { userId: number } }, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        userId: req.session.userId
      });

      const cartItem = await storage.addToCart(cartItemData);
      
      // Get product details
      const product = await storage.getProduct(cartItem.productId);
      
      res.status(201).json({
        ...cartItem,
        product: product || null
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid cart item data", errors: error.errors });
      } else {
        console.error("Error adding item to cart:", error);
        res.status(500).json({ message: "Error adding item to cart" });
      }
    }
  });

  app.put("/api/cart/:id", async (req: Request & { session?: { userId: number } }, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const itemId = parseInt(req.params.id);
      const { quantity } = req.body;
      
      if (quantity === undefined || isNaN(quantity) || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      
      const updatedItem = await storage.updateCartItemQuantity(itemId, quantity);
      
      if (!updatedItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      // Get product details
      const product = await storage.getProduct(updatedItem.productId);
      
      res.status(200).json({
        ...updatedItem,
        product: product || null
      });
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Error updating cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req: Request & { session?: { userId: number } }, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const itemId = parseInt(req.params.id);
      const success = await storage.removeFromCart(itemId);
      
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.status(200).json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing item from cart:", error);
      res.status(500).json({ message: "Error removing item from cart" });
    }
  });

  app.delete("/api/cart", async (req: Request & { session?: { userId: number } }, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      await storage.clearCart(req.session.userId);
      res.status(200).json({ message: "Cart cleared" });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Error clearing cart" });
    }
  });

  // Order routes
  app.post("/api/orders", async (req: Request & { session?: { userId: number } }, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { shippingAddress } = req.body;
      
      if (!shippingAddress) {
        return res.status(400).json({ message: "Shipping address is required" });
      }
      
      // Get cart items
      const cartItems = await storage.getCartItems(req.session.userId);
      
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      // Calculate total
      let total = 0;
      const orderItems = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          if (!product) {
            throw new Error(`Product not found: ${item.productId}`);
          }
          
          total += product.price * item.quantity;
          
          return {
            productId: item.productId,
            quantity: item.quantity,
            price: product.price
          };
        })
      );
      
      // Create order
      const orderData = insertOrderSchema.parse({
        userId: req.session.userId,
        total,
        shippingAddress,
        status: "pending"
      });
      
      const order = await storage.createOrder(orderData, orderItems);
      
      // Clear cart
      await storage.clearCart(req.session.userId);
      
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Error creating order" });
    }
  });

  app.get("/api/orders", async (req: Request & { session?: { userId: number } }, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const orders = await storage.getUserOrders(req.session.userId);
      res.status(200).json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Error fetching orders" });
    }
  });

  app.get("/api/orders/:id", async (req: Request & { session?: { userId: number } }, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if order belongs to user
      if (order.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Get order items
      const orderItems = await storage.getOrderItems(orderId);
      
      // Get product details for each order item
      const itemsWithDetails = await Promise.all(
        orderItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product: product || null
          };
        })
      );
      
      res.status(200).json({
        ...order,
        items: itemsWithDetails
      });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Error fetching order" });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req: Request & { session?: { userId: number } }, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }

      const { orderId } = req.body;
      
      if (!orderId) {
        return res.status(400).json({ message: "Order ID is required" });
      }
      
      // Get order
      const order = await storage.getOrder(parseInt(orderId));
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if order belongs to user
      if (order.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(order.total * 100), // Amount in cents
        currency: "usd",
        metadata: {
          orderId: order.id.toString()
        }
      });
      
      // Update order with payment intent ID
      await storage.updateOrderStatus(order.id, "processing", paymentIntent.id);
      
      res.status(200).json({
        clientSecret: paymentIntent.client_secret
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent" });
    }
  });

  app.post("/api/webhook", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe is not configured" });
    }

    const sig = req.headers['stripe-signature'];

    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(400).json({ message: "Missing signature or webhook secret" });
    }

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      // Handle the event
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const orderId = parseInt(paymentIntent.metadata.orderId);
        
        // Update order status
        await storage.updateOrderStatus(orderId, "paid", paymentIntent.id);
      }

      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).json({ message: 'Webhook error' });
    }
  });

  return httpServer;
}
