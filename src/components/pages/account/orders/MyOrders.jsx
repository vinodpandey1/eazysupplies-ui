"use client"
import NoDataFound from "@/components/widgets/NoDataFound";
import Pagination from "@/components/widgets/Pagination";
import SettingContext from "@/context/settingContext";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { RiEyeLine } from "react-icons/ri";
import { Card, CardBody, Table } from "reactstrap";
import request from "@/utils/axiosUtils";
import { BASE_URL } from "@/utils/axiosUtils/API";
import { showMonthWiseDateAndTime } from "@/utils/customFunctions/DateFormat";
import { useTranslation } from "react-i18next";
import AccountHeading from "../common/AccountHeading";
import Loader from "@/layout/loader";
import Capitalize from "@/utils/customFunctions/Capitalize";
import { useRouter } from "next/navigation";

/**
 * MyOrders Component
 * 
 * Displays a paginated list of orders for the authenticated user in a table format.
 * Shows order ID, status, total price, order date, and provides view details action.
 * Handles loading states, errors, empty states, and pagination for large datasets.
 * 
 * @param {Object} props - Component props
 * @param {string} props.userId - The ID of the user to fetch orders for
 * @returns {JSX.Element} Orders list table component with pagination
 * 
 * @developer Simran Samir
 */
const MyOrders = ({ userId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);
  const { t } = useTranslation("common");
  const router = useRouter();
  const { convertCurrency } = useContext(SettingContext);

  /**
   * Fetches orders for the current user from the API with pagination
   * Uses API URL from next.config.mjs
   */
  const fetchOrders = async (page = 1, limit = itemsPerPage) => {
    // Skip if no user ID provided
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = `${BASE_URL}/api/orders?page=${page}&paginate=${limit}`;
      
      
      console.log('Fetching orders from:', apiUrl); // For debugging
      
      const response = await request({ 
        url: apiUrl, 
        withCredentials: true 
      });
      
      // Handle different possible response structures from API
      let ordersData = [];
      let totalCount = 0;
      
      if (Array.isArray(response?.data)) {
        ordersData = response.data;
        totalCount = response.data.length;
      } else if (Array.isArray(response?.data?.data)) {
        ordersData = response.data.data;
        totalCount = response.data.total || response.data.data.length;
      } else if (Array.isArray(response?.data?.items)) {
        ordersData = response.data.items;
        totalCount = response.data.total || response.data.items.length;
      } else if (Array.isArray(response?.data?.orders)) {
        ordersData = response.data.orders;
        totalCount = response.data.total || response.data.orders.length;
      } else if (response?.data?.orders && Array.isArray(response.data.orders)) {
        // Handle nested orders array with pagination info
        ordersData = response.data.orders;
        totalCount = response.data.total || response.data.count || response.data.orders.length;
      } else if (Array.isArray(response?.orders)) {
        ordersData = response.orders;
        totalCount = response.total || response.orders.length;
      }
      
      setOrders(ordersData);
      setTotalOrders(totalCount);
      setCurrentPage(page);
      
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders when component mounts or userId changes
  useEffect(() => {
    if (userId) {
      fetchOrders(currentPage, itemsPerPage);
    }
  }, [userId]);

  /**
   * Handles page change for pagination
   * @param {number} page - The page number to navigate to
   */
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchOrders(page, itemsPerPage);
  };

  /**
   * Handles items per page change
   * @param {Event} e - The change event from select element
   */
  const handleItemsPerPageChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setItemsPerPage(newLimit);
    setCurrentPage(1);
    fetchOrders(1, newLimit);
  };

  /**
   * Handles row click to navigate to order details page
   * @param {string|number} id - Order ID to view details for
   */
  const handleClick = (id) => {
    if (id) {
      router.push("/account/order/details?orderId=" + id);
    }
  }

  /**
   * Calculates the total price for an order
   * Tries multiple possible price fields for compatibility
   * Falls back to calculating from items if individual prices are available
   * 
   * @param {Object} order - The order object
   * @returns {number} Total order price
   */
  const calculatePrice = (order) => {
  // If backend already provides final total, use it directly
  if (order?.totalAmount) return order.totalAmount;
  if (order?.totalPrice) return order.totalPrice;
  if (order?.amount) return order.amount;
  if (order?.grandTotal) return order.grandTotal;

  // If items exist, sum their line totals
  if (order?.items && Array.isArray(order.items)) {
    return order.items.reduce((sum, item) => {
      // item.price is ALREADY subtotal (unit * qty)
      const lineTotal = Number(item?.price) || 0;
      return sum + lineTotal;
    }, 0);
  }

  return 0;
};

  /**
   * Extracts order status from order object with fallback
   * @param {Object} order - The order object
   * @returns {string} Order status
   */
  const getOrderStatus = (order) => {
    return order?.status || order?.orderStatus || 'pending';
  }

  /**
   * Extracts order date from order object with fallback to current date
   * @param {Object} order - The order object
   * @returns {string} Order date in ISO format
   */
  const getOrderDate = (order) => {
    return order?.createdAt || order?.orderDate || order?.createdDate || new Date().toISOString();
  }

  // Calculate pagination information
  const totalPages = Math.ceil(totalOrders / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalOrders);

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="box-loader">
        <Loader classes={"blur-bg"} />
      </div>
    );
  }

  return (
    <Card className="dashboard-table mt-0">
      <CardBody className="p-0">
        <AccountHeading title="MyOrders" classes={"top-sec"} />
        
        {/* Error Display */}
        {error && (
          <div className="alert alert-danger m-3">
            <strong>{t("Error")}:</strong> {error}
            <button 
              className="btn btn-sm btn-outline-secondary ms-2" 
              onClick={() => fetchOrders(currentPage, itemsPerPage)}
            >
              {t("Retry")}
            </button>
          </div>
        )}
        
        {/* Orders Table */}
        {orders?.length > 0 ? (
          <>
            {/* Pagination Controls - Top */}
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
              <div className="d-flex align-items-center">
                <span className="me-2">{t("Show")}:</span>
                <select 
                  value={itemsPerPage} 
                  onChange={handleItemsPerPageChange}
                  className="form-select form-select-sm w-auto"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <span className="ms-2">{t("entries")}</span>
              </div>
              
              <div className="text-muted">
                {t("Showing")} {startItem} {t("to")} {endItem} {t("of")} {totalOrders} {t("orders")}
              </div>
            </div>

            <div className="total-box mt-0">
              <div className="wallet-table mt-0">
                <div className="table-responsive">
                  <Table className="table cart-table order-table">
                    <thead>
                      <tr className="table-head">
                        <th>{t("OrderID")}</th>
                        <th>{t("Status")}</th>
                        <th>{t("Price")}</th>
                        <th>{t("Date")}</th>
                        <th>{t("View")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order, index) => (
                        <tr 
                          key={order?.id || order?.orderId || index}
                          className="cursor-pointer"
                          onClick={() => handleClick(order?.id || order?.orderId)}
                          style={{ cursor: "pointer" }}
                        >
                          {/* Order ID */}
                          <td>
                            <span className="fw-bolder">
                              #{order?.id || order?.orderId || `ORD-${index + 1}`}
                            </span>
                          </td>
                          
                          {/* Order Status with colored badge */}
                          <td>
                            <div className={`${
                              getOrderStatus(order)?.toLowerCase() === "pending" ? "badge bg-warning" : 
                              getOrderStatus(order)?.toLowerCase() === "completed" ? "badge bg-success" : 
                              getOrderStatus(order)?.toLowerCase() === "delivered" ? "badge bg-success" :
                              getOrderStatus(order)?.toLowerCase() === "shipped" ? "badge bg-info" :
                              getOrderStatus(order)?.toLowerCase() === "cancelled" ? "badge bg-danger" :
                              "badge bg-secondary custom-badge rounded-0"
                            } custom-badge rounded-0`}>
                              <span>{Capitalize(getOrderStatus(order))}</span>
                            </div>
                          </td>
                          
                          {/* Order Total Price */}
                          <td>
                            {convertCurrency ? 
                              convertCurrency(calculatePrice(order)) : 
                              `₹${calculatePrice(order).toFixed(2)}`
                            }
                          </td>
                          
                          {/* Order Date */}
                          <td>
                            {showMonthWiseDateAndTime(getOrderDate(order))}
                          </td>
                          
                          {/* View Details Link */}
                          <td>
                            <Link 
                              href={`/account/order/details?orderId=${order?.id || order?.orderId}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-decoration-none"
                              title={t("ViewOrderDetails")}
                            >
                              <RiEyeLine size={18} className="text-primary" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            </div>

            {/* Pagination Controls - Bottom */}
            <div className="d-flex justify-content-between align-items-center p-3 border-top">
              <div className="text-muted">
                {t("Showing")} {startItem} {t("to")} {endItem} {t("of")} {totalOrders} {t("orders")}
              </div>
              
              <div className="product-pagination">
                <div className="theme-pagination-block">
                  <nav>
                    <Pagination 
                      current_page={currentPage} 
                      total={totalOrders} 
                      per_page={itemsPerPage} 
                      setPage={handlePageChange}
                    />
                  </nav>
                </div>
              </div>
            </div>
          </>
        ) : (
          // No Orders Found State
          <NoDataFound 
            customClass="no-data-added" 
            imageUrl={`/assets/svg/empty-items.svg`} 
            title="NoOrdersFound" 
            description="NoOrdersHaveBeenMadeYet" 
            height="300" 
            width="300" 
          />
        )}
      </CardBody>
    </Card>
  );
};

export default MyOrders;
