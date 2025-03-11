import { pgTable, text, serial, integer, boolean, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  role: text("role").default("buyer").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  location: true,
  role: true,
});

// Product model
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: doublePrecision("price").notNull(),
  category: text("category").notNull(),
  condition: text("condition").notNull(),
  images: text("images").array().notNull(),
  location: text("location").notNull(),
  sellerId: integer("seller_id").notNull(),
  featured: boolean("featured").default(false).notNull(),
  status: text("status").default("available").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

// Cart model
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
});

// Order model
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  status: text("status").default("pending").notNull(),
  total: doublePrecision("total").notNull(),
  paymentIntentId: text("payment_intent_id"),
  shippingAddress: text("shipping_address").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

// Order items model
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: doublePrecision("price").notNull(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

// Category enum for type safety
export const CATEGORIES = [
  'Home Decor',
  'Furniture',
  'Fashion',
  'Art & Crafts',
  'Electronics',
  'Jewelry',
  'Garden',
  'Other'
] as const;

export type Category = typeof CATEGORIES[number];

// Condition enum for type safety
export const CONDITIONS = [
  'New',
  'Like New',
  'Good',
  'Fair',
  'Excellent'
] as const;

export type Condition = typeof CONDITIONS[number];

// Product search and filter schema
export const productSearchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  condition: z.string().optional(),
  location: z.string().optional(),
  sortBy: z.enum(['newest', 'price_asc', 'price_desc', 'popular']).optional(),
});

export type ProductSearch = z.infer<typeof productSearchSchema>;
