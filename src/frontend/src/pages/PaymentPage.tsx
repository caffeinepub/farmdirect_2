import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { AppView } from "../App";
import { useConfirmPayment } from "../hooks/useQueries";

interface PaymentPageProps {
  orderId: bigint;
  amount: bigint;
  listingTitle: string;
  navigate: (v: AppView) => void;
}

const SERVICE_FEE_PERCENT = 2;
const OWNER_UPI_ID = "9751917451@gpay";

// amount = subtotal + 2% fee; compute breakdown from total
function computeBreakdown(total: number) {
  // total = subtotal * 1.02  =>  subtotal = total / 1.02
  const subtotal = Math.round(total / (1 + SERVICE_FEE_PERCENT / 100));
  const fee = total - subtotal;
  return { subtotal, fee };
}

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
  navigate,
}: PaymentPageProps) {
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [upiRef, setUpiRef] = useState<string>("");
  const confirmPayment = useConfirmPayment();

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
              Back
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
                Processing Payment
              </h2>
              <p className="text-muted-foreground">
                Please wait while we confirm your payment...
              </p>
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
                Payment Successful!
              </h2>
              <p className="text-muted-foreground mb-6">
                Your order has been confirmed
              </p>

              <div className="bg-card rounded-2xl border border-border p-5 text-left mb-8 max-w-sm mx-auto">
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-border">
                  <span className="text-muted-foreground text-sm">
                    Amount Paid
                  </span>
                  <span className="font-display font-bold text-xl text-foreground">
                    ₹{Number(amount)}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  {(() => {
                    const { subtotal, fee } = computeBreakdown(Number(amount));
                    return (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Product Amount
                          </span>
                          <span className="font-medium text-foreground">
                            ₹{subtotal}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Service Fee ({SERVICE_FEE_PERCENT}%)
                          </span>
                          <span className="font-medium text-primary">
                            ₹{fee}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order ID</span>
                    <span className="font-medium text-foreground">
                      #{orderId.toString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">UPI Ref</span>
                    <span className="font-mono text-xs text-foreground">
                      {upiRef}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product</span>
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
                Track Order →
              </Button>
              <Button
                variant="ghost"
                className="w-full mt-2 max-w-sm"
                onClick={() => navigate({ page: "consumer-home" })}
              >
                Back to Home
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
                <p className="text-muted-foreground text-sm mb-1">
                  Pay to{" "}
                  <span className="font-medium text-foreground">
                    {OWNER_UPI_ID}
                  </span>
                </p>
                <h1 className="font-display text-5xl font-bold text-foreground">
                  ₹{Number(amount)}
                </h1>
                <p className="text-muted-foreground text-sm mt-2 truncate px-4">
                  {listingTitle}
                </p>
                {(() => {
                  const { subtotal, fee } = computeBreakdown(Number(amount));
                  return (
                    <div className="flex items-center justify-center gap-3 mt-3 text-xs text-muted-foreground">
                      <span>Product ₹{subtotal}</span>
                      <span className="text-border">·</span>
                      <span className="text-primary font-medium">
                        {SERVICE_FEE_PERCENT}% Service Fee ₹{fee}
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center bg-card rounded-2xl border border-border p-6 mb-6">
                <p className="text-sm font-medium text-foreground mb-4">
                  Scan & Pay
                </p>
                <MockQR />
                <p className="text-xs text-muted-foreground mt-3">
                  Scan this QR code with any UPI app
                </p>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm text-muted-foreground px-2">
                  or pay with
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
                100% secure UPI payment · Order #{orderId.toString()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
