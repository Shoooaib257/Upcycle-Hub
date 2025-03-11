import { pgTable, text, serial, integer, boolean, doublePrecision, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const productCategoryEnum = pgEnum('product_category', [
  'furniture', 
  'home_decor', 
  'fashion', 
  'jewelry', 
  'garden',
  'art',
  'other'
]);

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'processing',
  'completed',
  'cancelled'
]);

// Tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isSeller: boolean("is_seller").default(false).notNull(),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: doublePrecision("price").notNull(),
  category: productCategoryEnum("category").notNull(),
  sellerId: integer("seller_id").notNull(),
  imageUrl: text("image_url").notNull(),
  additionalImages: text("additional_images").array(),
  featured: boolean("featured").default(false).notNull(),
  isNew: boolean("is_new").default(false).notNull(),
  rating: doublePrecision("rating").default(0).notNull(),
  reviewCount: integer("review_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  total: doublePrecision("total").notNull(),
  status: orderStatusEnum("status").default("pending").notNull(),
  stripePaymentId: text("stripe_payment_id"),
  shippingAddress: text("shipping_address").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  price: doublePrecision("price").notNull(),
  quantity: integer("quantity").notNull(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true, isAdmin: true })
  .extend({
    password: z.string().min(6, "Password must be at least 6 characters"),
    email: z.string().email("Invalid email address"),
  });

export const insertProductSchema = createInsertSchema(products)
  .omit({ id: true, createdAt: true, rating: true, reviewCount: true })
  .extend({
    price: z.number().positive("Price must be positive"),
    additionalImages: z.array(z.string().url()).optional(),
  });

export const insertCartSchema = createInsertSchema(carts)
  .omit({ id: true, createdAt: true });

export const insertCartItemSchema = createInsertSchema(cartItems)
  .omit({ id: true })
  .extend({
    quantity: z.number().int().positive(),
  });

export const insertOrderSchema = createInsertSchema(orders)
  .omit({ id: true, createdAt: true, stripePaymentId: true })
  .extend({
    total: z.number().positive(),
  });

export const insertOrderItemSchema = createInsertSchema(orderItems)
  .omit({ id: true })
  .extend({
    price: z.number().positive(),
    quantity: z.number().int().positive(),
  });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Cart = typeof carts.$inferSelect;
export type InsertCart = z.infer<typeof insertCartSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

// Utility types for filtering and searching
export type ProductSearchFilters = {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  sortBy?: 'newest' | 'price_low_high' | 'price_high_low' | 'popular';
  featured?: boolean;
  isNew?: boolean;
  query?: string;
};
