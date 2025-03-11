import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";
import HomePage from "@/pages/home";
import ProductsPage from "@/pages/products";
import ProductDetailPage from "@/pages/product-detail";
import CartPage from "@/pages/cart";
import CheckoutPage from "@/pages/checkout";
import SellPage from "@/pages/sell";
import AboutPage from "@/pages/about";
import ContactPage from "@/pages/contact";
import RegisterPage from "@/pages/register";
import LoginPage from "@/pages/login";
import ProfilePage from "@/pages/profile";
import { CartProvider } from "@/lib/hooks/use-cart";
import { AuthProvider } from "@/lib/hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/products/:id" component={ProductDetailPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/sell" component={SellPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Layout>
            <Router />
          </Layout>
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
