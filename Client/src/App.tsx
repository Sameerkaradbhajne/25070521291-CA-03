import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { ProductShowcase } from './components/ProductShowcase';
import { Services } from './components/Services';
import { Workshops } from './components/Workshops';
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrdersModal } from './components/OrdersModal';
import type { CartItem } from './components/CartDrawer';

function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handlePlaceOrder = () => {
    setCartItems([]);
    setIsCheckoutOpen(false);
    // Could add a toast notification here
  };

  const addToCart = (product: any) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-cream font-sans text-gray-800">
      <Navbar
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
        onOrdersClick={() => setIsOrdersOpen(true)}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
      />
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
      />
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        total={cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)}
        cartItems={cartItems}
        onPlaceOrder={handlePlaceOrder}
      />
      <OrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
      />
      <main>
        <Hero onAddToCart={() => addToCart({
          id: 1,
          name: "Monstera Deliciosa",
          price: 45.00,
          image: "/images/Monstera Deliciosa.jpg"
        })} />
        <Features />
        <ProductShowcase onAddToCart={addToCart} searchQuery={searchQuery} />
        <Services />
        <Workshops />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}

export default App;
