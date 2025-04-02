import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import axios from "axios";

// CONTROLLER FUNCTION FOR ADDING PRODUCT
const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, colors, popular } = req.body;

    // EXTRACTING IMAGES IF PROVIDED
    const image1 = req.files?.image1?.[0];
    const image2 = req.files?.image2?.[0];
    const image3 = req.files?.image3?.[0];
    const image4 = req.files?.image4?.[0];

    const images = [image1, image2, image3, image4].filter(
      (item) => item !== undefined
    );

    // UPLOAD IMAGES TO CLOUDINARY OR USE A DEFAULT IMAGE
    let imagesUrl;
    if (images.length > 0) {
      imagesUrl = await Promise.all(
        images.map(async (item) => {
          const result = await cloudinary.uploader.upload(item.path, {
            resource_type: "image",
          });
          return result.secure_url;
        })
      );
    } else {
      // DEFAULT IMAGE URL IF NO IMAGES ARE PROVIDED
      imagesUrl = ["https://dummyimage.com/150"];
    }

    // CREATE PRODUCT DATA
    const productData = {
      name,
      description,
      price,
      category,
      popular: popular == "true" ? true : false,
      colors: colors ? JSON.parse(colors) : [], // DEFAULT TO EMPTY ARRAY IF COLORS NOT PROVIDED
      image: imagesUrl,
      date: Date.now(),
    };

    console.log(productData);

    const product = new productModel(productData);
    await product.save();

    // Send notification to subscribers about the new product
    try {
      // Get the server URL from the request
      const protocol = req.protocol;
      const host = req.get('host');
      const baseUrl = `${protocol}://${host}`;
      
      // Make a direct call to the notification function instead of using axios
      // This avoids issues with passing authorization headers
      const notificationData = {
        productId: product._id.toString(),
        productName: product.name,
        productImage: product.image[0], // Use the first image
        productDescription: product.description
      };

      // Import the notification function directly
      import('../controllers/subscriberController.js').then(subscriberController => {
        // Create a mock request and response
        const mockReq = {
          body: notificationData,
          user: req.user // Pass the authenticated user if available
        };
        
        const mockRes = {
          status: (code) => ({
            json: (data) => {
              console.log(`Notification response (${code}):`, data);
            }
          })
        };
        
        // Call the notification function directly
        subscriberController.notifyNewProduct(mockReq, mockRes).catch(err => {
          console.error('Error in direct notification call:', err);
        });
        
        console.log('Notification process started for new product');
      }).catch(err => {
        console.error('Failed to import subscriber controller:', err);
      });
      
    } catch (notifyError) {
      // Don't fail the product creation if notification fails
      console.error('Failed to notify subscribers:', notifyError.message);
    }

    res.json({ success: true, message: "Product Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// CONTROLLER FUNCTION FOR REMOVE PRODUCT
const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Product Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// CONTROLLER FUNCTION FOR LIST PRODUCT
const listProducts = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// CONTROLLER FUNCTION FOR ADDING PRODUCT
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await productModel.findById(productId);
    res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { addProduct, removeProduct, listProducts, singleProduct };
