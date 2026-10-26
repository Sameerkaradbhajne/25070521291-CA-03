import { useState, useEffect } from 'react';
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
import { LoginPage } from './components/LoginPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import type { CartItem } from './components/CartDrawer';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Guest override state (in case user clicks "Explore as Guest" before signing in)
  const [guestMode, setGuestMode] = useState<boolean>(false);

  // Route state: default to 'login' as the first page unless user is already authenticated or in guest mode
  const [currentRoute, setCurrentRoute] = useState<'home' | 'login'>(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path === '/shop' || hash === '#shop') return 'home';
    // Default the first page to login
    return 'login';
  });

  // Sync route when authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      setCurrentRoute('home');
    }
  }, [isAuthenticated]);

  // Listen to browser navigation (back/forward & hash changes)
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/login' || hash === '#login') {
        setCurrentRoute('login');
      } else if (path === '/' && !isAuthenticated && !guestMode) {
        // If not logged in and not guest, root is login
        setCurrentRoute('login');
      } else {
        setCurrentRoute('home');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, [isAuthenticated, guestMode]);

  const navigateToLogin = () => {
    setGuestMode(false);
    setCurrentRoute('login');
    window.history.pushState({}, '', '/login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    setGuestMode(true);
    setCurrentRoute('home');
    window.history.pushState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToSection = (sectionId: string) => {
    setGuestMode(true);
    setCurrentRoute('home');
    window.history.pushState({}, '', `/#${sectionId}`);
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handlePlaceOrder = () => {
    setCartItems([]);
    setIsCheckoutOpen(false);
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

  // If on login route (or first page before logging in/guest mode), show LoginPage
  if (currentRoute === 'login' && (!isAuthenticated || window.location.pathname === '/login')) {
    return (
      <LoginPage
        onNavigateHome={navigateToHome}
        onNavigateSection={navigateToSection}
      />
    );
  }

  // Home Store Route
  return (
    <div className="min-h-screen bg-cream font-sans text-gray-800">
      <Navbar
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
        onOrdersClick={() => setIsOrdersOpen(true)}
        onLoginClick={navigateToLogin}
        onHomeClick={navigateToHome}
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

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
