import { BASE_URL } from "@/utils/axiosUtils/API";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import axios from "axios";
import { calculateOrderTotals } from "@/utils/pricing/orderTotals";

const PAYMENT_METHODS = [
  { id: "NB", name: "Online Payment", description: "Pay securely through the online payment gateway", icon: "ri-bank-card-line" },
  { id: "OFF", name: "Offline Payment", description: "Record the order for payment through the support team", icon: "ri-hand-coin-line" },
];

const money = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(2) : "0.00";
};

const ConsumerDetails = ({ data, taxData, onPaymentRecorded }) => {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentNotice, setPaymentNotice] = useState("");

  const paymentStatus = String(data?.payment?.status || data?.payment_status || "PENDING").toUpperCase();
  const recordedPaymentMethod = data?.payment?.method || data?.payment_method || "";
  const isPaymentSuccess = paymentStatus === "SUCCESS";
  const isPaymentFailed = paymentStatus === "FAILED";
  const isOfflinePaymentRecorded = recordedPaymentMethod === "OFF";
  const orderStatus = String(data?.status || "").toUpperCase();
  const approvedValue = String(data?.approved).toLowerCase();
  const approvedFlag = data?.approved === true || data?.approved === 1 || ["yes", "true", "1"].includes(approvedValue);
  const isOrderApproved = approvedFlag || ["APPROVED", "COMPLETED", "SHIPPED", "DELIVERED"].includes(orderStatus);
  const hasInvoice = Boolean(data?.invoicepath);
  const shouldShowPayment = isOrderApproved && !isPaymentSuccess && !isOfflinePaymentRecorded;

  const invoice = useMemo(() => calculateOrderTotals(data, taxData), [data, taxData]);

  const selectPaymentMethod = (method) => {
    if (loading) return;
    setPaymentMethod(method);
    setPaymentError("");
    setPaymentNotice("");
  };

  const proceedPayment = async () => {
    if (!shouldShowPayment || loading) return;
    if (!paymentMethod) {
      setPaymentError("Please select Online Payment or Offline Payment to continue.");
      return;
    }
    if (!Number.isFinite(invoice.grandTotal) || invoice.grandTotal <= 0) {
      setPaymentError("The order total is invalid. Please refresh and try again.");
      return;
    }
    setLoading(true);
    setPaymentError("");
    setPaymentNotice("");
    try {
      const response = await axios({
        method: "post",
        url: `${BASE_URL}/api/payments/benePay/getUrl`,
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
        data: {
          orderId: data.id,
          amount: invoice.grandTotal,
          method: paymentMethod,
          reasonForCollection: ` Order Id #${data.id}`,
        },
      });
      const paymentUrl = response.data?.realTimePaymentData?.message;
      if (paymentMethod === "NB" && paymentUrl?.startsWith("https")) {
        window.location.assign(paymentUrl);
        return;
      }
      if (paymentMethod === "OFF") {
        setPaymentNotice("Offline Payment has been selected and recorded for this order.");
        await onPaymentRecorded?.();
        router.refresh();
        return;
      }
      setPaymentError("The payment gateway did not return a valid payment URL. Please try again.");
    } catch (error) {
      const responseError = error?.response?.data;
      setPaymentError(
        responseError?.error ||
        responseError?.message ||
        responseError?.details?.message ||
        "Payment processing failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const paymentMethodLabel = recordedPaymentMethod === "NB"
    ? "Online Payment"
    : recordedPaymentMethod === "OFF" ? "Offline Payment" : "Not selected";

  return (
    <section className="order-invoice-panel my-4" aria-labelledby="order-invoice-title">
      <header className="order-invoice-header">
        <div className="order-invoice-company">
          <strong>Earthling Consumer Products Pvt. Ltd.</strong>
          <span>Order and payment summary</span>
        </div>
        <div className="order-invoice-number">
          <span>ORDER</span><strong>#{data?.id}</strong><small>{data?.status || "PENDING"}</small>
        </div>
      </header>

      <div className="order-invoice-meta">
        <div>
          <span className="order-invoice-label">BILLED TO</span>
          <strong>{data?.user?.name || "Customer"}</strong>
          <p>{[data?.shipping?.address, data?.shipping?.city, data?.shipping?.postalCode, data?.shipping?.country].filter(Boolean).join(", ")}</p>
          {data?.user?.phone && <small>Phone: {data?.user?.countryCode} {data.user.phone}</small>}
        </div>
        <div className="order-invoice-actions">
          {isOrderApproved && hasInvoice ? (
            <a href={`${BASE_URL}/api/file?file=performa-invoice${data?.id}.pdf`} target="_blank" rel="noreferrer">
              <i className="ri-file-download-line" aria-hidden="true"></i>Download invoice
            </a>
          ) : (
            <span className="is-disabled" aria-disabled="true" title="The invoice is generated after admin approval">
              <i className="ri-time-line" aria-hidden="true"></i>{isOrderApproved ? "Invoice is being prepared" : "Invoice available after admin approval"}
            </span>
          )}
        </div>
      </div>

      <div className="order-invoice-table-wrap">
        <table className="order-invoice-table">
          <thead><tr>
            <th>Product description</th><th>Qty</th><th>Unit price</th><th>Disc %</th>
            <th>Disc amt</th><th>Selling price</th><th>Tax</th><th>Total</th>
          </tr></thead>
          <tbody>
            {invoice.rows.map((row) => <tr key={row.id}>
              <td data-label="Product">{row.name}</td>
              <td data-label="Qty">{row.quantity}</td>
              <td data-label="Unit price">₹{money(row.unitPrice)}</td>
              <td data-label="Discount">{money(row.discountPercentage)}%</td>
              <td data-label="Discount amount">-₹{money(row.discountAmount)}</td>
              <td data-label="Selling price">₹{money(row.sellingPrice)}</td>
              <td data-label="Tax">₹{money(row.taxAmount)} <small>({money(row.taxPercentage)}%)</small></td>
              <td data-label="Total"><strong>₹{money(row.total)}</strong></td>
            </tr>)}
          </tbody>
        </table>
      </div>

      <div className="order-invoice-totals">
        <div><span>Gross subtotal</span><strong>₹{money(invoice.grossSubtotal)}</strong></div>
        <div><span>Total discount</span><strong>-₹{money(invoice.totalDiscount)}</strong></div>
        <div><span>Total GST/Tax</span><strong>+₹{money(invoice.totalTax)}</strong></div>
        <div className="order-invoice-grand-total"><span>Grand total</span><strong>₹{money(invoice.grandTotal)}</strong></div>
      </div>

      <div className="order-payment-panel">
        {shouldShowPayment ? <>
          <div className="order-payment-heading">
            <div><span className="order-invoice-label">PAYMENT</span><h3 id="order-invoice-title">Choose payment method</h3></div>
            <span className="order-payment-status is-pending">{paymentStatus}</span>
          </div>
          <div className="order-payment-options" role="radiogroup" aria-label="Payment method">
            {PAYMENT_METHODS.map((method) => <button
              type="button" role="radio" aria-checked={paymentMethod === method.id}
              className={`order-payment-option ${paymentMethod === method.id ? "is-selected" : ""}`}
              key={method.id} onClick={() => selectPaymentMethod(method.id)} disabled={loading}
            >
              <i className={method.icon} aria-hidden="true"></i>
              <span><strong>{method.name}</strong><small>{method.description}</small></span>
              <span className="order-payment-radio" aria-hidden="true"></span>
            </button>)}
          </div>
          {paymentError && <div className="order-payment-message is-error" role="alert">{paymentError}</div>}
          {paymentNotice && <div className="order-payment-message is-success" role="status">{paymentNotice}</div>}
          <button type="button" className="order-pay-now" onClick={proceedPayment} disabled={loading || !paymentMethod}>
            {loading ? <><span className="spinner-modern"></span>Processing payment…</> : <><i className="ri-lock-line"></i>Pay now · ₹{money(invoice.grandTotal)}</>}
          </button>
        </> : <div className="order-payment-recorded">
          <div className={`order-payment-recorded-icon ${isPaymentSuccess ? "is-success" : isPaymentFailed ? "is-failed" : "is-pending"}`}>
            <i className={isPaymentSuccess ? "ri-checkbox-circle-fill" : isPaymentFailed ? "ri-close-circle-fill" : "ri-time-line"}></i>
          </div>
          <div><span className="order-invoice-label">PAYMENT DETAILS</span><h3>{paymentMethodLabel}</h3>
            <p>Status: <strong>{paymentStatus}</strong></p>
            {data?.payment?.transectionid && <small>Transaction reference: {data.payment.transectionid}</small>}
          </div>
          <strong className="order-payment-recorded-amount">₹{money(data?.payment?.amount || invoice.grandTotal)}</strong>
        </div>}
      </div>
    </section>
  );
};

export default ConsumerDetails;
