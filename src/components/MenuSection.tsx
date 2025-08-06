import React, { useState, useEffect } from 'react';
import { MenuCategory } from './MenuCategory';
import { getAllCategories } from '../services/database.js';
import { getAllProducts } from '../services/database.js';
export function MenuSection({ onAddToCart }) {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const cats = await getAllCategories(true);
      setCategories(cats);
      if (cats.length > 0) setActiveCategory(cats[0].id);
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      if (!activeCategory) return;
      setLoading(true);
      const prods = await getAllProducts(activeCategory);
      setProducts(prods);
      setLoading(false);
    }
    fetchProducts();
  }, [activeCategory]);

  return <section id="menu" className="py-16 bg-[#e2b7d3]">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-12 text-[#0B3B47]">
        Notre Menu
      </h2>
      <div className="flex overflow-x-auto pb-4 mb-8 scrollbar-hide">
        <div className="flex space-x-2 mx-auto">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${activeCategory === category.id ? 'bg-[#0B3B47] text-white' : 'bg-white text-[#0B3B47] hover:bg-[#78013B] hover:text-white'}`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="text-center text-gray-500 py-12">Chargement du menu...</div>
      ) : (
        <MenuCategory items={products} onAddToCart={onAddToCart} />
      )}
    </div>
  </section>;
}
}