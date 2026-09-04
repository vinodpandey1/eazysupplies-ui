import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useContext, useEffect } from "react";
import BrandContext from "@/context/brandContext";
import BrandLogo from "@/components/widgets/BrandLogo";

const LinkBox = ({ menu, onNavigate }) => {
  const { t } = useTranslation("common");
  const { brandState = [], refetch } = useContext(BrandContext);
  const isBrandList = menu?.title?.toLowerCase() === "brand list";

  useEffect(() => {
    if (isBrandList && brandState.length === 0) {
      refetch?.();
    }
  }, [isBrandList, brandState.length, refetch]);

  if (isBrandList) {
    return (
      <div className="brand-menu-panel">
        <h5 className="dropdown-header mb-3">{t(menu.title)}</h5>
        <div
          className="d-grid"
          style={{ gridTemplateColumns: "minmax(160px, 1fr)" }}
        >
          {brandState.map((brand) => (
            <Link
              key={brand.id}
              href={`/collections?layout=collection_3_grid&brand=${brand.id}&title=${encodeURIComponent(brand.name)}`}
              onClick={onNavigate}
              className="d-flex align-items-center justify-content-start bg-white text-decoration-none"
              aria-label={`Shop ${brand.name}`}
              title={brand.name}
              style={{
                minHeight: 46,
                padding: "5px 8px",
                borderBottom: "1px solid #edf0ec",
              }}
            >
              <span style={{ display: "block", width: 72, height: 34 }}>
                <BrandLogo brand={brand} width={72} height={34} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {menu.link_type === "sub" ? (
        <h5 className="dropdown-header">{menu.title}</h5>
      ) : (
        <>
          {menu.link_type == "link" && menu.is_target_blank === 0 ? (
            <Link onClick={onNavigate} className="dropdown-item" href={menu?.path.charAt(0) == "/" ? `/collections?layout=collection_3_grid&${menu?.path.includes("category") ? "category=" + menu?.id + "&title=" + menu?.title : "brand=" + menu.id + "&title=" + menu?.title}` : `/${menu?.path}`}>
              {menu.title}
              {menu.badge_text && <label className={`menu-label ${menu?.badge_color ? menu?.badge_color : ''}`}>{menu?.badge_text}</label>}
            </Link>
          ) : (
            <Link onClick={onNavigate} href={menu?.path} className="dropdown-item" target="_blank">
              {menu?.title}
              {menu?.badge_text && <label className={`menu-label ${menu?.badge_color ? menu?.badge_color : ''}`}>{menu?.badge_text}</label>}
            </Link>
          )}
        </>
      )}

      {menu.child && (
        <ul>
          {menu?.child?.map((link, i) => (
            <LinkBox menu={link} onNavigate={onNavigate} key={i} />
          ))}
        </ul>
      )}
    </>
  );
};

export default LinkBox;
