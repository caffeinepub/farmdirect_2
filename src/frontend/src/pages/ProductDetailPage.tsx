import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Package,
  Phone,
  Store,
  Truck,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { AppView } from "../App";
import { DeliveryType } from "../backend.d";
import ProductImage from "../components/ProductImage";
import {
  useGetListing,
  useGetUserProfile,
  usePlaceOrder,
} from "../hooks/useQueries";

interface ProductDetailPageProps {
  listingId: bigint;
  navigate: (v: AppView) => void;
}

export default function ProductDetailPage({
  listingId,
  navigate,
}: ProductDetailPageProps) {
  const { data: listing, isLoading } = useGetListing(listingId);
  const farmerPrincipal = listing?.farmer?.toString() ?? null;
  const { data: farmerProfile } = useGetUserProfile(farmerPrincipal);
  const placeOrder = usePlaceOrder();

  const [quantity, setQuantity] = useState(1);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>(
    DeliveryType.delivery,
  );

  const maxQty = listing ? Number(listing.quantity) : 0;
  const pricePerUnit = listing ? Number(listing.price) : 0;
  const subtotal = pricePerUnit * quantity;
  const serviceFee = Math.round(subtotal * 0.02);
  const total = subtotal + serviceFee;

  const handleBuyNow = async () => {
    if (!listing) return;
    try {
      const orderId = await placeOrder.mutateAsync({
        listingId: listing.id,
        quantity: BigInt(quantity),
        deliveryType,
      });
      toast.success("Order placed! Proceeding to payment...");
      navigate({
        page: "payment",
        orderId,
        amount: BigInt(total),
        listingTitle: listing.title,
        sellerPrincipal: listing.farmer.toString(),
      });
    } catch (_err) {
      toast.error("Failed to place order. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-lg mx-auto px-4 py-6">
          <Skeleton className="w-8 h-8 rounded-full mb-4" />
          <Skeleton className="w-full aspect-square rounded-2xl mb-6" />
          <Skeleton className="h-8 w-3/4 mb-3" />
          <Skeleton className="h-6 w-1/3 mb-6" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">🔍</div>
          <h2 className="font-display font-bold text-foreground mb-2">
            Product not found
          </h2>
          <Button
            variant="outline"
            onClick={() => navigate({ page: "consumer-home" })}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back button */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ page: "consumer-home" })}
            className="gap-1.5 -ml-2"
            data-ocid="product.back_button"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pb-32">
        {/* Product Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full aspect-square rounded-2xl overflow-hidden mt-4 mb-5 bg-muted"
        >
          <ProductImage
            imageId={listing.imageId}
            title={listing.title}
            className="w-full h-full object-cover"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Title & Price */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <h1 className="font-display text-2xl font-bold text-foreground leading-tight">
              {listing.title}
            </h1>
            <Badge className="flex-shrink-0 bg-primary/10 text-primary border-primary/20 text-sm font-bold px-3 py-1">
              ₹{Number(listing.price)}/{listing.unit}
            </Badge>
          </div>

          {/* Description */}
          {listing.description && (
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              {listing.description}
            </p>
          )}

          {/* Availability */}
          <div className="flex items-center gap-2 mb-5">
            <Package className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">
                {Number(listing.quantity)} {listing.unit}
              </span>{" "}
              available
            </span>
          </div>

          {/* Farmer info */}
          <div className="bg-secondary/50 rounded-xl p-4 mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Seller
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-sm">
                  {farmerProfile?.name ?? "Loading..."}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  {farmerProfile?.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {farmerProfile.city} - {listing.pincode}
                    </span>
                  )}
                  {farmerProfile?.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {farmerProfile.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quantity selector */}
          <div className="mb-5">
            <p className="text-sm font-semibold text-foreground mb-3">
              Quantity ({listing.unit})
            </p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                data-ocid="product.quantity_input"
                className="w-11 h-11 rounded-xl border-2 border-border bg-card text-foreground font-bold text-lg flex items-center justify-center hover:border-primary transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="font-display font-bold text-2xl text-foreground min-w-[3ch] text-center">
                {quantity}
              </span>
              <button
                type="button"
                className="w-11 h-11 rounded-xl border-2 border-border bg-card text-foreground font-bold text-lg flex items-center justify-center hover:border-primary transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                disabled={quantity >= maxQty}
                aria-label="Increase quantity"
              >
                +
              </button>
              <span className="text-sm text-muted-foreground">of {maxQty}</span>
            </div>
          </div>

          {/* Delivery toggle */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-foreground mb-3">
              Delivery Option
            </p>
            <ToggleGroup
              type="single"
              value={deliveryType}
              onValueChange={(v) => v && setDeliveryType(v as DeliveryType)}
              className="grid grid-cols-2 gap-3"
              data-ocid="product.delivery_toggle"
            >
              <ToggleGroupItem
                value={DeliveryType.delivery}
                className="h-16 flex-col gap-1 rounded-xl border-2 data-[state=on]:border-primary data-[state=on]:bg-primary/5 border-border"
              >
                <Truck className="w-5 h-5" />
                <span className="text-xs font-medium">Delivery to me</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value={DeliveryType.pickup}
                className="h-16 flex-col gap-1 rounded-xl border-2 data-[state=on]:border-primary data-[state=on]:bg-primary/5 border-border"
              >
                <Store className="w-5 h-5" />
                <span className="text-xs font-medium">I'll Pickup</span>
              </ToggleGroupItem>
            </ToggleGroup>
            {deliveryType === DeliveryType.pickup && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Pickup from: {listing.city}, {listing.pincode}
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border px-4 py-4 z-30">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">
              ₹{subtotal}{" "}
              <span className="text-primary">+2% fee ₹{serviceFee}</span>
            </p>
            <p className="font-display font-bold text-2xl text-foreground">
              ₹{total}
            </p>
          </div>
          <Button
            data-ocid="product.buy_button"
            onClick={handleBuyNow}
            disabled={placeOrder.isPending || maxQty === 0}
            className="flex-1 h-12 text-base font-semibold max-w-xs"
          >
            {placeOrder.isPending ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                Placing Order...
              </>
            ) : maxQty === 0 ? (
              "Out of Stock"
            ) : (
              "Proceed to Pay →"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
