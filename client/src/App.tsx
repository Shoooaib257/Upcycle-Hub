import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import ProductsPage from "@/pages/ProductsPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import CreateProductPage from "@/pages/CreateProductPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import BusinessDetailsPage from "@/pages/BusinessDetailsPage";
import SignInPage from "@/pages/SignInPage";
import SignUpPage from "@/pages/SignUpPage";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";

function App() {
  // Check if user is authenticated on app load
  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: getQueryFn({ on401: 'returnNull' })
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/products" component={ProductsPage} />
          <Route path="/products/:id" component={ProductDetailPage} />
          <Route path="/cart" component={CartPage} />
          <Route path="/checkout" component={CheckoutPage} />
          <Route path="/sell" component={CreateProductPage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/contact" component={ContactPage} />
          <Route path="/business-details" component={BusinessDetailsPage} />
          <Route path="/signin" component={SignInPage} />
          <Route path="/signup" component={SignUpPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

// Helper function from queryClient.ts but with explicit type
function getQueryFn<T>({ on401 }: { on401: 'returnNull' | 'throw' }): () => Promise<T | null> {
  return async ({ queryKey }: { queryKey: string[] }) => {
    const res = await fetch(queryKey[0], {
      credentials: 'include',
    });

    if (on401 === 'returnNull' && res.status === 401) {
      return null;
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${res.status}: ${text || res.statusText}`);
    }

    return res.json();
  };
}

export default App;
