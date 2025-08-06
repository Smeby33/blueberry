import React from 'react';
import { Link } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { FeaturedItems } from '../components/menu/FeaturedItems';
import { DailySpecial } from '../components/menu/DailySpecial';
import { RestaurantInfo } from '../components/RestaurantInfo';
export function HomePage({
  onAddToPlateau
}) {
  return (
    <div>
      <Hero />
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-[#0B3B47]">
            Nos Spécialités Blueberry
          </h2>
          <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
            Découvrez notre délicieuse sélection de fast-food, glaces artisanales et crêpes gourmandes. Chez Blueberry, nous privilégions la fraîcheur et la qualité pour vous offrir une expérience culinaire unique à Port-Gentil.
          </p>
          <FeaturedItems onAddToPlateau={onAddToPlateau} />
          <div className="text-center mt-8">
            <Link to="/menu" className="inline-block bg-[#0B3B47] hover:bg-[#2b5a67] text-white font-medium py-3 px-6 rounded-md transition-colors">
              Voir notre menu complet
            </Link>
          </div>
        </div>
      </section>
      {/* Section DailySpecial et RestaurantInfo peuvent être adaptées ou retirées selon le besoin */}
      <DailySpecial onAddToPlateau={onAddToPlateau} />
      <RestaurantInfo />
    </div>
  );
}