import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useContext } from "react";
import BrandContext from "@/context/brandContext";
import BrandLogo from "@/components/widgets/BrandLogo";

const LinkBox = ({ menu, onNavigate }) => {
  const { t } = useTranslation("common");
  const { brandState = [] } = useContext(BrandContext);
  const isBrandList = menu?.title?.toLowerCase() === "brand list";

  if (isBrandList) {
    return (
      <div className="brand-menu-panel">
        <h5 className="dropdown-header mb-3">{t(menu.title)}</h5>
        <div
          className="d-grid gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(92px, 1fr))" }}
        >
          {brandState.map((brand) => (
            <Link
              key={brand.id}
              href={`/collections?layout=collection_3_grid&brand=${brand.id}&title=${encodeURIComponent(brand.name)}`}
              onClick={onNavigate}
              className="d-flex align-items-center justify-content-center bg-white text-decoration-none"
              aria-label={`Shop ${brand.name}`}
              title={brand.name}
              style={{
                minHeight: 62,
                padding: "8px 12px",
                border: "1px solid #e8ece7",
                borderRadius: 10,
                boxShadow: "0 2px 10px rgba(30, 53, 40, 0.05)",
              }}
            >
              <span style={{ display: "block", width: 78, height: 38 }}>
                <BrandLogo brand={brand} width={78} height={38} />
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
            <Link onClick={onNavigate} className="dropdown-item" href={menu?.path.charAt(0) == "/" ? `collections?layout=collection_3_grid&${menu?.path.includes("category") ? "category=" + menu?.id + "&title=" +menu?.title : "brand=" + menu.id + "&title=" +menu?.title }` : `/${menu?.path}`}>
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
