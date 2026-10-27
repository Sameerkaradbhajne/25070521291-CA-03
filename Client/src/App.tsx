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
  const { isAuthenticated, logout } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Route state: default strictly to 'login' unless already authenticated
  const [currentRoute, setCurrentRoute] = useState<'home' | 'login'>(() => {
    try {
      const saved = localStorage.getItem('urban_user') || sessionStorage.getItem('urban_user');
      return saved ? 'home' : 'login';
    } catch {
      return 'login';
    }
  });

  // Keep route strictly synchronized with authentication state
  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentRoute('login');
      if (window.location.pathname !== '/login') {
        window.history.replaceState({}, '', '/login');
      }
    } else {
      setCurrentRoute('home');
      if (window.location.pathname === '/login') {
        window.history.replaceState({}, '', '/');
      }
    }
  }, [isAuthenticated]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      if (!isAuthenticated) {
        setCurrentRoute('login');
      } else {
        const path = window.location.pathname.toLowerCase();
        if (path === '/login') {
          setCurrentRoute('login');
        } else {
          setCurrentRoute('home');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated]);

  const handleLoginSuccess = () => {
    setCurrentRoute('home');
    window.history.pushState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToLogin = () => {
    logout();
    setCurrentRoute('login');
    window.history.pushState({}, '', '/login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToHome = () => {
    if (isAuthenticated) {
      setCurrentRoute('home');
      window.history.pushState({}, '', '/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

  const navigateToSection = (sectionId: string) => {
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

  // =========================================================================
  // RULE 1: Unauthenticated visitors opening the site ALWAYS see the Login Page.
  // The homepage NEVER appears before login.
  // =========================================================================
  if (!isAuthenticated || currentRoute === 'login') {
    return (
      <LoginPage
        onNavigateHome={handleLoginSuccess}
        onNavigateSection={navigateToSection}
      />
    );
  }

  // =========================================================================
  // RULE 2: Urban Jungle Home Store (Only displayed once authenticated)
  // =========================================================================
  return (
    <div className="min-h-screen bg-cream font-sans text-gray-800">
      <Navbar
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
        onOrdersClick={() => setIsOrdersOpen(true)}
        onLoginClick={handleNavigateToLogin}
        onHomeClick={handleNavigateToHome}
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
