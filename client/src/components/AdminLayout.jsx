import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { Store } from '../context/StoreContext';
import { 
  FaBox, 
  FaShoppingCart, 
  FaUsers, 
  FaChartBar, 
  FaSignOutAlt,
  FaHome,
  FaBars,
  FaTimes,
  FaCommentDots
} from 'react-icons/fa';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const signoutHandler = () => {
    ctxDispatch({ type: 'USER_SIGNOUT' });
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin', icon: FaChartBar, label: 'Tableau de bord', exact: true },
    { path: '/admin/products', icon: FaBox, label: 'Produits' },
    { path: '/admin/orders', icon: FaShoppingCart, label: 'Commandes' },
    { path: '/admin/users', icon: FaUsers, label: 'Utilisateurs' },
    { path: '/admin/reviews', icon: FaCommentDots, label: 'Modération des avis' },
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-luxe-cream dark:bg-luxe-charcoal">
      {/* Mobile Header */}
      <div className="lg:hidden bg-luxe-warm-white dark:bg-luxe-charcoal border-b border-luxe-charcoal/10 dark:border-luxe-gold/20 px-4 py-3 flex items-center justify-between">
        <h1 className="font-serif text-xl text-luxe-black dark:text-luxe-cream">Administration</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-luxe-charcoal/70 dark:text-luxe-cream/70 hover:text-luxe-gold transition-colors"
        >
          {sidebarOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:sticky top-0 left-0 h-screen w-64 bg-luxe-warm-white dark:bg-luxe-charcoal border-r border-luxe-charcoal/10 dark:border-luxe-gold/20 z-50 transition-transform duration-300 ease-in-out`}
        >
          <div className="p-6 h-full flex flex-col">
            {/* Logo/Title */}
            <div className="mb-8">
              <Link 
                to="/" 
                className="flex items-center gap-2 mb-6"
              >
                <FaHome className="w-4 h-4 text-luxe-gold" />
                <span className="font-sans text-sm text-luxe-charcoal/70 dark:text-luxe-cream/70 hover:text-luxe-gold transition-colors">
                  Retour au site
                </span>
              </Link>
              <h1 className="font-serif text-2xl text-luxe-black dark:text-luxe-cream">Administration</h1>
              {userInfo && (
                <p className="font-sans text-xs text-luxe-charcoal/60 dark:text-luxe-cream/70 mt-1">
                  {userInfo.name}
                </p>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1">
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path, item.exact);
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                          active
                            ? 'bg-luxe-gold text-luxe-black'
                            : 'text-luxe-charcoal/70 dark:text-luxe-cream/70 hover:bg-luxe-champagne/30 dark:hover:bg-luxe-gold/20 hover:text-luxe-gold'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-sans text-sm">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Sign Out */}
            <div className="pt-4 border-t border-luxe-charcoal/10 dark:border-luxe-gold/20">
              <button
                onClick={signoutHandler}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-luxe-charcoal/70 dark:text-luxe-cream/70 hover:bg-luxe-champagne/30 dark:hover:bg-luxe-gold/20 hover:text-luxe-gold transition-all duration-200"
              >
                <FaSignOutAlt className="w-4 h-4" />
                <span className="font-sans text-sm">Déconnexion</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-luxe-black/50 dark:bg-luxe-black/70 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

