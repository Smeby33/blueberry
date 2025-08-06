import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
export function Hero() {
  return (
    <section className="relative bg-[#0B3B47] text-white">
      <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-8 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Blueberry, votre restaurant à Port-Gentil
          </h1>
          <p className="text-lg mb-8 text-[#e2b7d3]/90">
            Savourez nos délicieux burgers, pizzas artisanales, glaces artisanales et crêpes gourmandes. Situé Boulevard Champagne, nous vous proposons le meilleur du fast-food à Port-Gentil.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/menu" className="bg-[#78013B] hover:bg-[#BF7076] text-white px-6 py-3 rounded-md font-medium flex items-center justify-center transition-colors">
              Commander maintenant
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Link>
            <Link to="/contact" className="bg-transparent border-2 border-white hover:bg-white hover:text-[#0B3B47] text-white px-6 py-3 rounded-md font-medium flex items-center justify-center transition-colors">
              Nous localiser
            </Link>
          </div>
          <div className="mt-6 flex items-center">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                  <img src={`https://randomuser.me/api/portraits/men/${20 + i}.jpg`} alt="User avatar" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium">+1000 clients satisfaits</div>
              <div className="text-xs text-[#e2b7d3]/70">à Port-Gentil</div>
            </div>
          </div>
        </div>
        <div className="md:w-1/2 relative">
          <div className="relative rounded-lg overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-black/20 z-10 rounded-lg"></div>
            <img src="https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80" alt="Délicieux burgers Blueberry" className="w-full h-80 md:h-96 object-cover" />
            <div className="absolute bottom-4 right-4 bg-[#78013B] text-white px-3 py-1 rounded-full text-sm font-medium z-20">
              Spécialité
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg hidden md:block">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#78013B]/20 rounded-full flex items-center justify-center text-[#78013B]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <div className="text-xs text-gray-500">Livraison rapide</div>
                <div className="font-medium text-[#0B3B47]">Sous 48h</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 w-full h-20 bg-[#e2b7d3]" style={{
        clipPath: 'polygon(0 100%, 100% 0, 100% 100%)'
      }}></div>
    </section>
  );
}