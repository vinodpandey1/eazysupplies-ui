import React, { useEffect, useMemo, useState } from "react";
import CartContext from ".";
import { ToastNotification } from "@/utils/customFunctions/ToastNotification";
import { calculateCartTotals } from "@/utils/pricing/orderTotals";

const CartProvider = (props) => {
  const [cartProducts, setCartProducts] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartToggle, setCartToggle] = useState(false);
  const [variationModal, setVariationModal] = useState("");

  // ✅ Load Cart Data from localStorage
  useEffect(() => {
    const isCartAvailable = JSON.parse(localStorage.getItem("cart"));
    if (isCartAvailable?.items?.length > 0) {
      setCartProducts(isCartAvailable?.items);
      setCartTotal(isCartAvailable?.total);
    }
  }, []);

  // ✅ Store cart in localStorage whenever cart changes
  useEffect(() => {
    storeInLocalStorage();
  }, [cartProducts]);

  // ✅ Calculate total dynamically
  const total = useMemo(() => {
    return calculateCartTotals(cartProducts).subtotal;
  }, [cartProducts]);

  // ✅ Helper to calculate total (for external calls)
  const getTotal = (value) => {
    return calculateCartTotals(value).subtotal;
  };

  // ✅ Save data to localStorage
  const storeInLocalStorage = () => {
    const newTotal = total;
    setCartTotal(newTotal);
    localStorage.setItem("cart", JSON.stringify({ items: cartProducts, total: newTotal }));
  };

  // ✅ Clear Cart
  const clearCart = () => {
    setCartProducts([]);
    setCartTotal(0);
    localStorage.removeItem("cart");
    ToastNotification("success", "Cart cleared successfully");
  };

  // ✅ Remove Cart Item
  const removeCart = (id) => {
    const updatedCart = cartProducts.filter((item) =>
      item?.variation_id ? item?.variation_id !== id : item.product_id !== id
    );
    setCartProducts(updatedCart);
  };

  // ✅ Add / Increment / Decrement Product Quantity
  const handleIncDec = (qty, productObj, isProductQty, setIsProductQty, isOpenFun, cloneVariation) => {
    const updatedQty = (isProductQty ? isProductQty : 0) + qty;
    const cart = [...cartProducts];
    const index = cart.findIndex(
      (item) =>
        item.product_id === productObj?.id &&
        item.variation_id === (cloneVariation?.selectedVariation?.id || null)
    );

    // If not in cart → Add new product
    if (index === -1) {
      const params = {
        id: Date.now(), // temporary unique id
        product: productObj,
        product_id: productObj?.id,
        variation: cloneVariation?.selectedVariation || null,
        variation_id: cloneVariation?.selectedVariation?.id || null,
        quantity: cloneVariation?.productQty ? cloneVariation?.productQty : updatedQty,
        sub_total: updatedQty * (cloneVariation?.selectedVariation?.price || productObj?.price),
      };
      setCartProducts((prev) => [...prev, params]);
    } else {
      // Update existing product
      const newQuantity = cart[index].quantity + qty;

      // Remove if qty < 1
      if (newQuantity < 1) {
        return removeCart(cloneVariation?.variation_id || productObj?.id);
      }

      const productStockQty = Number(cart[index]?.variation?.quantity ?? cart[index]?.product?.stock ?? 0);
      if (newQuantity > productStockQty) {
        ToastNotification("error", `Only ${productStockQty} items in stock.`);
        return false;
      }

      cart[index] = {
        ...cart[index],
        quantity: newQuantity,
        sub_total: newQuantity * (cart[index]?.variation?.price || cart[index]?.product?.price),
      };
      setCartProducts([...cart]);
    }

    // Update local qty and UI triggers
    setIsProductQty && setIsProductQty(index === -1 ? updatedQty : Math.max(0, cart[index]?.quantity ?? updatedQty));
    isOpenFun && isOpenFun(true);
  };

  // Set the selected product/variation to an exact quantity.
  // Product pages use this so changing 5 to 10 results in 10, not 15.
  const setProductQuantity = (qty, productObj, cloneVariation, isOpenFun) => {
    const desiredQuantity = Math.max(1, Math.floor(Number(qty) || 1));
    const selectedVariation = cloneVariation?.selectedVariation || null;
    const variationId = selectedVariation?.id || null;
    const cart = [...cartProducts];
    const index = cart.findIndex(
      (item) => item.product_id === productObj?.id && item.variation_id === variationId
    );
    const availableStock = Number(
      selectedVariation?.quantity ?? productObj?.stock ?? productObj?.quantity
    );

    if (Number.isFinite(availableStock) && availableStock > 0 && desiredQuantity > availableStock) {
      ToastNotification("error", `Only ${availableStock} items in stock.`);
      return false;
    }

    const unitPrice = Number(selectedVariation?.price ?? productObj?.price ?? 0);
    if (index === -1) {
      cart.push({
        id: Date.now(),
        product: productObj,
        product_id: productObj?.id,
        variation: selectedVariation,
        variation_id: variationId,
        quantity: desiredQuantity,
        sub_total: desiredQuantity * unitPrice,
      });
    } else {
      cart[index] = {
        ...cart[index],
        product: productObj,
        variation: selectedVariation,
        quantity: desiredQuantity,
        sub_total: desiredQuantity * unitPrice,
      };
    }

    setCartProducts(cart);
    isOpenFun && isOpenFun(true);
    return true;
  };

  // ✅ Toggle Cart Drawer
  const cartToggleValue = (value) => {
    setCartToggle(value);
  };

  return (
    <CartContext.Provider
      value={{
        ...props,
        cartProducts,
        setCartProducts,
        cartTotal,
        setCartTotal,
        removeCart,
        clearCart,
        getTotal,
        handleIncDec,
        setProductQuantity,
        cartToggle,
        cartToggleValue,
        variationModal,
        setVariationModal,
      }}
    >
      {props.children}
    </CartContext.Provider>
  );
};

export default CartProvider;
