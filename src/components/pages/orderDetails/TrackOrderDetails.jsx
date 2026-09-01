"use client";

/**
 * TrackOrderDetails Component
 * 
 * Displays detailed tracking information for a specific order including
 * order items, pricing breakdown, tax calculations, and consumer details.
 * Provides comprehensive order summary with real-time status updates.
 * 
 * Features:
 * - Order header with tracking information
 * - Product listing with detailed breakdown
 * - Automatic tax and discount calculations
 * - Payment and shipping status display
 * - Consumer information section
 * - Loading state management
 * - Responsive design with collapsible product details
 * 
 * @component
 * @param {Object} props - Component properties
 * @param {Object} props.data - Order data object
 * @param {boolean} props.isLoading - Loading state flag
 * @param {string} props.orderNumber - Order identifier
 * @param {Array} props.taxData - Tax configuration data
 * 
 * @example
 * return (
 *   <TrackOrderDetails 
 *     data={orderData}
 *     isLoading={false}
 *     orderNumber="12345"
 *     taxData={taxRates}
 *   />
 * )
 * 
 * @returns {JSX.Element} Order tracking interface with detailed breakdown
 * 
 * @developer : Simran Samir
 */

import OptimizedImage from "@/components/widgets/OptimizedImage";
import Loader from "@/layout/loader";
import ConsumerDetails from "./common/ConsumerDetails";
import StatusDetail from "./common/StatusDetails";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { calculateOrderTotals } from "@/utils/pricing/orderTotals";

const TrackOrderDetails = ({ data, isLoading, orderNumber, taxData, onPaymentRecorded }) => {
  const searchParams = useSearchParams();
  const showLegacyView = searchParams.get("orderView") === "legacy";
  const invoice = useMemo(() => calculateOrderTotals(data, taxData), [data, taxData]);

  // Show loader while data is loading
  if (isLoading) return <Loader />;

  return (
    <div className={`track-order-container ${showLegacyView ? "is-legacy-order-view" : "is-consolidated-order-view"}`}>
      {/* Header Section with Order Summary */}
      <div className="order-header">
        <div className="header-content">
          <div className="header-icon"> 
            <i className="ri-shopping-cart-2-line"></i> 
          </div>
          <div>
            <h1 className="order-title">Order #{data?.id || orderNumber}</h1>
            <p className="order-subtitle">Track your order details and status</p>
          </div>
        </div>
        <StatusDetail data={data} />
      </div>

      {/* Products Section - Lists all order items */}
      <div className="products-section">
        <div className="section-title-bar">
          <h2 className="section-title">
            <i className="ri-shopping-bag-3-line me-2"></i>
            Products
            <span className="item-count">({invoice.rows.length})</span>
          </h2>
        </div>

        {invoice.rows.length > 0 ? (
          <div className="products-list">
            {invoice.rows.map((row) => {
              const el = row.item;
              const product = el?.product || {};

              return (
                <div key={row.id} className="product-item">
                  {/* Product Main Information */}
                  <div className="product-main">
                    <div className="product-image">
                      {product?.image ? (
                        <OptimizedImage src={product.image} alt={row.name} />
                      ) : (
                        <div className="image-placeholder">
                          <i className="ri-image-line"></i>
                        </div>
                      )}
                    </div>
                    <div className="product-info">
                      <h3 className="product-name">{row.name}</h3>
                      <div className="product-meta">
                        <span className="meta-item">
                          <i className="ri-price-tag-3-line"></i>
                          ₹{row.unitPrice.toFixed(2)} × {row.quantity}
                        </span>
                        <span className="meta-item">
                          <i className="ri-barcode-line"></i>
                          SKU: {product?.sku || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="product-total">
                      <span className="total-label">Item Total</span>
                      <span className="total-amount">₹{row.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Product Details - Collapsible Detailed Breakdown */}
                  <div className="product-details">
                    <div className="details-grid">
                      {/* Pricing Details */}
                      <div className="detail-group">
                        <label className="detail-label">Pricing</label>
                        <div className="detail-items">
                          <div className="detail-item">
                            <span>Unit Price</span>
                            <span>₹{row.unitPrice.toFixed(2)}</span>
                          </div>
                          <div className="detail-item">
                            <span>Quantity</span>
                            <span>{row.quantity}</span>
                          </div>
                          <div className="detail-item">
                            <span>Subtotal</span>
                            <span>₹{row.netSubtotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Discounts & Tax Calculations */}
                      <div className="detail-group">
                        <label className="detail-label">Discounts & Tax</label>
                        <div className="detail-items">
                          <div className="detail-item">
                            <span>Discount ({row.discountPercentage.toFixed(2)}%)</span>
                            <span className="text-success">-₹{row.discountAmount.toFixed(2)}</span>
                          </div>
                          <div className="detail-item">
                            <span>Tax ({row.taxPercentage.toFixed(2)}%)</span>
                            <span className="text-primary">+₹{row.taxAmount.toFixed(2)}</span>
                          </div>
                          <div className="detail-item total">
                            <span>Total</span>
                            <span className="total-value">₹{row.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Order Status Information */}
                      <div className="detail-group">
                        <label className="detail-label">Status</label>
                        <div className="status-info">
                          <div className="status-item">
                            <span className="status-label">
                              <i className="ri-bank-card-line"></i>
                              Payment
                            </span>
                            <span className={`status-value ${data?.payment?.status?.toLowerCase()}`}>
                              {data?.payment?.status || "Pending"}
                            </span>
                          </div>
                          <div className="status-item">
                            <span className="status-label">
                              <i className="ri-truck-line"></i>
                              Shipping
                            </span>
                            <span className={`status-value ${data?.shipping?.status?.toLowerCase()}`}>
                              {data?.shipping?.status || "Pending"}
                            </span>
                          </div>
                          <div className="status-item">
                            <span className="status-label">
                              <i className="ri-calendar-line"></i>
                              Ordered
                            </span>
                            <span className="status-value">
                              {el?.createdAt ? new Date(el.createdAt).toLocaleDateString() : "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State for No Products */
          <div className="empty-state">
            <div className="empty-icon">
              <i className="ri-inbox-line"></i>
            </div>
            <h3>No products in this order</h3>
            <p>There are no items associated with this order.</p>
          </div>
        )}
      </div>

      {/* Consumer Details Section */}
      <div className="consumer-section">
        <ConsumerDetails data={data} taxData={taxData} onPaymentRecorded={onPaymentRecorded} />
      </div>
    </div>
  );
};

export default TrackOrderDetails;
