import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Footer from "../components/Footer";
import { FiClock, FiExternalLink } from "react-icons/fi";

// Fallback data for when API limit is reached
const fallbackArticles = [
  {
    title: "The Future of Digital Printing in E-commerce",
    description: "Digital printing technologies are revolutionizing the e-commerce space, allowing for personalized products, on-demand printing, and reduced inventory costs.",
    publishedAt: new Date().toISOString(),
    url: "https://example.com/digital-printing",
    image: null // Will use default fallback image
  },
  {
    title: "3D Printing: Transforming Product Development",
    description: "3D printing is changing how businesses prototype and develop products, offering faster iteration cycles and more cost-effective testing.",
    publishedAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    url: "https://example.com/3d-printing",
    image: null
  },
  {
    title: "Print on Demand: A Growing Business Model",
    description: "Print on demand services are helping entrepreneurs start businesses with minimal upfront investment, allowing for creative freedom and reduced risk.",
    publishedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    url: "https://example.com/print-on-demand",
    image: null
  },
  {
    title: "Sustainable Practices in the Printing Industry",
    description: "Eco-friendly inks, recycled materials, and energy-efficient printing processes are becoming standard as the industry moves toward sustainability.",
    publishedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    url: "https://example.com/sustainable-printing",
    image: null
  },
  {
    title: "How AI is Enhancing Printing Technology",
    description: "Artificial intelligence is improving print quality, reducing waste, and automating complex processes in modern printing operations.",
    publishedAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    url: "https://example.com/ai-printing",
    image: null
  },
  {
    title: "The Rise of Custom Packaging in E-commerce",
    description: "Brands are investing in custom packaging solutions to enhance unboxing experiences and strengthen brand identity in the competitive e-commerce landscape.",
    publishedAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
    url: "https://example.com/custom-packaging",
    image: null
  }
];

// Default fallback images that are stored locally or use reliable CDNs
const fallbackImages = [
  "https://images.unsplash.com/photo-1562408590-e32931084e23?w=500&auto=format&fit=crop&q=60",  // Printing press
  "https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=500&auto=format&fit=crop&q=60",  // 3D printing
  "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=500&auto=format&fit=crop&q=60",  // Digital printing
  "https://images.unsplash.com/photo-1561365452-adb940139ffa?w=500&auto=format&fit=crop&q=60",  // Printing samples
  "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500&auto=format&fit=crop&q=60",  // Printing machine
  "https://images.unsplash.com/photo-1601645191163-3fc0d5d64e35?w=500&auto=format&fit=crop&q=60"   // Packaging
];

const Blog = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("printing business");
  const [category, setCategory] = useState("business");

  // Custom topics related to printing e-commerce
  const topics = [
    { label: "Printing Business", value: "printing business" },
    { label: "E-commerce", value: "printing e-commerce" },
    { label: "3D Printing", value: "3d printing technology" },
    { label: "Digital Printing", value: "digital printing" },
    { label: "Print on Demand", value: "print on demand" },
    { label: "Printing Technology", value: "printing technology trends" }
  ];

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const apiKey = "1f62658dc7454da977e6a3f10b5a8675";
      
      // Use the searchTerm directly as it's already printing-focused
      const url = `https://gnews.io/api/v4/search?q=${searchTerm}&lang=en&country=us&max=10&apikey=${apiKey}&category=${category}`;
      
      console.log("Fetching news from:", url);
      const response = await axios.get(url);
      console.log("GNews API response:", response.data);
      
      if (response.data.articles) {
        setArticles(response.data.articles);
      } else {
        setArticles([]);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      
      // Check if the error is due to rate limiting
      if (error.response?.status === 429 || 
          error.response?.status === 403 || 
          (error.message && error.message.includes("limit"))) {
        
        // Prepare fallback articles with images
        const articlesWithImages = fallbackArticles.map((article, index) => ({
          ...article,
          image: fallbackImages[index % fallbackImages.length]
        }));
        
        setArticles(articlesWithImages);
      } else {
        setArticles([]);
      }
    } finally {
      setLoading(false);
    }
  }, [searchTerm, category]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleTopicChange = (newTopic) => {
    // Just update the search term without any notifications
    setSearchTerm(newTopic);
  };

  const handleCategoryChange = (newCategory) => {
    // Just update the category without any notifications
    setCategory(newCategory);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Just fetch news without any notifications
    fetchNews();
  };

  // Valid GNews categories
  const categories = [
    "business", "technology", "general", "science"
  ];

  // Function to get a default image if article image is missing
  const getArticleImage = (article, index) => {
    if (article.image) {
      return article.image;
    }
    
    // Use a fallback image from our reliable sources
    return fallbackImages[index % fallbackImages.length];
  };

  return (
    <div>
      <div className="bg-primary mb-16 pb-16">
        <div className="max-padd-container py-10">
          {/* HEADER */}
          <div className="text-center mb-10">
            <h2 className="h2 mb-4">Printing Industry News & Insights</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Stay updated with the latest trends, technologies, and business strategies in the printing industry
            </p>
          </div>

          {/* SEARCH AND FILTER */}
          <div className="mb-8">
            <div className="flex flex-col gap-4">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search printing business articles..."
                    className="w-full p-3 border rounded-lg"
                  />
                  <button 
                    type="submit" 
                    className="absolute right-2 top-2 bg-secondary text-white px-4 py-1 rounded"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* TOPICS */}
              <div className="mb-4">
                <h4 className="font-medium mb-2">Popular Topics:</h4>
                <div className="flex flex-wrap gap-2">
                  {topics.map((topic) => (
                    <button
                      key={topic.value}
                      onClick={() => handleTopicChange(topic.value)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        searchTerm === topic.value
                          ? "bg-secondary text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {topic.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* CATEGORIES */}
              <div>
                <h4 className="font-medium mb-2">News Categories:</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        category === cat
                          ? "bg-secondary text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ARTICLES */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="h3 mb-4">No articles found</h3>
              <p>Try changing your search terms or category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 gap-y-12 pt-6">
              {articles.map((article, index) => (
                <div key={index} className="relative flex flex-col h-full bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="flex-grow">
                    <img 
                      src={getArticleImage(article, index)}
                      alt={article.title} 
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        // If the image fails to load, use a fallback from our array
                        e.target.src = fallbackImages[index % fallbackImages.length];
                      }}
                    />
                    <div className="p-4">
                      {/* INFO */}
                      <div className="flex items-center gap-2 text-gray-500 mb-2">
                        <FiClock className="text-secondary" />
                        <p className="text-sm">{formatDate(article.publishedAt)}</p>
                      </div>
                      <h5 className="font-bold text-lg mb-3 line-clamp-2">{article.title}</h5>
                      <p className="text-gray-600 line-clamp-3 mb-4">
                        {article.description || "No description available"}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 pt-0">
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-secondary font-medium hover:underline"
                    >
                      Read full article <FiExternalLink />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Blog;
