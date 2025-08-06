import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, ClipboardListIcon, UtensilsIcon, TagIcon, UsersIcon, BarChartIcon, SettingsIcon, LogOutIcon, ShoppingCartIcon, UserIcon } from 'lucide-react';
export function AdminSidebar({
  className,
  mobile = false
}) {
  const menuItems = [{
    name: 'Tableau de bord',
    path: '/admin',
    icon: <HomeIcon className="w-5 h-5" />
  }, {
    name: 'Commandes',
    path: '/admin/orders',
    icon: <ShoppingCartIcon className="w-5 h-5" />
  }, {
    name: 'Produits',
    path: '/admin/products',
    icon: <UtensilsIcon className="w-5 h-5" />
  }, {
    name: 'Catégories',
    path: '/admin/categories',
    icon: <TagIcon className="w-5 h-5" />
  }, {
    name: 'Utilisateurs',
    path: '/admin/users',
    icon: <UsersIcon className="w-5 h-5" />
  }, {
    name: 'Statistiques',
    path: '/admin/stats',
    icon: <BarChartIcon className="w-5 h-5" />
  }, {
    name: 'Paramètres',
    path: '/admin/settings',
    icon: <SettingsIcon className="w-5 h-5" />
  }];
  return <div className={`flex-1 bg-[#0B3B47] ${className}`}>
      <nav className="px-2 py-4">
        <div className="space-y-1">
          {menuItems.map(item => <NavLink key={item.path} to={item.path} className={({
          isActive
        }) => `flex items-center px-2 py-2 text-sm font-medium rounded-md group transition-colors ${isActive ? 'bg-[#2b5a67] text-white' : 'text-gray-100 hover:bg-[#2b5a67] hover:text-white'}`} end={item.path === '/admin'}>
              <div className="mr-3">{item.icon}</div>
              {item.name}
            </NavLink>)}
        </div>
      </nav>
      <div className="px-2 py-4 mt-auto border-t border-[#2b5a67]">
        <NavLink to="/profile" className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-100 rounded-md hover:bg-[#78013B] hover:text-white transition-colors mb-2">
          <UserIcon className="w-5 h-5 mr-3" />
          Quitter l'admin
        </NavLink>
        <button className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-100 rounded-md hover:bg-[#2b5a67] hover:text-white transition-colors">
          <LogOutIcon className="w-5 h-5 mr-3" />
          Déconnexion
        </button>
      </div>
    </div>;
}