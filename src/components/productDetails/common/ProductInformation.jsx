import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import BrandBadge from "@/components/widgets/BrandBadge";

/**
 * ProductInformation Component
 * 
 * Displays essential product information in a structured format.
 * Shows specific product attributes: dimension, category, brand, tags, sku, skuType,
 * mfDate, expDate, tax, caseRate, and unitRate.
 * Conditionally renders fields only when valid data is available.
 * Handles null, undefined, and empty string values gracefully.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.productState - State object containing product data
 * @param {Object} props.productState.product - The product data object
 * @returns {JSX.Element} Product information section component
 * @Developer : Simran Samir
 */

// Helper function to check if a value is valid (not null, undefined, or empty string)
const isValidValue = (value) => {
  return value !== null && value !== undefined && value !== "";
};

// Helper function to display fallback text for invalid values
const displayValue = (value, fallback = "NA") => {
  return isValidValue(value) ? value : fallback;
};

// Helper function to format Indian Rupees
const formatINR = (amount) => {
  if (!isValidValue(amount)) return "NA";
  
  // Convert to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Check if it's a valid number
  if (isNaN(numAmount)) return "NA";
  
  // Format as Indian Rupees with ₹ symbol and Indian number formatting
  return `₹${numAmount.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  })}`;
};

const ProductInformation = ({ productState }) => {
  const { t } = useTranslation("common");
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Extract product data for cleaner access
  const product = productState?.product;

  // Get API base URL from environment variables
  const API_BASE_URL = process.env.API_PROD_URL || "https://api.eazysupplies.com/api";

  // Fetch categories, brands, taxes, and tags on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching categories, brands, taxes, and tags from:', API_BASE_URL);
        
        // Use Promise.all to fetch all data in parallel
        const [categoriesResponse, brandsResponse, taxesResponse, tagsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/categories`),
          fetch(`${API_BASE_URL}/brands`),
          fetch(`${API_BASE_URL}/tax`),
          fetch(`${API_BASE_URL}/tags`)
        ]);

        // Check if all responses are OK
        if (!categoriesResponse.ok) throw new Error(`Categories API failed: ${categoriesResponse.status}`);
        if (!brandsResponse.ok) throw new Error(`Brands API failed: ${brandsResponse.status}`);
        if (!taxesResponse.ok) throw new Error(`Tax API failed: ${taxesResponse.status}`);
        if (!tagsResponse.ok) throw new Error(`Tags API failed: ${tagsResponse.status}`);

        // Parse all responses
        const [categoriesData, brandsData, taxesData, tagsData] = await Promise.all([
          categoriesResponse.json(),
          brandsResponse.json(),
          taxesResponse.json(),
          tagsResponse.json()
        ]);

        console.log('API responses:', { categoriesData, brandsData, taxesData, tagsData });

        // Handle different response structures for categories
        let categoriesList = [];
        if (Array.isArray(categoriesData)) {
          categoriesList = categoriesData;
        } else if (categoriesData.data) {
          categoriesList = categoriesData.data;
        } else if (categoriesData.items) {
          categoriesList = categoriesData.items;
        }
        setCategories(categoriesList);

        // Handle different response structures for brands
        let brandsList = [];
        if (Array.isArray(brandsData)) {
          brandsList = brandsData;
        } else if (brandsData.data) {
          brandsList = brandsData.data;
        } else if (brandsData.items) {
          brandsList = brandsData.items;
        }
        setBrands(brandsList);

        // Handle different response structures for taxes
        let taxesList = [];
        if (Array.isArray(taxesData)) {
          taxesList = taxesData;
        } else if (taxesData.data) {
          taxesList = taxesData.data;
        } else if (taxesData.items) {
          taxesList = taxesData.items;
        }
        setTaxes(taxesList);

        // Handle different response structures for tags
        let tagsList = [];
        if (Array.isArray(tagsData)) {
          tagsList = tagsData;
        } else if (tagsData.data) {
          tagsList = tagsData.data;
        } else if (tagsData.items) {
          tagsList = tagsData.items;
        }
        setTags(tagsList);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE_URL]);

  // Helper function to get category name by ID
  const getCategoryName = (categoryId) => {
    if (!isValidValue(categoryId)) {
      return "NA";
    }
    
    // Convert to number if it's a string
    const id = typeof categoryId === 'string' ? parseInt(categoryId) : categoryId;
    
    const category = categories.find(cat => cat.id === id);
    return category ? category.name : "NA";
  };

  // Helper function to get brand name by ID
  const getBrand = (brandId) => {
    if (!isValidValue(brandId)) {
      return null;
    }
    
    // Convert to number if it's a string
    const id = typeof brandId === 'string' ? parseInt(brandId) : brandId;
    
    const brand = brands.find(br => br.id === id);
    return brand || null;
  };

  // Helper function to get tax name and value by ID
  const getTaxDetails = (taxId) => {
    if (!isValidValue(taxId)) {
      return { name: "NA", value: "NA" };
    }
    
    // Convert to number if it's a string
    const id = typeof taxId === 'string' ? parseInt(taxId) : taxId;
    
    const tax = taxes.find(tx => tx.id === id);
    return tax ? { name: tax.name, value: tax.value } : { name: "NA", value: "NA" };
  };

  // Helper function to get tag names by IDs (assuming tags field contains comma-separated IDs)
  const getTagNames = (tagIds) => {
    if (!isValidValue(tagIds)) {
      return "NA";
    }
    
    // If tagIds is a string of comma-separated IDs
    if (typeof tagIds === 'string') {
      const idArray = tagIds.split(',').map(id => id.trim());
      const tagNames = idArray.map(id => {
        const tagId = parseInt(id);
        const tag = tags.find(tg => tg.id === tagId);
        return tag ? tag.name : null;
      }).filter(name => name !== null);
      
      return tagNames.length > 0 ? tagNames.join(', ') : "NA";
    }
    
    // If tagIds is a single number
    if (typeof tagIds === 'number') {
      const tag = tags.find(tg => tg.id === tagIds);
      return tag ? tag.name : "NA";
    }
    
    return "NA";
  };

  // If no product data is available, show a fallback message
  if (!product) {
    return (
      <div className="bordered-box">
        <h4 className="sub-title">{t("ProductInformation")}</h4>
        <div className="no-data-message">
          {t("No product information available")}
        </div>
      </div>
    );
  }

  // Get tax details for the product
  const taxDetails = getTaxDetails(product?.tax);
  const productBrand = getBrand(product?.brandId);

  return (
    <div className="bordered-box">
      {/* Section Header */}
      <h4 className="sub-title">{t("ProductInformation")}</h4>

      {/* Show error state */}
      {error && (
        <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>
          Error loading data: {error}
        </div>
      )}

      {/* Show loading state */}
      {loading && (
        <div className="loading-message">
          {t("Loading product information...")}
        </div>
      )}

      {/* Product Details List - Only displaying specified fields */}
      {!loading && (
        <ul className="shipping-info">
          {/* Dimension - Always show with NA fallback */}
          <li>
            <span className="info-label">{t("Dimension")} : </span>
            <span className="info-value">{displayValue(product?.dimension)}</span>
          </li>

          {/* Category - Show name instead of ID */}
          <li>
            <span className="info-label">{t("Category")} : </span>
            <span className="info-value">
              {getCategoryName(product?.categoryId)}
            </span>
          </li>

          {/* Brand - Show name instead of ID */}
          <li>
            <span className="info-label">{t("Brand")} : </span>
            <span className="info-value">
              {productBrand ? <BrandBadge brand={productBrand} /> : "NA"}
            </span>
          </li>

          {/* Tags - Show tag names instead of IDs */}
          {/*<li>
            <span className="info-label">{t("Tags")} : </span>
            <span className="info-value">
              {getTagNames(product?.tags)}
            </span>
          </li>*/}

          {/* SKU - Always show with NA fallback */}
          <li>
            <span className="info-label">{t("SKU")} : </span>
            <span className="info-value">{displayValue(product?.sku)}</span>
          </li>
          
          {/* SKU Type - Always show with NA fallback Hidden
          <li>
            <span className="info-label">{t("SKU Type")} : </span>
            <span className="info-value">{displayValue(product?.skuType)}</span>
          </li>
        */}
          {/* Manufacturing Date - Always show with NA fallback */}
          {/*<li>
            <span className="info-label">{t("Mfd Date")} : </span>
            <span className="info-value">{displayValue(product?.mfDate.slice(0, -14))}</span>
          </li>*/}

          {/* Expiration Date - Always show with NA fallback */}
          {/*<li>
            <span className="info-label">{t("Exp Date")} : </span>
            <span className="info-value">{displayValue(product?.expDate.slice(0, -14))}</span>
          </li>*/}

          {/* Manufacturing Date - Always show with NA fallback */}
          <li style={{display:'none'}} >
            <span className="info-label">{t("Mfd Date")} : </span>
            <span className="info-value">
              {displayValue(
                product?.mfDate && typeof product.mfDate === 'string' && product.mfDate.length > 14 
                  ? product.mfDate.slice(0, -14) 
                  : product?.mfDate
              )}
            </span>{/* DEV: Fixed null slice error with safe type and length check */}
          </li>

          {/* Expiration Date - Always show with NA fallback */}
          <li style={{display:'none'}}>
            <span className="info-label">{t("Exp Date")} : </span>
            <span className="info-value">
              {displayValue(
                product?.expDate && typeof product.expDate === 'string' && product.expDate.length > 14 
                  ? product.expDate.slice(0, -14) 
                  : product?.expDate
              )}
            </span>{/* DEV: Fixed null slice error with safe type and length check */}
          </li>
          <li>
            <span className="info-label">{t("selflife")} : </span>
            <span className="info-value">{product?.selfLife} Month</span>
          </li>
          {/* Tax - Show tax name and value */}
          <li>
            <span className="info-label">{t("Tax")} : </span>
            <span className="info-value">
              {taxDetails.name !== "NA" ? `${taxDetails.name} (${taxDetails.value}%)` : "NA"}
            </span>
          </li>

          {/* Case Rate - Always show with NA fallback */}
          <li style={{display:'none'}}>
            <span className="info-label">{t("Case Rate")} : </span>
            <span className="info-value">{formatINR(product?.caseRate)}</span>
          </li>

          {/* Unit Rate - Always show with NA fallback */}
          <li>
            <span className="info-label">{t("Unit Rate")} : </span>
            <span className="info-value">{formatINR(product?.unitRate)}</span>
          </li>
        </ul>
      )}

      {/* Show message if ALL information is NA */}
      {!loading && !Object.keys(product).some(key => 
        ['dimension', 'categoryId', 'brandId', 'tags', 'sku', 'skuType', 'mfDate', 'expDate', 'tax', 'caseRate', 'unitRate']
          .includes(key) && isValidValue(product[key])
      ) && (
        <div className="limited-info-message">
          {t("No specific product information available")}
        </div>
      )}
    </div>
  );
};

export default ProductInformation;
