import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  CreditCard,
  Loader2,
  Package,
  Star,
  Store,
  Truck,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { AppView } from "../App";
import { DeliveryType, OrderStatus } from "../backend.d";
import LiveTrackingMap from "../components/LiveTrackingMap";
import OrderStatusBadge from "../components/OrderStatusBadge";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCancelOrder,
  useGetListing,
  useGetOrder,
  useGetUserProfile,
  useUpdateOrderStatus,
} from "../hooks/useQueries";

interface OrderTrackingPageProps {
  orderId: bigint;
  navigate: (v: AppView) => void;
}

type StepStatus = "completed" | "active" | "pending";

interface TrackingStep {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  status: StepStatus;
}

function getTrackingSteps(
  status: OrderStatus,
  deliveryType: DeliveryType,
): TrackingStep[] {
  const STEPS: Array<{
    id: OrderStatus | "start";
    label: string;
    description: string;
    icon: React.ReactNode;
  }> = [
    {
      id: OrderStatus.pending_payment,
      label: "Order Placed",
      description: "Waiting for payment",
      icon: <CreditCard className="w-4 h-4" />,
    },
    {
      id: OrderStatus.payment_confirmed,
      label: "Payment Confirmed",
      description: "Farmer is preparing your order",
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    {
      id:
        deliveryType === DeliveryType.delivery
          ? OrderStatus.in_delivery
          : OrderStatus.ready_for_pickup,
      label:
        deliveryType === DeliveryType.delivery
          ? "In Delivery"
          : "Ready for Pickup",
      description:
        deliveryType === DeliveryType.delivery
          ? "Your order is on the way"
          : "Visit farm to collect your order",
      icon:
        deliveryType === DeliveryType.delivery ? (
          <Truck className="w-4 h-4" />
        ) : (
          <Store className="w-4 h-4" />
        ),
    },
    {
      id: OrderStatus.completed,
      label: "Completed",
      description: "Order successfully delivered",
      icon: <Star className="w-4 h-4" />,
    },
  ];

  const ORDER: OrderStatus[] = [
    OrderStatus.pending_payment,
    OrderStatus.payment_confirmed,
    deliveryType === DeliveryType.delivery
      ? OrderStatus.in_delivery
      : OrderStatus.ready_for_pickup,
    OrderStatus.completed,
  ];

  const currentIndex = ORDER.indexOf(status);
  if (status === OrderStatus.cancelled) {
    return STEPS.map((step) => ({
      id: step.id as string,
      label: step.label,
      description: step.description,
      icon: step.icon,
      status: "pending" as StepStatus,
    }));
  }

  return STEPS.map((step, i) => ({
    id: step.id as string,
    label: step.label,
    description: step.description,
    icon: step.icon,
    status: (i < currentIndex
      ? "completed"
      : i === currentIndex
        ? "active"
        : "pending") as StepStatus,
  }));
}

// Valid status transitions for sellers
function getNextStatuses(
  current: OrderStatus,
  deliveryType: DeliveryType,
): OrderStatus[] {
  switch (current) {
    case OrderStatus.payment_confirmed:
      return deliveryType === DeliveryType.delivery
        ? [OrderStatus.in_delivery]
        : [OrderStatus.ready_for_pickup];
    case OrderStatus.in_delivery:
    case OrderStatus.ready_for_pickup:
      return [OrderStatus.completed];
    default:
      return [];
  }
}

function statusLabel(s: OrderStatus): string {
  switch (s) {
    case OrderStatus.in_delivery:
      return "Mark as In Delivery";
    case OrderStatus.ready_for_pickup:
      return "Mark Ready for Pickup";
    case OrderStatus.completed:
      return "Mark as Completed";
    default:
      return s;
  }
}

export default function OrderTrackingPage({
  orderId,
  navigate,
}: OrderTrackingPageProps) {
  const { identity } = useInternetIdentity();
  const { data: order, isLoading: orderLoading } = useGetOrder(orderId);
  const { data: listing } = useGetListing(order?.listingId ?? null);
  const { data: sellerProfile } = useGetUserProfile(
    order?.seller?.toString() ?? null,
  );
  const { data: buyerProfile } = useGetUserProfile(
    order?.buyer?.toString() ?? null,
  );
  const cancelOrder = useCancelOrder();
  const updateStatus = useUpdateOrderStatus();

  const isSeller =
    identity &&
    order &&
    order.seller.toString() === identity.getPrincipal().toString();
  const _isBuyer =
    identity &&
    order &&
    order.buyer.toString() === identity.getPrincipal().toString();

  const handleCancel = async () => {
    try {
      await cancelOrder.mutateAsync(orderId);
      toast.success("Order cancelled");
    } catch {
      toast.error("Failed to cancel order");
    }
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ orderId, status: newStatus });
      toast.success("Order status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (orderLoading) {
    return (
      <div className="min-h-screen bg-background max-w-lg mx-auto px-4 py-6">
        <Skeleton className="w-24 h-8 mb-6" />
        <Skeleton className="h-64 rounded-2xl mb-4" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">📦</div>
          <h2 className="font-display font-bold">Order not found</h2>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate({ page: "consumer-home" })}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const steps = getTrackingSteps(order.status, order.deliveryType);
  const nextStatuses = isSeller
    ? getNextStatuses(order.status, order.deliveryType)
    : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              isSeller
                ? navigate({ page: "farmer-dashboard", tab: "orders" })
                : navigate({ page: "consumer-home" })
            }
            className="gap-1.5 -ml-2"
            data-ocid="order.back_button"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <span className="font-display font-bold text-sm">
            Order #{orderId.toString()}
          </span>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 pb-12">
        {/* Status hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border shadow-card p-5 mb-5"
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                {listing?.title ?? "Product"}
              </h2>
              <p className="text-muted-foreground text-sm">
                Qty: {Number(order.quantity)} · ₹{Number(order.totalAmount)}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>

          <div className="flex gap-3">
            <Badge variant="outline" className="text-xs">
              {order.deliveryType === DeliveryType.delivery
                ? "🚚 Delivery"
                : "📍 Pickup"}
            </Badge>
            {order.upiRef && (
              <Badge variant="outline" className="text-xs font-mono">
                {order.upiRef.slice(0, 12)}...
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Timeline */}
        {order.status !== OrderStatus.cancelled ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl border border-border shadow-card p-5 mb-5"
          >
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-5">
              Order Progress
            </h3>
            <div className="relative">
              {steps.map((step, i) => (
                <div key={step.id} className="flex gap-4 relative">
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div
                      className="absolute left-4 top-8 bottom-0 w-0.5 -translate-x-1/2"
                      style={{
                        background:
                          step.status === "completed"
                            ? "oklch(0.55 0.16 145)"
                            : "oklch(0.88 0.025 120)",
                        height: "calc(100% - 8px)",
                      }}
                    />
                  )}

                  {/* Step icon */}
                  <div
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      step.status === "completed"
                        ? "bg-primary text-primary-foreground"
                        : step.status === "active"
                          ? "bg-accent/20 text-accent-foreground border-2 border-accent"
                          : "bg-muted text-muted-foreground border-2 border-border"
                    }`}
                  >
                    {step.status === "completed" ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : step.status === "active" ? (
                      step.icon
                    ) : (
                      <Circle className="w-3 h-3" />
                    )}
                  </div>

                  {/* Step content */}
                  <div
                    className={`pb-6 ${i === steps.length - 1 ? "pb-0" : ""}`}
                  >
                    <p
                      className={`font-semibold text-sm ${
                        step.status === "pending"
                          ? "text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-5 mb-5 text-center">
            <div className="text-3xl mb-2">❌</div>
            <h3 className="font-semibold text-destructive">Order Cancelled</h3>
            <p className="text-sm text-muted-foreground mt-1">
              This order has been cancelled
            </p>
          </div>
        )}

        {/* Live Tracking Map - only for active orders */}
        {(order.status === OrderStatus.payment_confirmed ||
          order.status === OrderStatus.in_delivery ||
          order.status === OrderStatus.ready_for_pickup) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-5"
          >
            <LiveTrackingMap
              orderId={orderId}
              isSeller={!!isSeller}
              deliveryType={order.deliveryType}
              orderStatus={order.status}
            />
          </motion.div>
        )}

        {/* Buyer/Seller info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl border border-border shadow-card p-5 mb-5"
        >
          {isSeller ? (
            <>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Buyer
              </h3>
              <p className="font-semibold text-foreground">
                {buyerProfile?.name ?? "—"}
              </p>
              <p className="text-sm text-muted-foreground">
                {buyerProfile?.phone}
              </p>
              <p className="text-sm text-muted-foreground">
                {buyerProfile?.city}, {buyerProfile?.pincode}
              </p>
            </>
          ) : (
            <>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Seller
              </h3>
              <p className="font-semibold text-foreground">
                {sellerProfile?.name ?? "—"}
              </p>
              <p className="text-sm text-muted-foreground">
                {sellerProfile?.phone}
              </p>
              <p className="text-sm text-muted-foreground">
                {sellerProfile?.city}, {sellerProfile?.pincode}
              </p>
            </>
          )}
        </motion.div>

        {/* Actions */}
        <div className="space-y-3">
          {/* Seller: advance status */}
          {isSeller &&
            nextStatuses.map((nextStatus) => (
              <Button
                key={nextStatus}
                className="w-full h-12 text-sm font-semibold"
                onClick={() => handleStatusUpdate(nextStatus)}
                disabled={updateStatus.isPending}
                data-ocid="order.status_update_button"
              >
                {updateStatus.isPending ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  statusLabel(nextStatus)
                )}
              </Button>
            ))}

          {/* Cancel button */}
          {order.status === OrderStatus.pending_payment && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-12 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
                  data-ocid="order.cancel_button"
                >
                  Cancel Order
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent data-ocid="order.cancel.dialog">
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel this order? This cannot be
                    undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-ocid="order.cancel.cancel_button">
                    Keep Order
                  </AlertDialogCancel>
                  <AlertDialogAction
                    data-ocid="order.cancel.confirm_button"
                    onClick={handleCancel}
                    disabled={cancelOrder.isPending}
                    className="bg-destructive text-destructive-foreground"
                  >
                    {cancelOrder.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    ) : null}
                    Cancel Order
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  );
}
