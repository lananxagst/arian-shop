import { useState, useEffect } from "react";
import { blogs } from "../assets/data"; // Keep as fallback

// Fallback images from reliable sources
const fallbackImages = [
  "https://images.unsplash.com/photo-1562408590-e32931084e23?w=500&auto=format&fit=crop&q=60",  // Printing press
  "https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=500&auto=format&fit=crop&q=60",  // 3D printing
  "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=500&auto=format&fit=crop&q=60",  // Digital printing
  "https://images.unsplash.com/photo-1561365452-adb940139ffa?w=500&auto=format&fit=crop&q=60"   // Printing samples
];

const Blog = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useLocalData, setUseLocalData] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        console.log("Fetching printing news from GNews API...");
        // Using Gnews API with search query for printing-related news
        const response = await fetch(
          "https://gnews.io/api/v4/search?q=printing+printer+technology&lang=id&country=id&max=4&apikey=1f62658dc7454da977e6a3f10b5a8675"
        );
        
        console.log("API Response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error:", errorText);
          throw new Error(`Failed to fetch news: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        console.log("API Data received:", data);
        
        if (data.articles && data.articles.length > 0) {
          setArticles(data.articles);
          setLoading(false);
        } else {
          console.warn("No articles found in API response, using local data");
          setUseLocalData(true);
          
          // Enhance local blog data with better images
          const enhancedBlogs = blogs.slice(0, 4).map((blog, index) => ({
            ...blog,
            image: fallbackImages[index % fallbackImages.length] || blog.image
          }));
          
          setArticles(enhancedBlogs);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching news:", err);
        setUseLocalData(true);
        
        // Enhance local blog data with better images
        const enhancedBlogs = blogs.slice(0, 4).map((blog, index) => ({
          ...blog,
          image: fallbackImages[index % fallbackImages.length] || blog.image
        }));
        
        setArticles(enhancedBlogs);
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <section className="max-padd-container pb-16">
      <h2 className="h2 text-center mb-8">Printing News & Updates</h2>
      
      {loading && <p className="text-center">Loading printing news...</p>}
      
      {/* CONTAINER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {articles.map((article, index) => (
          <div key={index} className="relative">
            <img 
              src={useLocalData ? article.image : (article.image || fallbackImages[index % fallbackImages.length])} 
              alt={article.title} 
              className="rounded-xl w-full h-48 object-cover"
              onError={(e) => {
                e.target.src = fallbackImages[index % fallbackImages.length];
              }}
            />
            {/* INFO */}
            <p className="medium-14 mt-6">{useLocalData ? article.category : (article.source?.name || "Printing News")}</p>
            <h5 className="h5 pr-4 mb-1">{article.title}</h5>
            <p className="line-clamp-2">
              {useLocalData 
                ? article.description || "Discover the latest innovations in printing technology and industry trends." 
                : article.description}
            </p>
            {useLocalData ? (
              <button className="underline mt-2 bold-14">continue reading</button>
            ) : (
              <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="underline mt-2 bold-14 inline-block"
              >
                continue reading
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Blog;
