import { useState, useEffect, useCallback } from "react";
import { itemsHomeStyles } from "../assets/dummyStyles";
import BannerHome from "./BannerHome";
import { useNavigate } from "react-router-dom";
import { categories, products } from "../assets/dummyData";
import { useCart } from "../CartContent";
import { FaChevronRight, FaMinus, FaPlus, FaShoppingCart, FaThList } from "react-icons/fa";
import { debounce } from 'lodash';

const ItemsHome = () => {
  const [activeCategory, setActiveCategory] = useState(() => {
    return localStorage.getItem("activeCategory") || "all";
  });

  useEffect(() => {
    localStorage.setItem("activeCategory", activeCategory);
  }, [activeCategory]);

  const navigate = useNavigate();
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [apiProducts, setApiProducts] = useState([]);
  const [apiCategories, setApiCategories] = useState([]);
  const API_URL = (import.meta.env && import.meta.env.VITE_API_URL) ;
  const resolveImage = (url) => {
    if (!url) return "";
    if (url.startsWith('/api') || url.startsWith('/static')) return `${API_URL}${url}`;
    return url;
  };

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const ts = Date.now();
        const [catsRes, prodsRes] = await Promise.all([
          fetch(`${API_URL}/api/products/categories?ts=${ts}`, { signal: controller.signal }),
          fetch(`${API_URL}/api/products?ts=${ts}`, { signal: controller.signal })
        ]);
        if (catsRes.ok) {
          const cats = await catsRes.json();
          if (Array.isArray(cats) && cats.length) setApiCategories(cats);
        }
        if (prodsRes.ok) {
          const list = await prodsRes.json();
          if (Array.isArray(list) && list.length) setApiProducts(list);
        }
      } catch {}
    };
    load();
    return () => controller.abort();
  }, [API_URL]);

  // Debug cart state changes
  useEffect(() => {
    console.log('Current cart state:', cart);
  }, [cart]);

  // Debounced search handler
  const handleSearchSubmit = useCallback(
    debounce((term) => {
      setSearchTerm(term);
    }, 300),
    []
  );

  // Sidebar categories
  const sidebarCategories = [
    {
      name: "All Items",
      icon: <FaThList className="text-lg" />,
      value: "all",
    },
    ...(apiCategories && apiCategories.length
      ? apiCategories.map((name) => ({ name, value: name }))
      : categories),
  ];

  // Search logic
  const productMatchesSearch = (product, term) => {
    if (!term) return true;
    const cleanedTerm = term.trim().toLowerCase();
    const searchWords = cleanedTerm.split(/\s+/);
    return searchWords.every((word) =>
      product.name && typeof product.name === 'string'
        ? product.name.toLowerCase().includes(word)
        : false
    );
  };

  // Filtered products
  const sourceProducts = apiProducts && apiProducts.length ? apiProducts : products;
  const searchedProducts = Array.isArray(sourceProducts)
    ? searchTerm
      ? sourceProducts.filter((product) => productMatchesSearch(product, searchTerm))
      : activeCategory === "all"
      ? sourceProducts
      : sourceProducts.filter((product) => product.category === activeCategory)
    : [];

  // Cart functions
  const getQuantity = (productId) => {
    const item = cart.find((item) => item.id === productId);
    console.log(`Quantity for product ${productId}: ${item ? item.quantity : 0}`);
    return item ? item.quantity : 0;
  };

  const handleIncrease = (product) => {
    console.log(`Adding product ${product.id} to cart`);
    addToCart(product, 1);
  };

  const handleDecrease = (product) => {
    const qty = getQuantity(product.id);
    if (qty > 1) {
      updateQuantity(product.id, qty - 1);
    } else {
      console.log(`Removing product ${product.id} from cart`);
      removeFromCart(product);
    }
  };

  // Redirect to items page
  const redirectToItemsPage = () => {
    navigate("/items", { state: { category: activeCategory } });
  };

  return (
    <div className={itemsHomeStyles.page}>
      <BannerHome onSearch={handleSearchSubmit} />
      <div className="flex flex-col lg:flex-row flex-1">
        <aside className={itemsHomeStyles.sidebar}>
          <div className={itemsHomeStyles.sidebarHeader}>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
              }}
              className={itemsHomeStyles.sidebarTitle}
            >
              FreshCart
            </h1>

            <div className={itemsHomeStyles.categoryList}>
              <ul className="space-y-2">
                {sidebarCategories.map((category) => (
                  <li key={category.name}>
                    <button
                      onClick={() => {
                        setActiveCategory(category.value || category.name);
                        setSearchTerm("");
                      }}
                      className={`
                        ${itemsHomeStyles.categoryItem} 
                        ${
                          activeCategory === (category.value || category.name) && !searchTerm
                            ? itemsHomeStyles.activeCategory
                            : itemsHomeStyles.inactiveCategory
                        }
                      `}
                    >
                      <div className={itemsHomeStyles.categoryIcon}>
                        {category.icon}
                      </div>
                      <span className={itemsHomeStyles.categoryName}>
                        {category.name}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        <main className={itemsHomeStyles.mainContent}>
          <div className={itemsHomeStyles.mobileCategories}>
            <div className="flex space-x-4">
              {sidebarCategories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => {
                    setActiveCategory(cat.value || cat.name);
                    setSearchTerm("");
                  }}
                  className={`${itemsHomeStyles.mobileCategoryItem}
                        ${
                          activeCategory === (cat.value || cat.name) && !searchTerm
                            ? itemsHomeStyles.activeMobileCategory
                            : itemsHomeStyles.inactiveMobileCategory
                        }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {searchTerm && (
            <div className={itemsHomeStyles.searchResults}>
              <div className="flex items-center justify-center">
                <span className="text-emerald-700 font-medium">
                  Search results for <span className="font-bold">"{searchTerm}"</span>
                </span>
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-4 text-emerald-500 hover:text-shadow-emerald-700 p-1 rounded-full transition-colors"
                >
                  <span className="text-sm bg-emerald-100 px-2 py-1 rounded-full">
                    Clear
                  </span>
                </button>
              </div>
            </div>
          )}

          <div className="text-center mb-6">
            <h2
              className={itemsHomeStyles.sectionTitle}
              style={{
                fontFamily: "'Playfair Display', serif",
              }}
            >
              {searchTerm
                ? "Search Results"
                : activeCategory === "all"
                ? "Featured Products"
                : `Best ${activeCategory}`}
            </h2>
            <div className={itemsHomeStyles.sectionDivider}></div>
          </div>

          <div className={itemsHomeStyles.productsGrid}>
            {searchedProducts.length > 0 ? (
              searchedProducts.map((product) => {
                const qty = getQuantity(product.id);
                return (
                  <div key={product.id} className={itemsHomeStyles.productCard}>
                    <div className={itemsHomeStyles.imageContainer}>
                      <img
                        src={resolveImage(product.image)}
                        alt={product.name}
                        className={itemsHomeStyles.productImage}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.parentNode.innerHTML = `
                            <div class='flex items-center justify-center w-full h-full bg-gray-200'>
                              <span class='text-gray-500 text-sm'>No Image</span>
                            </div>
                          `;
                        }}
                      />
                    </div>
                    <div className={itemsHomeStyles.productContent}>
                      <h3 className={itemsHomeStyles.productTitle}>
                        {product.name}
                      </h3>
                      <div className={itemsHomeStyles.priceContainer}>
                        <div>
                          <p className={itemsHomeStyles.currentPrice}>
                            ₹{product.price.toFixed(2)}
                          </p>
                          <span className={itemsHomeStyles.oldPrice}>
                            ₹{(product.price * 1.2).toFixed(2)}
                          </span>
                        </div>
                        {qty === 0 ? (
                          <button
                            onClick={() => handleIncrease(product)}
                            className={itemsHomeStyles.addButton}
                          >
                            <FaShoppingCart className="mr-2" />
                            Add to Cart
                          </button>
                        ) : (
                          <div className={itemsHomeStyles.quantityControls}>
                            <button
                              onClick={() => handleDecrease(product)}
                              className={itemsHomeStyles.quantityButton}
                            >
                              <FaMinus />
                            </button>
                            <span className="font-bold">{qty}</span>
                            <button
                              onClick={() => handleIncrease(product)}
                              className={itemsHomeStyles.quantityButton}
                            >
                              <FaPlus />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={itemsHomeStyles.noProducts}>
                <div className={itemsHomeStyles.noProductsText}>
                  No products found.
                </div>
                <button
                  onClick={() => setSearchTerm("")}
                  className={itemsHomeStyles.clearSearchButton}
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>

          {!searchTerm && (
            <div className="text-center">
              <button
                onClick={redirectToItemsPage}
                className={itemsHomeStyles.viewAllButton}
              >
                View All {activeCategory === "all" ? "Products" : activeCategory}
                <FaChevronRight className="ml-3" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ItemsHome;