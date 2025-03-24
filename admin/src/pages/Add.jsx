import React, { useCallback, useState } from "react";
import upload_icon from "../assets/upload_icon.png";
import { FaCheck } from "react-icons/fa6";
import axios from "axios";
import { backend_url } from "../App";
import { toast } from "react-toastify";

const Add = ({ token }) => {
  const [images, setImages] = useState({
    image1: null,
    image2: null,
    image3: null,
    image4: null,
  });
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("10");
  const [category, setCategory] = useState("Mug");
  const [popular, setPopular] = useState(false);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e, key) => {
    setImages((prev) => ({ ...prev, [key]: e.target.files[0] }));
  };

  const onSubmitHandler = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("price", price);
        formData.append("category", category);
        formData.append("popular", JSON.stringify(popular));
        formData.append("colors", JSON.stringify(colors));

        Object.keys(images).forEach((key) => {
          if (images[key]) formData.append(key, images[key]);
        });

        const response = await axios.post(
          `${backend_url}/api/product/add`,
          formData,
          { headers: { token } }
        );

        if (response.data.success) {
          toast.success(response.data.message);
          setName("");
          setDescription("");
          setPrice("10");
          setImages({ image1: null, image2: null, image3: null, image4: null });
          setColors([]);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Something went wrong while adding product"
        );
      } finally {
        setLoading(false);
      }
    },
    [name, description, price, category, popular, colors, images, token]
  );

  return (
    <div className="px-2 sm:px-8 mt-2 sm:mt-14 pb-16">
      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col gap-y-3 medium-14 lg:w-[777px]"
      >
        <div className="w-full">
          <h5 className="h5">Product Name</h5>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            placeholder="Write here..."
            className="px-3 py-1.5 ring-1 ring-slate-900/10 rounded bg-white mt-1 w-full max-w-lg"
          />
        </div>
        <div className="w-full">
          <h5 className="h5">Product Description</h5>
          <textarea
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            rows={5}
            placeholder="Write here..."
            className="px-3 py-1.5 ring-1 ring-slate-900/10 rounded bg-white mt-1 w-full max-w-lg"
          />
        </div>
        {/* CATEGORIES */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <h5 className="h5">Category</h5>
            <select
              onChange={(e) => setCategory(e.target.value)}
              value={category}
              className="max-w-40 px-3 py-2 text-gray-30 ring-1 ring-slate-900/5 bg-white rounded"
            >
              <option value="Mug">Mug</option>
              <option value="T-Shirt">T-Shirt</option>
              <option value="Umbrella">Umbrella</option>
              <option value="Calendar">Calendar</option>
              <option value="Medal">Medal</option>
              <option value="Award-Thropy">Award-Thropy</option>
            </select>
          </div>
          <div>
            <h5 className="h5">Product Price</h5>
            <input
              onChange={(e) => setPrice(e.target.value)}
              value={price}
              type="number"
              placeholder="10"
              className="px-3 py-2 bg-white rounded max-w-24 ring-1 ring-slate-900/5"
            />
          </div>
        </div>
        {/* COLORS */}
        <div>
          <h5 className="h5">Product Colors</h5>
          <div className="flex gap-2 my-4">
            {["Black", "Red", "White", "Blue"].map((color, i) => (
              <div
                key={i}
                onClick={() =>
                  setColors((prev) =>
                    prev.includes(color)
                      ? prev.filter((c) => c !== color)
                      : [...prev, color]
                  )
                }
              >
                <span
                  className="h-9 w-9 rounded-full flexCenter"
                  style={{ backgroundColor: color.toLocaleLowerCase() }}
                >
                  {colors.includes(color) && (
                    <FaCheck
                      className={
                        color === "White" ? "text-black" : "text-white"
                      }
                    />
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* IMAGES */}
        <div className="flex gap-2 pt-2">
          {["image1", "image2", "image3", "image4"].map((imgKey, i) => (
            <label key={i} htmlFor={imgKey}>
              <img
                src={
                  images[imgKey]
                    ? URL.createObjectURL(images[imgKey])
                    : upload_icon
                }
                alt=""
                className="w-16 h-16 aspect-square object-cover ring-1 ring-slate-900/5 rounded-lg"
              />
              <input
                onChange={(e) => handleImageChange(e, imgKey)}
                type="file"
                id={imgKey}
                hidden
              />
            </label>
          ))}
        </div>
        <div className="flex items-center gap-2 my-2">
          <input
            onChange={(e) => setPopular((prev) => !prev)}
            type="checkbox"
            checked={popular}
            id="popular"
          />
          <label htmlFor="popular" className="cursor-pointer">
            Add to Popular
          </label>
        </div>
        <button
          type="submit"
          className="btn-dark mt-3 max-w-44 sm:w-full flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="border-2 border-t-transparent border-white w-5 h-5 rounded-full animate-spin"></div>
              <span>Uploading...</span>
            </div>
          ) : (
            "Add Product"
          )}
        </button>
      </form>
    </div>
  );
};

export default Add;
