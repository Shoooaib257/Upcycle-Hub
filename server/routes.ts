import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertProductSchema, 
  insertCartSchema, 
  insertCartItemSchema, 
  insertOrderSchema,
  insertOrderItemSchema
} from "@shared/schema";
import { z } from "zod";
import Stripe from "stripe";
import multer from "multer";
import path from "path";
import fs from "fs";
import { ZodError } from "zod";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import MemoryStore from "memorystore";

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing STRIPE_SECRET_KEY environment variable, using test key');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51OZIBnQWr0fF1SuQSscqzgVXzqKa7Cd8Ju6Hhm4DjFIbCF3d2oWlhjfwDfZvUxFuGw3xLQvjEYkAFeSNEMmAYvNq00VdZUKLgA', {
  apiVersion: '2023-10-16',
});

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage2,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  fileFilter: (req, file, cb) => {
    // Only allow images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!') as any);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Create session store
  const MemoryStoreSession = MemoryStore(session);
  const sessionStore = new MemoryStoreSession({
    checkPeriod: 86400000 // prune expired entries every 24h
  });

  // Initialize session
  app.use(session({
    secret: process.env.SESSION_SECRET || 'ecorevive-secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
  }));

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport local strategy
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      
      // In a real app, we'd use bcrypt.compare to check the password
      // For this demo, we'll just check direct equality
      if (user.password !== password) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Create uploads directory for product images if it doesn't exist
  app.use('/uploads', express.static(uploadDir));

  // API routes
  // ===== Authentication Routes =====
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      
      // Hash password in a real app
      // userData.password = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: 'Validation error', errors: error.format() });
      } else {
        res.status(500).json({ message: 'Server error' });
      }
    }
  });

  app.post('/api/auth/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout(() => {
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/user', (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const { password, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });

  // ===== Product Routes =====
  app.get('/api/products', async (req, res) => {
    try {
      const { category, priceMin, priceMax, sortBy, featured, isNew, query } = req.query;
      
      const filters: any = {};
      if (category) filters.category = category as string;
      if (priceMin) filters.priceMin = parseFloat(priceMin as string);
      if (priceMax) filters.priceMax = parseFloat(priceMax as string);
      if (sortBy) filters.sortBy = sortBy as any;
      if (featured) filters.featured = featured === 'true';
      if (isNew) filters.isNew = isNew === 'true';
      if (query) filters.query = query as string;
      
      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/products/featured', async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/products', upload.fields([
    { name: 'imageUrl', maxCount: 1 },
    { name: 'additionalImages', maxCount: 5 }
  ]), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const user = req.user as any;
      if (!user.isSeller) {
        return res.status(403).json({ message: 'Not authorized to create products' });
      }
      
      // Handle file uploads
      let imageUrl = '';
      let additionalImages: string[] = [];
      
      if (req.files && (req.files as any)['imageUrl']) {
        const mainImage = (req.files as any)['imageUrl'][0];
        imageUrl = `/uploads/${mainImage.filename}`;
      }
      
      if (req.files && (req.files as any)['additionalImages']) {
        additionalImages = (req.files as any)['additionalImages'].map(
          (file: any) => `/uploads/${file.filename}`
        );
      }
      
      // Validate and create product
      const productData = insertProductSchema.parse({
        ...req.body,
        sellerId: user.id,
        imageUrl: imageUrl || req.body.imageUrl,
        additionalImages: additionalImages.length > 0 ? additionalImages : undefined,
        price: parseFloat(req.body.price),
        featured: req.body.featured === 'true',
        isNew: req.body.isNew === 'true'
      });
      
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: 'Validation error', errors: error.format() });
      } else {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
      }
    }
  });

  app.put('/api/products/:id', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      const user = req.user as any;
      
      // Check if user is the seller or an admin
      if (product.sellerId !== user.id && !user.isAdmin) {
        return res.status(403).json({ message: 'Not authorized to update this product' });
      }
      
      const updatedProduct = await storage.updateProduct(id, req.body);
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.delete('/api/products/:id', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      const user = req.user as any;
      
      // Check if user is the seller or an admin
      if (product.sellerId !== user.id && !user.isAdmin) {
        return res.status(403).json({ message: 'Not authorized to delete this product' });
      }
      
      await storage.deleteProduct(id);
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // ===== Cart Routes =====
  app.get('/api/cart', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const userId = (req.user as any).id;
      let cart = await storage.getCartByUserId(userId);
      
      if (!cart) {
        cart = await storage.createCart({ userId });
      }
      
      const cartItems = await storage.getCartItems(cart.id);
      
      res.json({
        id: cart.id,
        items: cartItems,
        total: cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0)
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/cart/items', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const userId = (req.user as any).id;
      let cart = await storage.getCartByUserId(userId);
      
      if (!cart) {
        cart = await storage.createCart({ userId });
      }
      
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        cartId: cart.id
      });
      
      const cartItem = await storage.addItemToCart(cartItemData);
      const updatedCartItems = await storage.getCartItems(cart.id);
      
      res.status(201).json({
        id: cart.id,
        items: updatedCartItems,
        total: updatedCartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0)
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: 'Validation error', errors: error.format() });
      } else {
        res.status(500).json({ message: 'Server error' });
      }
    }
  });

  app.put('/api/cart/items/:id', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      
      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: 'Invalid quantity' });
      }
      
      const updatedCartItem = await storage.updateCartItemQuantity(id, quantity);
      
      if (!updatedCartItem) {
        return res.status(404).json({ message: 'Cart item not found' });
      }
      
      const userId = (req.user as any).id;
      const cart = await storage.getCartByUserId(userId);
      
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }
      
      const cartItems = await storage.getCartItems(cart.id);
      
      res.json({
        id: cart.id,
        items: cartItems,
        total: cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0)
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.delete('/api/cart/items/:id', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const id = parseInt(req.params.id);
      await storage.removeCartItem(id);
      
      const userId = (req.user as any).id;
      const cart = await storage.getCartByUserId(userId);
      
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }
      
      const cartItems = await storage.getCartItems(cart.id);
      
      res.json({
        id: cart.id,
        items: cartItems,
        total: cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0)
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // ===== Order Routes =====
  app.get('/api/orders', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const userId = (req.user as any).id;
      const orders = await storage.getUserOrders(userId);
      
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/orders/:id', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      const userId = (req.user as any).id;
      
      // Check if user is the owner of the order
      if (order.userId !== userId && !(req.user as any).isAdmin) {
        return res.status(403).json({ message: 'Not authorized to view this order' });
      }
      
      const orderItems = await storage.getOrderItems(id);
      
      res.json({
        ...order,
        items: orderItems
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/orders', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const userId = (req.user as any).id;
      const { shippingAddress } = req.body;
      
      if (!shippingAddress) {
        return res.status(400).json({ message: 'Shipping address is required' });
      }
      
      const cart = await storage.getCartByUserId(userId);
      
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }
      
      const cartItems = await storage.getCartItems(cart.id);
      
      if (cartItems.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }
      
      const total = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
      
      const orderData = insertOrderSchema.parse({
        userId,
        total,
        shippingAddress,
        status: 'pending'
      });
      
      const order = await storage.createOrder(orderData);
      
      // Create order items
      for (const item of cartItems) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          price: item.product.price,
          quantity: item.quantity
        });
        
        // Remove item from cart
        await storage.removeCartItem(item.id);
      }
      
      const orderItems = await storage.getOrderItems(order.id);
      
      res.status(201).json({
        ...order,
        items: orderItems
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: 'Validation error', errors: error.format() });
      } else {
        res.status(500).json({ message: 'Server error' });
      }
    }
  });

  // ===== Stripe Payment Routes =====
  app.post('/api/create-payment-intent', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const { amount } = req.body;
      
      if (!amount) {
        return res.status(400).json({ message: 'Amount is required' });
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: 'Error creating payment intent: ' + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
