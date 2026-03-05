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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import {
  ClipboardList,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { AppView } from "../App";
import type { Order, ProductListing, UserProfile } from "../backend.d";
import { DeliveryType, OrderStatus } from "../backend.d";
import AddProductForm from "../components/AddProductForm";
import OrderStatusBadge from "../components/OrderStatusBadge";
import ProfileEditor from "../components/ProfileEditor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useDeactivateListing,
  useDeleteListing,
  useGetFarmerListings,
  useGetSellerOrders,
  useGetUserProfile,
  useSaveCallerUserProfile,
} from "../hooks/useQueries";

interface FarmerDashboardProps {
  profile: UserProfile;
  initialTab?: string;
  navigate: (v: AppView) => void;
}

export default function FarmerDashboard({
  profile,
  initialTab,
  navigate,
}: FarmerDashboardProps) {
  const [activeTab, setActiveTab] = useState(initialTab ?? "listings");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingListing, setEditingListing] = useState<ProductListing | null>(
    null,
  );

  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const { data: listings, isLoading: listingsLoading } = useGetFarmerListings();
  const { data: orders, isLoading: ordersLoading } = useGetSellerOrders();
  const deactivate = useDeactivateListing();
  const deleteListing = useDeleteListing();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handleDeactivate = async (id: bigint) => {
    try {
      await deactivate.mutateAsync(id);
      toast.success("Listing deactivated");
    } catch {
      toast.error("Failed to deactivate listing");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteListing.mutateAsync(id);
      toast.success("Listing deleted");
    } catch {
      toast.error("Failed to delete listing");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <span className="font-display font-bold text-foreground">
                FarmDirect
              </span>
              <span className="ml-2 text-xs text-muted-foreground">Farmer</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              👋 {profile.name}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full mb-6">
            <TabsTrigger
              value="listings"
              data-ocid="farmer.listings_tab"
              className="gap-1.5"
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">My Listings</span>
              <span className="sm:hidden">Listings</span>
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              data-ocid="farmer.orders_tab"
              className="gap-1.5"
            >
              <ClipboardList className="w-4 h-4" />
              Orders
              {orders && orders.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {orders.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              data-ocid="farmer.profile_tab"
              className="gap-1.5"
            >
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* My Listings */}
          <TabsContent value="listings">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold">My Products</h2>
              <Button
                data-ocid="farmer.add_listing_button"
                onClick={() => {
                  setEditingListing(null);
                  setShowAddForm(true);
                }}
                className="gap-1.5"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </div>

            {listingsLoading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            ) : !listings || listings.length === 0 ? (
              <div
                data-ocid="farmer.listing.empty_state"
                className="text-center py-16 bg-card rounded-xl border border-dashed border-border"
              >
                <div className="text-4xl mb-3">🌱</div>
                <h3 className="font-semibold text-foreground mb-1">
                  No products yet
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Start by adding your first product
                </p>
                <Button
                  data-ocid="farmer.add_listing_button"
                  onClick={() => setShowAddForm(true)}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Product
                </Button>
              </div>
            ) : (
              <div className="grid gap-3">
                {listings.map((listing, idx) => (
                  <FarmerListingCard
                    key={listing.id.toString()}
                    listing={listing}
                    index={idx + 1}
                    onEdit={() => {
                      setEditingListing(listing);
                      setShowAddForm(true);
                    }}
                    onDeactivate={() => handleDeactivate(listing.id)}
                    onDelete={() => handleDelete(listing.id)}
                    isDeactivating={deactivate.isPending}
                    isDeleting={deleteListing.isPending}
                    navigate={navigate}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Orders */}
          <TabsContent value="orders">
            <h2 className="font-display text-xl font-bold mb-4">
              Incoming Orders
            </h2>
            {ordersLoading ? (
              <div className="grid gap-4">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-28 rounded-xl" />
                ))}
              </div>
            ) : !orders || orders.length === 0 ? (
              <div
                data-ocid="farmer.orders.empty_state"
                className="text-center py-16 bg-card rounded-xl border border-dashed border-border"
              >
                <div className="text-4xl mb-3">📦</div>
                <h3 className="font-semibold text-foreground mb-1">
                  No orders yet
                </h3>
                <p className="text-muted-foreground text-sm">
                  Orders will appear here once consumers buy your products
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {orders.map((order, idx) => (
                  <SellerOrderCard
                    key={order.id.toString()}
                    order={order}
                    index={idx + 1}
                    navigate={navigate}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Profile */}
          <TabsContent value="profile">
            <ProfileEditor profile={profile} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {showAddForm && (
          <AddProductForm
            existingListing={editingListing}
            onClose={() => {
              setShowAddForm(false);
              setEditingListing(null);
            }}
            onSuccess={() => {
              setShowAddForm(false);
              setEditingListing(null);
            }}
            farmerCity={profile.city}
            farmerPincode={profile.pincode}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Farmer Listing Card ───────────────────────────────────────────────────────

interface FarmerListingCardProps {
  listing: ProductListing;
  index: number;
  onEdit: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
  isDeactivating: boolean;
  isDeleting: boolean;
  navigate: (v: AppView) => void;
}

function FarmerListingCard({
  listing,
  index,
  onEdit,
  onDeactivate,
  onDelete,
  isDeactivating,
  isDeleting,
}: FarmerListingCardProps) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  // Load image from blob storage if imageId exists
  useEffect(() => {
    if (listing.imageId) {
      import("../backend")
        .then(({ ExternalBlob }) => {
          const url = ExternalBlob.fromURL(listing.imageId!).getDirectURL();
          setImgUrl(url);
        })
        .catch(() => {});
    }
  }, [listing.imageId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      data-ocid={`farmer.listing.item.${index}`}
      className="bg-card rounded-xl border border-border shadow-card flex gap-3 p-4"
    >
      {/* Image thumbnail */}
      <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            🌾
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground text-sm truncate">
              {listing.title}
            </h3>
            <p className="text-primary font-bold text-sm">
              ₹{Number(listing.price)}/{listing.unit}
            </p>
            <p className="text-muted-foreground text-xs">
              Qty: {Number(listing.quantity)} {listing.unit} · {listing.city}
            </p>
          </div>
          <Badge
            className={`flex-shrink-0 text-xs ${listing.active ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}
            variant="outline"
          >
            {listing.active ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="h-7 text-xs px-2"
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDeactivate}
            disabled={isDeactivating}
            className="h-7 text-xs px-2"
            data-ocid={`farmer.listing.toggle.${index}`}
          >
            {isDeactivating ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : listing.active ? (
              <EyeOff className="w-3 h-3" />
            ) : (
              <Eye className="w-3 h-3" />
            )}
            {listing.active ? " Deactivate" : " Activate"}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2 text-destructive hover:text-destructive"
                data-ocid={`farmer.listing.delete_button.${index}`}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent data-ocid="farmer.listing.dialog">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Listing?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove "{listing.title}" from your
                  listings.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-ocid="farmer.listing.cancel_button">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  data-ocid="farmer.listing.confirm_button"
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : null}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </motion.div>
  );
}

// ── Seller Order Card ─────────────────────────────────────────────────────────

interface SellerOrderCardProps {
  order: Order;
  index: number;
  navigate: (v: AppView) => void;
}

function SellerOrderCard({ order, index, navigate }: SellerOrderCardProps) {
  const { data: buyerProfile } = useGetUserProfile(order.buyer.toString());

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      data-ocid={`farmer.order.item.${index}`}
      className="bg-card rounded-xl border border-border shadow-card p-4"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <span className="text-xs text-muted-foreground">
            Order #{order.id.toString()}
          </span>
          <h3 className="font-semibold text-foreground text-sm">
            Buyer: {buyerProfile?.name ?? "Loading..."}
          </h3>
          <p className="text-muted-foreground text-xs">
            {buyerProfile?.city} · {buyerProfile?.phone}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm">
            <span className="text-muted-foreground">Qty:</span>{" "}
            <span className="font-medium">{Number(order.quantity)}</span>
          </p>
          <p className="text-primary font-bold">₹{Number(order.totalAmount)}</p>
          <Badge variant="outline" className="text-xs mt-1">
            {order.deliveryType === DeliveryType.delivery
              ? "🚚 Delivery"
              : "📍 Pickup"}
          </Badge>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            navigate({ page: "order-tracking", orderId: order.id })
          }
          data-ocid={`farmer.order.track_button.${index}`}
        >
          Manage
        </Button>
      </div>
    </motion.div>
  );
}
