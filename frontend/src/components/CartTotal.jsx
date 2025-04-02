import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import { useLocation } from "react-router-dom";

const CartTotal = () => {
  const { currency, getCartAmount, delivery_charges, formatPrice, products } = useContext(ShopContext);
  const location = useLocation();
  const directCheckout = location.state?.directCheckout || false;
  const directCheckoutProductId = location.state?.productId;
  
  // Calculate the total based on whether it's direct checkout or regular cart
  const calculateTotal = () => {
    if (directCheckout && directCheckoutProductId) {
      // For direct checkout, find the product and return its price
      const product = products.find(p => p._id === directCheckoutProductId);
      return product ? product.price : 0;
    } else {
      // For regular checkout, use the cart total
      return getCartAmount();
    }
  };

  const subtotal = calculateTotal();
  const total = subtotal + (subtotal > 0 ? delivery_charges : 0);

  return (
    <section className="w-full">
      <Title title1={"Cart"} title2={"Total"} title1Styles={"h3"} />
      <div className="flexBetween pt-3">
        <h5 className="h5">SubTotal:</h5>
        <p className="h5">
          {currency}
          {formatPrice(subtotal)}
        </p>
      </div>
      <hr className="mx-auto h-[1px] w-full bg-gray-900/10 my-1" />
      <div className="flexBetween pt-3">
        <h5 className="h5">Shipping Fee:</h5>
        <p className="h5">
          {subtotal === 0 ? `${currency}0` : `${currency}${formatPrice(delivery_charges)}`}
        </p>
      </div>
      <hr className="mx-auto h-[1px] w-full bg-gray-900/10 my-1" />
      <div className="flexBetween pt-3">
        <h5 className="h5">Total:</h5>
        <p className="h5">
          {currency}
          {subtotal === 0 ? "0" : formatPrice(total)}
        </p>
      </div>
    </section>
  );
};

export default CartTotal;
