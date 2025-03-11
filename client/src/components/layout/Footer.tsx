import { RecycleIcon } from "lucide-react";
import { Link } from "wouter";
import { FaFacebookF, FaInstagram, FaTwitter, FaPinterestP } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-primary text-white pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="mb-8 md:mb-0">
            <div className="flex items-center mb-4">
              <RecycleIcon className="text-white h-8 w-8 mr-2" />
              <span className="font-heading font-bold text-2xl">Upcycle Hub</span>
            </div>
            <p className="mb-4">Transforming discarded items into treasured possessions while building a more sustainable future.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-neutral transition">
                <FaFacebookF />
              </a>
              <a href="#" className="text-white hover:text-neutral transition">
                <FaInstagram />
              </a>
              <a href="#" className="text-white hover:text-neutral transition">
                <FaTwitter />
              </a>
              <a href="#" className="text-white hover:text-neutral transition">
                <FaPinterestP />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-heading font-bold text-lg mb-4">Shop</h4>
            <ul className="space-y-2">
              <li><Link href="/products" className="hover:text-neutral transition">All Products</Link></li>
              <li><Link href="/products?category=furniture" className="hover:text-neutral transition">Furniture</Link></li>
              <li><Link href="/products?category=home_decor" className="hover:text-neutral transition">Home Decor</Link></li>
              <li><Link href="/products?category=fashion" className="hover:text-neutral transition">Fashion & Accessories</Link></li>
              <li><Link href="/products?category=garden" className="hover:text-neutral transition">Garden & Outdoor</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-bold text-lg mb-4">Sell</h4>
            <ul className="space-y-2">
              <li><Link href="/sell" className="hover:text-neutral transition">Start Selling</Link></li>
              <li><Link href="#" className="hover:text-neutral transition">Seller Guidelines</Link></li>
              <li><Link href="#" className="hover:text-neutral transition">Seller Dashboard</Link></li>
              <li><Link href="#" className="hover:text-neutral transition">Success Stories</Link></li>
              <li><Link href="#" className="hover:text-neutral transition">Seller Resources</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-bold text-lg mb-4">About</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-neutral transition">Our Mission</Link></li>
              <li><Link href="/about" className="hover:text-neutral transition">Sustainability Commitment</Link></li>
              <li><Link href="/contact" className="hover:text-neutral transition">Contact Us</Link></li>
              <li><Link href="#" className="hover:text-neutral transition">FAQ</Link></li>
              <li><Link href="#" className="hover:text-neutral transition">Careers</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white border-opacity-20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-white text-opacity-80">&copy; {new Date().getFullYear()} Upcycle Hub. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-sm text-white text-opacity-80 hover:text-opacity-100">Terms of Service</Link>
              <Link href="#" className="text-sm text-white text-opacity-80 hover:text-opacity-100">Privacy Policy</Link>
              <Link href="#" className="text-sm text-white text-opacity-80 hover:text-opacity-100">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
