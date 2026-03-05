import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { AppView } from "../App";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useConfirmPayment,
  useGetUserPublicProfile,
} from "../hooks/useQueries";

interface PaymentPageProps {
  orderId: bigint;
  amount: bigint;
  listingTitle: string;
  sellerPrincipal: string;
  navigate: (v: AppView) => void;
}

const SERVICE_FEE_PERCENT = 2;

type PaymentState = "idle" | "processing" | "success";

// Static mock QR SVG — no dynamic keys needed
function MockQR() {
  return (
    <svg
      viewBox="0 0 120 120"
      width="140"
      height="140"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="QR Code for payment"
      role="img"
    >
      <title>QR Code for payment</title>
      <rect width="120" height="120" fill="white" rx="6" />
      {/* Top-left finder */}
      <rect x="8" y="8" width="30" height="30" rx="2" fill="#1a1a1a" />
      <rect x="13" y="13" width="20" height="20" rx="1" fill="white" />
      <rect x="18" y="18" width="10" height="10" fill="#1a1a1a" />
      {/* Top-right finder */}
      <rect x="82" y="8" width="30" height="30" rx="2" fill="#1a1a1a" />
      <rect x="87" y="13" width="20" height="20" rx="1" fill="white" />
      <rect x="92" y="18" width="10" height="10" fill="#1a1a1a" />
      {/* Bottom-left finder */}
      <rect x="8" y="82" width="30" height="30" rx="2" fill="#1a1a1a" />
      <rect x="13" y="87" width="20" height="20" rx="1" fill="white" />
      <rect x="18" y="92" width="10" height="10" fill="#1a1a1a" />
      {/* Data modules — static pattern */}
      <rect x="44" y="8" width="5" height="5" fill="#1a1a1a" />
      <rect x="52" y="8" width="5" height="5" fill="#1a1a1a" />
      <rect x="60" y="8" width="5" height="5" fill="#1a1a1a" />
      <rect x="68" y="8" width="5" height="5" fill="#1a1a1a" />
      <rect x="44" y="16" width="5" height="5" fill="#1a1a1a" />
      <rect x="60" y="16" width="5" height="5" fill="#1a1a1a" />
      <rect x="44" y="24" width="5" height="5" fill="#1a1a1a" />
      <rect x="52" y="24" width="5" height="5" fill="#1a1a1a" />
      <rect x="68" y="24" width="5" height="5" fill="#1a1a1a" />
      <rect x="44" y="32" width="5" height="5" fill="#1a1a1a" />
      <rect x="60" y="32" width="5" height="5" fill="#1a1a1a" />
      <rect x="8" y="44" width="5" height="5" fill="#1a1a1a" />
      <rect x="16" y="44" width="5" height="5" fill="#1a1a1a" />
      <rect x="24" y="44" width="5" height="5" fill="#1a1a1a" />
      <rect x="44" y="44" width="5" height="5" fill="#1a1a1a" />
      <rect x="52" y="44" width="5" height="5" fill="#1a1a1a" />
      <rect x="68" y="44" width="5" height="5" fill="#1a1a1a" />
      <rect x="76" y="44" width="5" height="5" fill="#1a1a1a" />
      <rect x="84" y="44" width="5" height="5" fill="#1a1a1a" />
      <rect x="100" y="44" width="5" height="5" fill="#1a1a1a" />
      <rect x="108" y="44" width="5" height="5" fill="#1a1a1a" />
      <rect x="8" y="52" width="5" height="5" fill="#1a1a1a" />
      <rect x="24" y="52" width="5" height="5" fill="#1a1a1a" />
      <rect x="44" y="52" width="5" height="5" fill="#1a1a1a" />
      <rect x="60" y="52" width="5" height="5" fill="#1a1a1a" />
      <rect x="76" y="52" width="5" height="5" fill="#1a1a1a" />
      <rect x="92" y="52" width="5" height="5" fill="#1a1a1a" />
      <rect x="108" y="52" width="5" height="5" fill="#1a1a1a" />
      <rect x="8" y="60" width="5" height="5" fill="#1a1a1a" />
      <rect x="16" y="60" width="5" height="5" fill="#1a1a1a" />
      <rect x="32" y="60" width="5" height="5" fill="#1a1a1a" />
      <rect x="52" y="60" width="5" height="5" fill="#1a1a1a" />
      <rect x="68" y="60" width="5" height="5" fill="#1a1a1a" />
      <rect x="84" y="60" width="5" height="5" fill="#1a1a1a" />
      <rect x="100" y="60" width="5" height="5" fill="#1a1a1a" />
      <rect x="8" y="68" width="5" height="5" fill="#1a1a1a" />
      <rect x="32" y="68" width="5" height="5" fill="#1a1a1a" />
      <rect x="44" y="68" width="5" height="5" fill="#1a1a1a" />
      <rect x="60" y="68" width="5" height="5" fill="#1a1a1a" />
      <rect x="76" y="68" width="5" height="5" fill="#1a1a1a" />
      <rect x="92" y="68" width="5" height="5" fill="#1a1a1a" />
      <rect x="108" y="68" width="5" height="5" fill="#1a1a1a" />
      <rect x="8" y="76" width="5" height="5" fill="#1a1a1a" />
      <rect x="16" y="76" width="5" height="5" fill="#1a1a1a" />
      <rect x="24" y="76" width="5" height="5" fill="#1a1a1a" />
      <rect x="44" y="76" width="5" height="5" fill="#1a1a1a" />
      <rect x="60" y="76" width="5" height="5" fill="#1a1a1a" />
      <rect x="84" y="76" width="5" height="5" fill="#1a1a1a" />
      <rect x="100" y="76" width="5" height="5" fill="#1a1a1a" />
      <rect x="44" y="84" width="5" height="5" fill="#1a1a1a" />
      <rect x="52" y="84" width="5" height="5" fill="#1a1a1a" />
      <rect x="68" y="84" width="5" height="5" fill="#1a1a1a" />
      <rect x="84" y="84" width="5" height="5" fill="#1a1a1a" />
      <rect x="100" y="84" width="5" height="5" fill="#1a1a1a" />
      <rect x="108" y="84" width="5" height="5" fill="#1a1a1a" />
      <rect x="44" y="92" width="5" height="5" fill="#1a1a1a" />
      <rect x="60" y="92" width="5" height="5" fill="#1a1a1a" />
      <rect x="76" y="92" width="5" height="5" fill="#1a1a1a" />
      <rect x="44" y="100" width="5" height="5" fill="#1a1a1a" />
      <rect x="52" y="100" width="5" height="5" fill="#1a1a1a" />
      <rect x="68" y="100" width="5" height="5" fill="#1a1a1a" />
      <rect x="84" y="100" width="5" height="5" fill="#1a1a1a" />
      <rect x="108" y="100" width="5" height="5" fill="#1a1a1a" />
      <rect x="44" y="108" width="5" height="5" fill="#1a1a1a" />
      <rect x="60" y="108" width="5" height="5" fill="#1a1a1a" />
      <rect x="76" y="108" width="5" height="5" fill="#1a1a1a" />
      <rect x="92" y="108" width="5" height="5" fill="#1a1a1a" />
    </svg>
  );
}

export default function PaymentPage({
  orderId,
  amount,
  listingTitle,
  sellerPrincipal,
  navigate,
}: PaymentPageProps) {
  const { t } = useLanguage();
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [upiRef, setUpiRef] = useState<string>("");
  const confirmPayment = useConfirmPayment();

  // Fetch seller's public profile
  const { data: sellerProfile } = useGetUserPublicProfile(sellerPrincipal);

  // Compute fee breakdown from amount
  // amount = sellerAmount + platformFee (2% of original subtotal)
  // If amount = subtotal * 1.02 → subtotal = amount / 1.02
  const totalNum = Number(amount);
  const subtotal = Math.round(totalNum / (1 + SERVICE_FEE_PERCENT / 100));
  const platformFee = totalNum - subtotal;
  const sellerReceives = subtotal; // seller gets subtotal (before our cut)

  const generateUpiRef = () => {
    return `UPI${Math.floor(100000000000 + Math.random() * 900000000000).toString()}`;
  };

  const handlePay = async (method: "gpay" | "paytm") => {
    setPaymentState("processing");

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const ref = generateUpiRef();
    setUpiRef(ref);

    try {
      await confirmPayment.mutateAsync({ orderId, upiRef: ref });
      setPaymentState("success");
      toast.success(
        `Payment successful via ${method === "gpay" ? "Google Pay" : "Paytm"}! 🎉`,
      );
    } catch (_err) {
      setPaymentState("idle");
      toast.error("Payment confirmation failed. Please try again.");
    }
  };

  // Determine display UPI: seller's UPI or fallback
  const displaySellerName = sellerProfile?.name ?? "Seller";
  const displayUpiId = sellerProfile?.upiId ?? "—";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {paymentState === "idle" && (
        <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-sm border-b border-border">
          <div className="max-w-lg mx-auto px-4 h-14 flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ page: "consumer-home" })}
              className="gap-1.5 -ml-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("back")}
            </Button>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {paymentState === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              data-ocid="payment.loading_state"
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                {t("processing_payment")}
              </h2>
              <p className="text-muted-foreground">{t("please_wait")}</p>
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Secured by UPI encryption
              </div>
            </motion.div>
          )}

          {paymentState === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              data-ocid="payment.success_state"
              className="text-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.1,
                }}
                className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-14 h-14 text-green-600" />
              </motion.div>

              <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                {t("payment_successful")}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t("your_order_confirmed")}
              </p>

              <div className="bg-card rounded-2xl border border-border p-5 text-left mb-8 max-w-sm mx-auto">
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-border">
                  <span className="text-muted-foreground text-sm">
                    {t("amount_paid")}
                  </span>
                  <span className="font-display font-bold text-xl text-foreground">
                    ₹{totalNum}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("seller_receives")}
                    </span>
                    <span className="font-medium text-foreground">
                      ₹{sellerReceives}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("platform_fee")} ({SERVICE_FEE_PERCENT}%)
                    </span>
                    <span className="font-medium text-primary">
                      ₹{platformFee}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("order_id")}
                    </span>
                    <span className="font-medium text-foreground">
                      #{orderId.toString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("paid_to")}
                    </span>
                    <span className="font-medium text-foreground">
                      {displaySellerName}
                    </span>
                  </div>
                  {displayUpiId !== "—" && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("upi_id")}
                      </span>
                      <span className="font-mono text-xs text-primary">
                        {displayUpiId}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("upi_ref")}
                    </span>
                    <span className="font-mono text-xs text-foreground">
                      {upiRef}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("product")}
                    </span>
                    <span className="font-medium text-foreground text-right max-w-[160px] truncate">
                      {listingTitle}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                data-ocid="order.track_button"
                onClick={() => navigate({ page: "order-tracking", orderId })}
                className="w-full h-12 text-base font-semibold max-w-sm"
              >
                {t("track_order")} →
              </Button>
              <Button
                variant="ghost"
                className="w-full mt-2 max-w-sm"
                onClick={() => navigate({ page: "consumer-home" })}
              >
                {t("back_to_home")}
              </Button>
            </motion.div>
          )}

          {paymentState === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Amount */}
              <div className="text-center mb-8">
                {/* Recipient info card */}
                <div className="inline-flex flex-col items-center bg-card border border-border rounded-xl px-5 py-3 mb-5 gap-0.5 w-full max-w-xs">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                    {t("paying_to")}
                  </p>
                  <p className="font-display text-lg font-bold text-foreground leading-tight">
                    {displaySellerName}
                  </p>
                  {displayUpiId !== "—" ? (
                    <p className="text-sm font-mono text-primary font-medium break-all">
                      {displayUpiId}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      UPI not set by seller
                    </p>
                  )}
                  {sellerProfile?.phone && (
                    <p className="text-xs text-muted-foreground">
                      📞 {sellerProfile.phone}
                    </p>
                  )}
                </div>

                <h1 className="font-display text-5xl font-bold text-foreground">
                  ₹{totalNum}
                </h1>
                <p className="text-muted-foreground text-sm mt-2 truncate px-4">
                  {listingTitle}
                </p>

                {/* Fee breakdown */}
                <div className="mt-4 bg-muted/50 rounded-xl p-3 max-w-xs mx-auto text-sm">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-muted-foreground">
                      {t("you_pay")}
                    </span>
                    <span className="font-bold text-foreground">
                      ₹{totalNum}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-muted-foreground">
                      {t("seller_receives")}
                    </span>
                    <span className="font-semibold text-foreground">
                      ₹{sellerReceives}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-border/60">
                    <span className="text-muted-foreground">
                      {t("platform_fee")} ({SERVICE_FEE_PERCENT}%)
                    </span>
                    <span className="font-medium text-primary">
                      ₹{platformFee}
                    </span>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center bg-card rounded-2xl border border-border p-6 mb-6">
                <p className="text-sm font-medium text-foreground mb-4">
                  {t("scan_and_pay")}
                </p>
                <MockQR />
                <p className="text-xs text-muted-foreground mt-3">
                  {t("scan_qr_upi")}
                </p>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm text-muted-foreground px-2">
                  {t("or_pay_with")}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Payment buttons */}
              <div className="grid grid-cols-2 gap-4">
                {/* GPay */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  data-ocid="payment.gpay_button"
                  onClick={() => handlePay("gpay")}
                  className="flex flex-col items-center justify-center gap-2 bg-white border-2 border-[#4285F4] rounded-2xl p-5 h-24 shadow-sm hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285F4]"
                >
                  <div className="flex items-center gap-1">
                    <span
                      style={{
                        color: "#4285F4",
                        fontWeight: 700,
                        fontSize: "18px",
                      }}
                    >
                      G
                    </span>
                    <span
                      style={{
                        color: "#EA4335",
                        fontWeight: 700,
                        fontSize: "18px",
                      }}
                    >
                      o
                    </span>
                    <span
                      style={{
                        color: "#FBBC05",
                        fontWeight: 700,
                        fontSize: "18px",
                      }}
                    >
                      o
                    </span>
                    <span
                      style={{
                        color: "#4285F4",
                        fontWeight: 700,
                        fontSize: "18px",
                      }}
                    >
                      g
                    </span>
                    <span
                      style={{
                        color: "#34A853",
                        fontWeight: 700,
                        fontSize: "18px",
                      }}
                    >
                      l
                    </span>
                    <span
                      style={{
                        color: "#EA4335",
                        fontWeight: 700,
                        fontSize: "18px",
                      }}
                    >
                      e
                    </span>
                  </div>
                  <span
                    style={{
                      color: "#4285F4",
                      fontWeight: 700,
                      fontSize: "15px",
                    }}
                  >
                    Pay
                  </span>
                </motion.button>

                {/* Paytm */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  data-ocid="payment.paytm_button"
                  onClick={() => handlePay("paytm")}
                  className="flex flex-col items-center justify-center gap-2 bg-[#002970] border-2 border-[#00BAF2] rounded-2xl p-5 h-24 shadow-sm hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00BAF2]"
                >
                  <div className="flex items-center gap-0.5">
                    <span
                      style={{
                        color: "#00BAF2",
                        fontWeight: 900,
                        fontSize: "22px",
                        letterSpacing: "-1px",
                      }}
                    >
                      Pay
                    </span>
                    <span
                      style={{
                        color: "#ffffff",
                        fontWeight: 900,
                        fontSize: "22px",
                        letterSpacing: "-1px",
                      }}
                    >
                      tm
                    </span>
                  </div>
                  <span
                    style={{
                      color: "#00BAF2",
                      fontSize: "11px",
                      fontWeight: 500,
                    }}
                  >
                    UPI & Wallet
                  </span>
                </motion.button>
              </div>

              {/* Security note */}
              <div className="flex items-center justify-center gap-2 mt-6 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-primary" />
                {t("secure_upi_payment")} · {t("order_id")} #
                {orderId.toString()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
