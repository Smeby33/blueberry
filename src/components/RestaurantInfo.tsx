
import { MapPin, Clock, Phone, Award } from 'lucide-react';
import { getEntrepriseInfo } from '../services/entreprise';

import React, { useState, useEffect } from 'react';

type EntrepriseInfo = {
  restaurantName?: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  logo?: string;
  favicon?: string;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  labels?: string[];
  image1?: string;
  image2?: string;
  image3?: string;
  horaires?: string | string[];
};

export function RestaurantInfo() {
  const [info, setInfo] = useState<EntrepriseInfo | null>(null);
  useEffect(() => {
    getEntrepriseInfo().then(setInfo);
  }, []);

  if (!info) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <span className="text-gray-400">Chargement des informations...</span>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16" style={{ background: info.backgroundColor || '#e2b7d3' }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          {info.logo && (
            <img src={info.logo} alt="Logo" className="mx-auto mb-4 h-20 rounded-full object-contain shadow" style={{ background: '#fff' }} />
          )}
          <h2 className="text-3xl font-bold" style={{ color: info.primaryColor || '#0B3B47', fontFamily: info.fontFamily || 'inherit' }}>
            {info.restaurantName || 'Notre Restaurant'}
          </h2>
          <p className="text-gray-600 mt-2" style={{ fontFamily: info.fontFamily || 'inherit' }}>
            {info.description || 'Découvrez notre établissement et notre engagement pour la qualité'}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="bg-white p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4" style={{ color: info.primaryColor || '#0B3B47', fontFamily: info.fontFamily || 'inherit' }}>
                Informations pratiques
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-[#e2b7d3] p-2 rounded-md mr-4">
                    <MapPin className="w-5 h-5" style={{ color: info.secondaryColor || '#78013B' }} />
                  </div>
                  <div>
                    <h4 className="font-medium">Adresse</h4>
                    <p className="text-gray-600">
                      {info.address || 'Adresse non renseignée'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-[#e2b7d3] p-2 rounded-md mr-4">
                    <Clock className="w-5 h-5" style={{ color: info.secondaryColor || '#78013B' }} />
                  </div>
                  <div>
                    <h4 className="font-medium">Horaires d'ouverture</h4>
                    <p className="text-gray-600">Lundi - Dimanche : 11h - 23h</p>
                    <p className="text-gray-600 text-sm">Service continu</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-[#e2b7d3] p-2 rounded-md mr-4">
                    <Phone className="w-5 h-5" style={{ color: info.secondaryColor || '#78013B' }} />
                  </div>
                  <div>
                    <h4 className="font-medium">Contact</h4>
                    <p className="text-gray-600">Tél: {info.phone || 'Non renseigné'}</p>
                    <p className="text-gray-600">Email: {info.email || 'Non renseigné'}</p>
                  </div>
                </div>
              </div>
              {info.labels && Array.isArray(info.labels) && info.labels.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {info.labels.map((label, i) => (
                    <div key={i} className="flex items-center bg-white py-1 px-3 rounded-full">
                      <Award className="w-4 h-4" style={{ color: info.secondaryColor || '#78013B' }} />
                      <span className="text-sm">{label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg overflow-hidden h-48">
              <img src={info.image1 || info.favicon || "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"} alt="Restaurant interior" className="w-full h-full object-cover" />
            </div>
            <div className="rounded-lg overflow-hidden h-48">
              <img src={info.image2 || info.logo || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"} alt="Restaurant food" className="w-full h-full object-cover" />
            </div>
            <div className="rounded-lg overflow-hidden h-48 col-span-2">
              <img src={info.image3 || info.favicon || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"} alt="Restaurant ambiance" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}