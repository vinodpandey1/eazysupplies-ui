import RatingBox from "@/components/collection/collectionSidebar/RatingBox";
import NoDataFound from "@/components/widgets/NoDataFound";
import CompareContext from "@/context/compareContext";
import { compareSlider } from "@/data/sliderSetting/SliderSetting";
import Btn from "@/elements/buttons/Btn";
import { CompareAPI } from "@/utils/axiosUtils/API";
import { ModifyString } from "@/utils/customFunctions/ModifyString";
import useDelete from "@/utils/hooks/useDelete";
import Image from "next/image";
import Link from "next/link";
import { useContext, useEffect } from "react";
import { RiCloseLine } from "react-icons/ri";
import Slider from "react-slick";
import CompareAction from "./CompareAction";
import CompareWrapper from "./CompareWrapper";
import ProductPrice from "@/components/widgets/productBox/widgets/ProductPrice";
import { getProductPricing } from "@/utils/pricing/productPricing";

const CompareData = () => {
  const { setCompareState, compareState, refetch } = useContext(CompareContext);
  const { data, mutate: compareMutate, isLoading: compareLoading } = useDelete(CompareAPI, `/compare`);
  useEffect(() => {
    if (data?.status == 200 || data?.status == 201) {
      refetch();
    }
  }, [compareLoading]);
  const removeFromCompare = (productObj) => {
    // Put your logic here
  };
  let settings = compareSlider(compareState.length);

  return (
    <>
      {compareState?.length > 0 ? (
        <div className="slide-4 no-arrow compare-box">
          <Slider {...settings}>
            {compareState?.map((product, i) => (
              <div className="compare-part" key={i}>
                <Btn color="primary" onClick={() => removeFromCompare(product)} className="close-btn ">
                  <RiCloseLine />
                </Btn>
                <div className="img-section">
                  <div>{product.product_thumbnail.original_url && <Image src={product.product_thumbnail ? product.product_thumbnail.original_url : placeHolderImage} className="img-fluid" alt={product.name} height={156} width={156} />}</div>
                  <Link href={`/product/${product?.slug}`}>
                    <h5 className="text-title">{product?.name}</h5>
                  </Link>
                </div>
                <CompareWrapper data={{ title: "Discount", value: getProductPricing(product).hasOffer ? `${getProductPricing(product).discountPercentage}%` : "-" }} />
                <CompareWrapper data={{ title: "Price" }}>
                  <ProductPrice product={product} showUnit={false} className="compare-price" />
                </CompareWrapper>
                <CompareWrapper data={{ title: "Availability", value: ModifyString(product?.stock_status) }} />
                <CompareWrapper data={{ title: "Rating" }}>
                  <div className="compare-rating">
                    <RatingBox totalRating={product?.rating_count || 0} />
                    <span className="text-content rating-text">{`(${product?.rating_count?.toFixed(2) || 0} Rating)`}</span>
                  </div>
                </CompareWrapper>
                <CompareWrapper data={{ title: "Weight", value: product?.weight ? product?.weight : "-" }} />
                <CompareAction product={product} compareMutate={compareMutate} />
              </div>
            ))}
          </Slider>
        </div>
      ) : (
        <NoDataFound customClass="no-data-added" imageUrl={"/assets/images/svg/empty-items.svg"} title="NoItemsAdded" description="NoCompareItemsAddedDescription" height="230" width="270" />
      )}
    </>
  );
};

export default CompareData;
