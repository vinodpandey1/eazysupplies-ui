/**
 * ConsumerDetails Component
 * 
 * Displays comprehensive consumer information, order summary, and payment processing interface.
 * Integrates billing/shipping details with real-time payment status management and processing.
 * Supports multiple payment methods and dynamic status visualization.
 * 
 * Features:
 * - Consumer profile and address management
 * - Dynamic order summary with tax calculations
 * - Payment method selection and processing
 * - Real-time payment status tracking (Pending/Success/Failed)
 * - Country/state data integration for address formatting
 * - Responsive design with modern UI components
 * - Secure payment processing integration
 * - Multi-language support via i18n
 * 
 * @component
 * @param {Object} props - Component properties
 * @param {Object} props.data - Order data containing consumer, payment, and shipping information
 * @param {Array} props.taxData - Tax configuration data for calculations
 * 
 * @example
 * return (
 *   <ConsumerDetails 
 *     data={orderData}
 *     taxData={taxRates}
 *   />
 * )
 * 
 * @returns {JSX.Element} Consumer information panel with payment processing interface
 * 
 * @developer : Simran Samir
 */

import SettingContext from "@/context/settingContext";
import request from "@/utils/axiosUtils";
import { CountryAPI, BASE_URL } from "@/utils/axiosUtils/API";
import useFetchQuery from "@/utils/hooks/useFetchQuery"; 
import Link from "next/link";
import { PaymentMethod } from "@/utils/constants";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardBody, Col, Input, Label, Row } from "reactstrap";
import axios from "axios";

const ConsumerDetails = ({ data, taxData }) => {
  const { convertCurrency } = useContext(SettingContext);
  const { t } = useTranslation("common");
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { data: countryData } = useFetchQuery([CountryAPI], () => request({ url: CountryAPI }, router), {
    refetchOnWindowFocus: false,
    select: (res) => res.data.map((country) => ({ id: country.id, name: country.name, state: country.state })),
  });

  // Check payment status
  const paymentStatus = data?.payment?.status || data?.payment_status;
  const isPaymentPending = paymentStatus === "PENDING";
  const isPaymentSuccess = paymentStatus === "SUCCESS";
  const isPaymentFailed = paymentStatus === "FAILED";
  
  // Show payment options ONLY when: Order is APPROVED AND Payment is PENDING
  const shouldShowPayment = data?.status === "APPROVED" && isPaymentPending;

  const getCountryName = (countryId) => {
    const country = countryData?.find((country) => country.id === countryId);
    if (country) {
      return country.name;
    }
    return "";
  };

  const getStateName = (stateId, countryId) => {
    const state = countryData?.find((country) => country.id === countryId)?.state.find((state) => state.id === stateId);
    if (state) {
      return state.name;
    }
    return "";
  };

  function getItemsTotalPrice() {
    let totalTax = 0, total = 0;

    data.items.forEach(el => {
      let jsonData = el.product.jsonData;
      let _dd = [];
      if (!jsonData) {
        _dd = [{ discountPercentage: 0, discountAmount: 0, taxId: 0, taxAmount: 0, taxpercent: 0, totalPrice: 0 }];
        let _taxId = Number(el.product?.tax);
        let _taxpercent = taxData.filter((elm) => Number(elm.id) == _taxId);
        _taxpercent = _taxpercent[0]?.value;
        let _taxAmt = Number(el.product?.price) * Number(_taxpercent) / 100;

        totalTax = Number(el.quantity) > 0 ? totalTax + _taxAmt * Number(el.quantity) : totalTax;
        total = Number(el.quantity) > 0 ? total + (Number(el.product?.price - _dd[0].discountAmount) + _taxAmt) * Number(el.quantity) : total;
      }
      else {
        _dd = jsonData.filter(el => el.orderId == data.id);
        if (_dd.length > 0) {
          let _taxId = Number(el.product?.tax);
          let _taxpercent = taxData.filter((elm) => Number(elm.id) == _taxId);
          _taxpercent = _taxpercent[0]?.value;
          let _taxAmt = Number(_dd[0].sellingPrice) * Number(_taxpercent) / 100;

          totalTax = Number(el.quantity) > 0 ? totalTax + _taxAmt * Number(el.quantity) : totalTax;
          total = Number(el.quantity) > 0 ? total + (Number(el.product?.price - _dd[0].discountAmount) + _taxAmt) * Number(el.quantity) : total;
        }
      }
    });
    return { totalTax, total }
  }

  async function proceedPayment() {
    if (!shouldShowPayment) return;
    
    setLoading(true);
    const amount = getItemsTotalPrice()?.total;
    const reasonForCollection = " Order Id #" + data.id;
    
    if (paymentMethod == "") {
      alert("Please Select Payment Method");
      setLoading(false);
      return;
    }
    
    var _data = JSON.stringify({
      "orderId": data.id,
      "amount": amount,
      "method": [paymentMethod],
      "reasonForCollection": reasonForCollection
    });
    
    var config = {
      method: 'post',
      url: BASE_URL +'/api/payments/benePay/getUrl',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
      data: _data
    };

    axios(config)
      .then(function (response) {
        const payurl = response.data?.realTimePaymentData?.message;
        if(payurl !== "" && payurl?.startsWith("https")) {
          router.push(payurl);
        } else {
          alert("Thanks for Offline payment , please contact Support Staff for further order processing");
          router.push('/account/order');
        }
      })
      .catch(function (error) {
        console.log(error);
        alert("Payment processing failed. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  // Status Chip Component using CSS classes
  const StatusChip = ({ status, text }) => {
    return (
      <span className={`status-chip-modern ${status}`}>
        <i className={`ri-${status === "success" ? "checkbox-circle-fill" : status === "warning" ? "time-line" : status === "danger" ? "close-circle-fill" : "information-line"}`}></i>
        <span>{text}</span>
      </span>
    );
  };

  // Map payment method IDs to icons
  const getPaymentIconClass = (methodId) => {
    const iconMap = {
      'credit_card': 'credit-card',
      'debit_card': 'credit-card',
      'upi': 'upi',
      'wallet': 'wallet',
      'net_banking': 'net-banking',
      'cod': 'cod',
      'cc': 'credit-card',
      'dc': 'credit-card'
    };
    return iconMap[methodId] || 'other';
  };

  return (
    <>
      <div className="summary-details my-3">
        <Row className="g-4 align-items-stretch">
          {/* Consumer Details Card - Removed h-100 to make size content-dependent */}
          <Col xxl={6} lg={12} md={6}>
            <div className="glass-card">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h3 className="order-title mb-1 d-flex align-items-center gap-2">
                      <div className="icon-container-modern icon-container-blue">
                        <i className="ri-user-3-line"></i>
                      </div>
                      <span className="gradient-text">Consumer Details</span>
                    </h3>
                    <p className="text-muted small mb-0">Order information and shipping details</p>
                  </div>
                  <StatusChip 
                    status={data?.status === "APPROVED" ? "success" : "warning"} 
                    text={data?.status || "N/A"}
                  />
                </div>
                
                {/* Address Cards */}
                <div>
                  {data?.billing_address && (
                    <div className="info-card-modern mb-3">
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <div className="icon-container-modern icon-container-blue">
                          <i className="ri-map-pin-line"></i>
                        </div>
                        <div>
                          <h6 className="mb-0">Billing Address</h6>
                          <p className="text-muted small mb-0">Primary contact address</p>
                        </div>
                      </div>
                      <div className="pl-5">
                        <p className="mb-1">{data.billing_address.street}</p>
                        <p className="text-muted small mb-2">
                          {data.billing_address.city}, {getStateName(data.billing_address.state_id, data.billing_address.country_id)} - {data.billing_address.pincode}
                        </p>
                        <div className="d-flex align-items-center gap-2 text-muted small">
                          <i className="ri-phone-line"></i>
                          <span>+{data.billing_address.country_code} {data.billing_address.phone}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {data?.shipping && (
                    <div className="info-card-modern info-card-modern-shipping mb-3">
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <div className="icon-container-modern icon-container-green">
                          <i className="ri-truck-line"></i>
                        </div>
                        <div>
                          <h6 className="mb-0">Shipping Address</h6>
                          <p className="text-muted small mb-0">Delivery location</p>
                        </div>
                      </div>
                      <div className="pl-5">
                        <p className="mb-1">{data?.shipping?.address}</p>
                        <p className="text-muted small mb-2">
                          {data?.shipping?.city}, {data?.shipping?.country} - {data?.shipping?.postalCode}
                        </p>
                        <div className="d-flex align-items-center gap-2 text-muted small">
                          <i className="ri-phone-line"></i>
                          <span>{data?.user?.countryCode} {data?.user?.phone}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Status Cards */}
                <Row className="g-3 mt-3">
                  <Col md={6}>
                    <div className="status-badge-modern">
                      <div className="d-flex align-items-center gap-3">
                        <div className="icon-container-modern icon-container-purple">
                          <i className="ri-bank-card-line"></i>
                        </div>
                        <div>
                          <p className="text-muted small mb-1">Payment Mode</p>
                          <p className="mb-0">
                            {data?.payment_method?.toUpperCase() || "Not Selected"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Col>
                  
                  <Col md={6}>
                    <div className="status-badge-modern">
                      <div className="d-flex align-items-center gap-3">
                        <div className="icon-container-modern icon-container-blue">
                          <i className="ri-wallet-3-line"></i>
                        </div>
                        <div>
                          <p className="text-muted small mb-1">Payment Status</p>
                          <div className="mt-1">
                            {paymentStatus ? (
                              <StatusChip 
                                status={
                                  isPaymentSuccess ? "success" : 
                                  isPaymentFailed ? "danger" : 
                                  isPaymentPending ? "warning" : "info"
                                } 
                                text={paymentStatus}
                              />
                            ) : (
                              <span className="text-muted">No payment</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                    </div>
                  </Col>
                </Row>
                
                {/* Delivery Slot */}
                {!data?.is_digital_only && data?.delivery_description && (
                  <div className="info-card-modern info-card-modern-delivery mt-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="icon-container-modern icon-container-orange">
                        <i className="ri-calendar-line"></i>
                      </div>
                      <div>
                        <h6 className="mb-0">Delivery Slot</h6>
                        <p className="mb-0">{data.delivery_description}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Col>

          {/* Order Summary & Payment Card - Keep h-100 */}
          <Col xxl={6} lg={12} md={6}>
            <div className="glass-card glass-card-success h-100">
              <div className="card-body p-4 h-100 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h3 className="order-title mb-1 d-flex align-items-center gap-2">
                      <div className="icon-container-modern icon-container-green">
                        <i className="ri-file-list-3-line"></i>
                      </div>
                      <span className="gradient-text-success">Order Summary</span>
                    </h3>
                    <p className="text-muted small mb-0">Complete payment details and total amount</p>
                  </div>
                  <div className="order-id-badge-modern">
                     <span>Order # {data.id}</span>
                     <span><a className="link-primary small mb-0" href={`${process.env.API_PROD_URL}/invoice/${data.id}/pdf`} target="_blank">Invoice</a></span>
                  </div>
                </div>

                {/* Summary Section */}
                <div className="summary-section-modern mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span>Tax</span>
                    <span className="fw-bold">
                      ₹{getItemsTotalPrice()?.totalTax?.toFixed(2)}
                    </span>
                  </div>
                  <div className="divider my-3"></div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold">Total Amount</span>
                    <span className="summary-total-modern">
                      ₹{getItemsTotalPrice()?.total?.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Payment Section */}
                <div className="payment-section flex-grow-1 d-flex flex-column">
                  {shouldShowPayment ? (
                    <>
                      {/* Pending Payment State */}
                      <div className="mb-4">
                        <div className="payment-status-card-modern payment-status-pending">
                          <div className="d-flex align-items-center gap-3">
                            <div className="icon-container-modern icon-container-orange">
                              <i className="ri-time-line"></i>
                            </div>
                            <div>
                              <h5 className="mb-1">Payment Pending</h5>
                              <p className="mb-0 text-muted">
                                Complete payment to process your order. Select a payment method below.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payment Methods - Radio Button Grid */}
                      <div className="mb-4 flex-grow-1">
                        <h5 className="mb-3 d-flex align-items-center gap-2">
                          <i className="ri-bank-card-2-line text-primary"></i>
                          Select Payment Method
                        </h5>
                        
                        <Row className="g-3">
                          {PaymentMethod.map((method, index) => (
                            <Col md={6} key={index}>
                              <div 
                                className={`payment-radio-option ${paymentMethod === method.id ? 'selected' : ''}`}
                                onClick={() => setPaymentMethod(method.id)}
                              >
                                <div className="d-flex align-items-center">
                                  <div className="radio-check"></div>
                                  <div className={`payment-icon ${getPaymentIconClass(method.id)} ms-3`}>
                                    <i className={`ri-${method.icon || 'bank-card-line'}`}></i>
                                  </div>
                                  <div className="ms-3 flex-grow-1">
                                    <div className="payment-method-name">{method.name}</div>
                                    <p className="payment-method-desc">
                                      {method.description || "Secure payment"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </Col>
                          ))}
                        </Row>
                      </div>

                      {/* Pay Now Button */}
                      <button
                        className={`btn-modern-primary w-100 mb-3 ${!paymentMethod ? 'disabled' : ''}`}
                        onClick={() => proceedPayment()}
                        disabled={loading || !paymentMethod}
                      >
                        {loading ? (
                          <div className="d-flex align-items-center justify-content-center gap-2">
                            <div className="spinner-modern"></div>
                            <span>Processing Payment...</span>
                          </div>
                        ) : (
                          <div className="d-flex align-items-center justify-content-center gap-3">
                            <i className="ri-lock-line"></i>
                            <span>Pay Now - ₹{getItemsTotalPrice()?.total?.toFixed(2)}</span>
                            <i className="ri-arrow-right-line"></i>
                          </div>
                        )}
                      </button>
                      
                      {!paymentMethod && (
                        <p className="text-center text-muted small mb-3">
                          Please select a payment method to continue
                        </p>
                      )}

                      {/* Security Note */}
                      <div className="security-badge-modern mt-auto">
                        <i className="ri-shield-check-line"></i>
                        <div>
                          <h6 className="mb-1">Secure Payment</h6>
                          <p className="mb-0 small">
                            Your payment is protected with bank-level 256-bit SSL encryption
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Payment Status Display */
                    <div className="text-center py-4 flex-grow-1 d-flex flex-column justify-content-center">
                      {isPaymentSuccess ? (
                        <>
                          <div className="success-icon-modern mb-4">
                            <div className="checkmark-circle">
                              <div className="checkmark"></div>
                            </div>
                          </div>
                          <h4 className="mb-3">Payment Successful!</h4>
                          <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '400px' }}>
                            Your payment has been processed successfully. Your order is now being prepared for shipment.
                          </p>
                          
                          <div className="payment-status-card-modern payment-status-success mb-4 mx-auto" style={{ maxWidth: '400px' }}>
                            <Row>
                              <Col xs={12}>
                                <p className="text-muted small mb-1">Transaction ID</p>
                                <p className="font-monospace fw-bold mb-0 transaction-id-value">
                                  {data?.payment?.transectionid || "N/A"}
                                </p>
                              </Col></Row>
                              <Row>
                              <Col xs={12} className="mt-3">
                                <p className="text-muted small mb-1">Amount Paid</p>
                                <p className="fw-bold mb-0">
                                  ₹{data?.payment?.amount || getItemsTotalPrice()?.total?.toFixed(2)}
                                </p>
                              </Col>
                            </Row>
                          </div>
                          
                          <div className="d-flex flex-wrap gap-3 justify-content-center">
                            <a target="_blank" href={`${process.env.API_PROD_URL}/invoice/${data?.id}/pdf`}><button className="btn btn-outline-primary px-4 py-2 rounded-pill">
                              <i className="ri-download-line me-2"></i>
                              Invoice
                            </button></a>
                            <a target="_blank" href={"https://api.eazysupplies.com/api/file?userId="+data?.userId+"&file=performa-transportReport"+data?.id+".pdf"} >
                            <button className="btn-modern-primary px-4 py-2">
                              <i className="ri-chat-3-line me-2"></i>
                              Track Order
                            </button></a>
                          </div>
                        </>
                      ) : isPaymentFailed ? (
                        <>
                          <div className="payment-status-card-modern payment-status-failed mb-4">
                            <div className="d-flex align-items-center justify-content-center mb-3">
                              <i className="ri-close-circle-fill text-danger" style={{ fontSize: '4rem' }}></i>
                            </div>
                            <h4 className="mb-3">Payment Failed</h4>
                            <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '400px' }}>
                              We couldn't process your payment. Please try again or contact our support team.
                            </p>
                            <button className="btn-modern-primary px-5 py-2.5">
                              <i className="ri-customer-service-line me-2"></i>
                              Contact Support
                            </button>
                          </div>
                        </>
                      ) : data?.status !== "APPROVED" ? (
                        <>
                          <div className="payment-status-card-modern payment-status-pending">
                            <div className="d-flex align-items-center justify-content-center mb-3">
                              <i className="ri-time-line text-warning" style={{ fontSize: '4rem' }}></i>
                            </div>
                            <h4 className="mb-3">Order Under Review</h4>
                            <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '400px' }}>
                              Your order is currently being reviewed. Payment options will be available once approved.
                            </p>
                            <div className="status-chip-modern warning">
                              <i className="ri-information-line"></i>
                              Current Status: {data?.status || "Pending"}
                            </div>
                          </div>
                        </>
                      ) : (
                        // Other statuses
                        <>
                          <div className="payment-status-card-modern payment-status-info">
                            <div className="d-flex align-items-center justify-content-center mb-3">
                              <i className="ri-information-line text-info" style={{ fontSize: '4rem' }}></i>
                            </div>
                            <h4 className="mb-3">Payment Information</h4>
                            <div className="mb-4">
                              <StatusChip 
                                status={
                                  paymentStatus === "SUCCESS" ? "success" : 
                                  paymentStatus === "FAILED" ? "danger" : 
                                  "warning"
                                } 
                                text={paymentStatus || "Not Available"}
                              />
                            </div>
                            {data?.payment?.transectionid && (
                              <div className="payment-status-card-modern payment-status-info" style={{ maxWidth: '400px' }}>
                                <p className="text-muted small mb-1">Transaction Reference</p>
                                <p className="font-monospace fw-bold mb-0 transaction-id-value">
                                  {data.payment.transectionid}
                                </p>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default ConsumerDetails;
