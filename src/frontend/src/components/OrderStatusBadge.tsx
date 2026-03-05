import { OrderStatus } from "../backend.d";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> =
  {
    [OrderStatus.pending_payment]: {
      label: "Pending Payment",
      className: "status-badge-pending",
    },
    [OrderStatus.payment_confirmed]: {
      label: "Payment Confirmed",
      className: "status-badge-confirmed",
    },
    [OrderStatus.in_delivery]: {
      label: "In Delivery",
      className: "status-badge-delivery",
    },
    [OrderStatus.ready_for_pickup]: {
      label: "Ready for Pickup",
      className: "status-badge-delivery",
    },
    [OrderStatus.completed]: {
      label: "Completed",
      className: "status-badge-completed",
    },
    [OrderStatus.cancelled]: {
      label: "Cancelled",
      className: "status-badge-cancelled",
    },
  };

export default function OrderStatusBadge({
  status,
  className = "",
}: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "status-badge-pending",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}
