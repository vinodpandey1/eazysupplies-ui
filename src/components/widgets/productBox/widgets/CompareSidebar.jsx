import CompareContext from "@/context/compareContext";
import Btn from "@/elements/buttons/Btn";
import { CompareAPI } from "@/utils/axiosUtils/API";
import { Href } from "@/utils/constants";
import useDelete from "@/utils/hooks/useDelete";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Media } from "reactstrap";
import ProductPrice from "./ProductPrice";

const CompareSidebar = () => {
  const { t } = useTranslation("common");
  const { compareState, setCompareState, refetch, setOpenCompareSidebar, openCompareSidebar } = useContext(CompareContext);
  const { data, mutate: compareMutate, isLoading: compareLoading } = useDelete(CompareAPI, `/compare`);
  useEffect(() => {
    if (data?.status == 200 || data?.status == 201) {
      refetch();
    }
  }, [compareLoading]);
  const router = useRouter();
  const removeFromCompare = (productObj) => {
    setCompareState((prevState) => prevState.filter((elem) => elem.id !== productObj?.id));
    // Put your logic here
  };

  return (
    <div className={`add_to_cart right ${openCompareSidebar ? "open-side" : ""}`}>
      <a href={Href} className="overlay"></a>
      <div className="cart-inner">
        <div className="cart_top">
          <h3>
            {t("Compare")} <span>{`(${compareState?.length})`}</span>
          </h3>
          <div className="close-cart">
            <a href={Href} onClick={() => setOpenCompareSidebar(false)}>
              <i className="ri-close-fill" />
            </a>
          </div>
        </div>

        <div className="cart_media">
          <ul className="cart_product">
            {compareState.length > 0 ? (
              compareState?.map((item, i) => (
                <li key={i}>
                  <Media>
                    <Link href={`/product/${item?.slug}`}>
                      <Image src={item?.product_thumbnail?.original_url} height={90} width={90} alt="product-image" />
                    </Link>
                    <Media body>
                      <a href={Href}>
                        <h4>{item?.name}</h4>
                      </a>
                      <ProductPrice product={item} showUnit={false} />
                    </Media>
                  </Media>
                  <div className="close-circle">
                    <a href={Href} onClick={() => removeFromCompare(item)}>
                      <i className="ri-delete-bin-line" />
                    </a>
                  </div>
                </li>
              ))
            ) : (
              <div className="empty-cart-box">
                <div className="empty-icon">
                  <i className="ri-refresh-line" />
                </div>
                <h5>{t("EmptyCompareDescription")}</h5>
              </div>
            )}
          </ul>
          {compareState.length > 0 && (
            <ul className="cart_total">
              <li>
                <div className="buttons">
                  <Btn onClick={() => router.push("/compare")} size="xl" className="btn-solid view-cart">
                    {t("Compare")}
                  </Btn>
                </div>
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompareSidebar;
