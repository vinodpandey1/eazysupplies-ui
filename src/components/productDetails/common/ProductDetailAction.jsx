import CartContext from "@/context/cartContext";
import SettingContext from "@/context/settingContext";
import Btn from "@/elements/buttons/Btn";
import React, { useContext, useEffect } from "react";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";
import { Input, InputGroup } from "reactstrap";
import ProductWholesale from "./ProductWholesale";
import { getProductPricing } from "@/utils/pricing/productPricing";

const ProductDetailAction = ({ productState, setProductState, extraOption, isDisplay = true }) => {
  const { cartProducts } = useContext(CartContext);
  const { convertCurrency } = useContext(SettingContext);
  const productId = productState?.product?.id;
  const variationId = productState?.selectedVariation?.id || null;
  const cartItem = cartProducts?.find(
    (item) => item.product_id === productId && item.variation_id === variationId
  );
  const stockQuantity = Number(
    productState?.selectedVariation?.quantity ?? productState?.product?.quantity
  );

  const calculateTotal = (state, quantity) => {
    const basePrice = getProductPricing(
      state?.product,
      state?.selectedVariation,
    ).sellingPrice;
    const wholesale = state?.product?.wholesales?.find(
      (value) => Number(value?.min_qty) <= quantity && Number(value?.max_qty) >= quantity
    );

    if (wholesale && state?.product?.wholesale_price_type === "fixed") {
      return quantity * Number(wholesale.value || 0);
    }
    if (wholesale && state?.product?.wholesale_price_type === "percentage") {
      return quantity * basePrice * (1 - Number(wholesale.value || 0) / 100);
    }
    return quantity * basePrice;
  };

  const setQuantity = (value) => {
    let nextQuantity = Math.max(1, Math.floor(Number(value) || 1));
    if (Number.isFinite(stockQuantity) && stockQuantity > 0) {
      nextQuantity = Math.min(nextQuantity, stockQuantity);
    }

    setProductState((prev) => {
      const nextState = {
        ...prev,
        productQty: nextQuantity,
        totalPrice: calculateTotal(prev, nextQuantity),
      };
      if (prev?.selectedVariation) {
        nextState.selectedVariation = {
          ...prev.selectedVariation,
          stock_status: Number(prev.selectedVariation.quantity) < nextQuantity ? "out_of_stock" : "in_stock",
        };
      } else if (prev?.product) {
        nextState.product = {
          ...prev.product,
          stock_status: Number(prev.product.quantity) < nextQuantity ? "out_of_stock" : "in_stock",
        };
      }
      return nextState;
    });
  };

  useEffect(() => {
    if (cartItem?.quantity) {
      setQuantity(cartItem.quantity);
    }
  }, [productId, variationId, cartItem?.quantity]);

  useEffect(() => {
    if (productId) {
      setProductState((prev) => ({
        ...prev,
        totalPrice: calculateTotal(prev, prev.productQty || 1),
      }));
    }
  }, [productId, variationId]);
  return (
    <>
      {productState?.product?.wholesales?.length ? (
        <>
          <ProductWholesale productState={productState} />
          <h4>
            {"Total Price:"} <span className="theme-color">{convertCurrency(productState?.totalPrice)}</span>
          </h4>
        </>
      ) : null}

      {isDisplay && (
        <div>
          <div className="qty-section" style={{display:"block"}}>
            <div className="cart_qty qty-box product-qty">
              <InputGroup>
                <span className="input-group-prepend">
                  <Btn className=" quantity-left-minus" id="quantity-left-minus18" type="button" onClick={() => setQuantity(productState?.productQty - 1)}>
                    <RiArrowLeftSLine />
                  </Btn>
                </span>
                <Input
                  className="input-number"
                  type="number"
                  min="1"
                  max={Number.isFinite(stockQuantity) && stockQuantity > 0 ? stockQuantity : undefined}
                  value={productState?.productQty || 1}
                  onChange={(event) => setQuantity(event.target.value)}
                />
                <span className="input-group-prepend">
                  <Btn type="button" className=" quantity-left-plus" id="quantity-left-plus18" onClick={() => setQuantity(productState?.productQty + 1)}>
                    <RiArrowRightSLine />
                  </Btn>
                </span>
              </InputGroup>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductDetailAction;
