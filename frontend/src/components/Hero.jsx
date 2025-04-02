import mug from "../assets/mug1.jpg";
import { FaArrowRightLong } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";

const Hero = () => {
  const navigate = useNavigate();
  const { products } = useContext(ShopContext);
  const [randomProduct, setRandomProduct] = useState(null);

  useEffect(() => {
    if (products && products.length > 0) {
      // Get a random product from the available products
      const randomIndex = Math.floor(Math.random() * products.length);
      setRandomProduct(products[randomIndex]);
    }
  }, [products]);
  
  return (
    <section className="max-padd-container">
      <div className="grid grid-cols-2 bg-hero bg-cover bg-center bg-no-repeat rounded-2xl h-[633px]">
        {/* LEFT SIDE */}
        <div className="content-end max-xs:min-w-80">
          <div className="p-4">
            <button onClick={() => navigate('/collection')} className="btn-white mt-3">Explore more</button>
          </div>
        </div>
        {/* RIGHT SIDE */}
        <div className="hidden xs:block place-items-end">
          <div className="flex flex-col rounded-2xl w-[211px] relative top-10 right-4 p-2 bg-white">
            {randomProduct && randomProduct.image && randomProduct.image.length > 0 ? (
              <img 
                src={randomProduct.image[0]} 
                alt={randomProduct.name || "Featured product"} 
                className="rounded-2xl bg-slate-900/10 h-[180px] object-contain"
                onError={(e) => (e.target.src = mug)} // Fallback to mug image if API image fails to load
              />
            ) : (
              <img src={mug} alt="Featured product" className="rounded-2xl bg-slate-900/10" />
            )}
            <button 
              onClick={() => randomProduct ? navigate(`/product/${randomProduct._id}`) : navigate('/collection')} 
              className="btn-light !py-1 !text-xs flexCenter gap-2 mt-2"
            >
              Explore this product
              <FaArrowRightLong />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
