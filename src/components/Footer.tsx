import React, { useEffect, useState } from 'react';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter } from 'lucide-react';
import { getEntrepriseInfo } from '../services/database';
export function Footer() {
  const [info, setInfo] = useState({
    restaurantName: 'Blueberry',
    address: 'Boulevard Champagne\nPort-Gentil, Gabon',
    phone: '+241 07 00 00 00',
    email: 'contact@blueberry-pg.com',
    description: "Votre restaurant de fast-food à Port-Gentil. Spécialiste des burgers, pizzas, glaces artisanales et crêpes gourmandes."
  });
  useEffect(() => {
    getEntrepriseInfo().then((data) => {
      if (data) {
        setInfo({
          restaurantName: data.restaurantName || 'Blueberry',
          address: data.address || 'Boulevard Champagne\nPort-Gentil, Gabon',
          phone: data.phone || '+241 07 00 00 00',
          email: data.email || 'contact@blueberry-pg.com',
          description: data.description || "Votre restaurant de fast-food à Port-Gentil. Spécialiste des burgers, pizzas, glaces artisanales et crêpes gourmandes."
        });
      }
    });
  }, []);
  return <footer className="bg-[#00559b] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">{info.restaurantName}</h3>
            <p className="text-sm text-[#e1edf7]/80 mb-6">
              {info.description}
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/profile.php?id=100066829567475" className="bg-[#e1edf7]/10 hover:bg-[#7ff4eb] p-2 rounded-full transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/" className="bg-[#e1edf7]/10 hover:bg-[#7ff4eb] p-2 rounded-full transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://twitter.com/" className="bg-[#e1edf7]/10 hover:bg-[#7ff4eb] p-2 rounded-full transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-[#e1edf7]/80 hover:text-[#7ff4eb] transition-colors">
                  Accueil
                </a>
              </li>
              <li>
                <a href="#menu" className="text-[#e1edf7]/80 hover:text-[#7ff4eb] transition-colors">
                  Notre Menu
                </a>
              </li>
              <li>
                <a href="#" className="text-[#e1edf7]/80 hover:text-[#7ff4eb] transition-colors">
                  Spécialités du jour
                </a>
              </li>
              <li>
                <a href="#" className="text-[#e1edf7]/80 hover:text-[#7ff4eb] transition-colors">
                  Promotions
                </a>
              </li>
              <li>
                <a href="#" className="text-[#e1edf7]/80 hover:text-[#7ff4eb] transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Horaires d'ouverture</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Clock className="w-4 h-4 mr-2 mt-0.5 text-[#7ff4eb]" />
                <span className="text-[#e1edf7]/80">
                  Lundi - Dimanche : 11h00 - 23h00<br/>
                  <span className="text-xs">Service continu</span>
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 text-[#7ff4eb]" />
                <span className="text-[#e1edf7]/80" style={{whiteSpace: 'pre-line'}}>{info.address}</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-[#7ff4eb]" />
                <span className="text-[#e1edf7]/80">{info.phone}</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-[#7ff4eb]" />
                <span className="text-[#e1edf7]/80">{info.email}</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-[#e1edf7]/20 text-center">
          <p className="text-sm text-[#e1edf7]/60">
            &copy; {new Date().getFullYear()} {info.restaurantName}. Tous droits
            réservés.
          </p>
        </div>
      </div>
    </footer>;
}