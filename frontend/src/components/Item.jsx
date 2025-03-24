import React, { useState } from "react";
import { Link } from "react-router-dom";

const Item = ({ product }) => {
  const [hovered, setHovered] = useState(false);

  // Fallback untuk data produk
  if (!product) return null;

  const { _id, name, category, price, description, image } = product;
  const productImages =
    Array.isArray(image) && image.length > 0 ? image : ["/placeholder.jpg"];

  return (
    <div className="overflow-hidden">
      {/* IMAGE */}
      <Link
        to={_id ? `/product/${_id}` : "#"}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flexCenter p-2 bg-[#f5f5f5] overflow-hidden relative"
      >
        <img
          src={
            productImages.length > 1 && hovered
              ? productImages[1]
              : productImages[0]
          }
          alt={name || "Product Image"}
          className="w-full max-w-[200px] h-auto sm:h-[250px] object-contain mx-auto transition-all duration-200"
          onError={(e) => (e.target.src = "/placeholder.jpg")}
        />
      </Link>
      {/* INFO */}
      <div className="p-3">
        <h4 className="bold-15 line-clamp-1 !py-0">
          {name || "Unknown Product"}
        </h4>
        <div className="flexBetween pt-1">
          <p className="h5">{category || "Uncategorized"}</p>
          <h5 className="h5 pr-2">
            IDR {typeof price === "number" ? price.toFixed(2) : "N/A"}
          </h5>
        </div>
        <p className="line-clamp-2 py-1">
          {description || "No description available."}
        </p>
      </div>
    </div>
  );
};

export default Item;
