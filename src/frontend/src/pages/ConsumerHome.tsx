import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import {
  ClipboardList,
  LogOut,
  MapPin,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { AppView } from "../App";
import type { Order, ProductListing, UserProfile } from "../backend.d";
import OrderStatusBadge from "../components/OrderStatusBadge";
import ProductImage from "../components/ProductImage";
import ProfileEditor from "../components/ProfileEditor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetAllActiveListings,
  useGetBuyerOrders,
  useGetListingsBySearch,
} from "../hooks/useQueries";

interface ConsumerHomeProps {
  profile: UserProfile;
  navigate: (v: AppView) => void;
}

export default function ConsumerHome({ profile, navigate }: ConsumerHomeProps) {
  const [activeTab, setActiveTab] = useState("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { data: allListings, isLoading: allLoading } =
    useGetAllActiveListings();
  const { data: searchResults, isLoading: searchLoading } =
    useGetListingsBySearch(debouncedSearch);
  const { data: orders, isLoading: ordersLoading } = useGetBuyerOrders();

  const listings = debouncedSearch ? searchResults : allListings;
  const isLoading = debouncedSearch ? searchLoading : allLoading;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">
              FarmDirect
            </span>
          </div>

          {/* Founder badge */}
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/8 border border-primary/15"
            data-ocid="header.founder.card"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary/30 flex-shrink-0">
              <img
                src="/assets/uploads/IMG_20260207_004605-1.jpg"
                alt="Ranjith S – Founder"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="hidden sm:block leading-none">
              <p className="text-[11px] font-bold text-foreground tracking-wide">
                RANJITH S
              </p>
              <p className="text-[10px] text-primary font-medium">Founder</p>
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
              value="browse"
              data-ocid="consumer.browse_tab"
              className="gap-1.5"
            >
              <ShoppingBag className="w-4 h-4" />
              Browse
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              data-ocid="consumer.orders_tab"
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
              data-ocid="consumer.profile_tab"
              className="gap-1.5"
            >
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Browse */}
          <TabsContent value="browse">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                data-ocid="consumer.search_input"
                placeholder="Search by city or pincode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 h-12 text-base"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {debouncedSearch && (
              <p className="text-sm text-muted-foreground mb-4">
                Results for "
                <span className="text-foreground font-medium">
                  {debouncedSearch}
                </span>
                "
              </p>
            )}

            {isLoading ? (
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-52 rounded-xl" />
                ))}
              </div>
            ) : !listings || listings.length === 0 ? (
              <div
                data-ocid="consumer.products.empty_state"
                className="text-center py-16 bg-card rounded-xl border border-dashed border-border"
              >
                <div className="text-4xl mb-3">
                  {debouncedSearch ? "🔍" : "🌱"}
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  {debouncedSearch
                    ? "No results found"
                    : "No products available"}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {debouncedSearch
                    ? "Try searching with a different city or pincode"
                    : "Check back soon for fresh produce near you"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {listings.map((listing, idx) => (
                  <ProductCard
                    key={listing.id.toString()}
                    listing={listing}
                    index={idx + 1}
                    onClick={() =>
                      navigate({
                        page: "product-detail",
                        listingId: listing.id,
                      })
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Orders */}
          <TabsContent value="orders">
            <h2 className="font-display text-xl font-bold mb-4">My Orders</h2>
            {ordersLoading ? (
              <div className="grid gap-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-28 rounded-xl" />
                ))}
              </div>
            ) : !orders || orders.length === 0 ? (
              <div
                data-ocid="consumer.orders.empty_state"
                className="text-center py-16 bg-card rounded-xl border border-dashed border-border"
              >
                <div className="text-4xl mb-3">📦</div>
                <h3 className="font-semibold text-foreground mb-1">
                  No orders yet
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Browse products and place your first order
                </p>
                <Button size="sm" onClick={() => setActiveTab("browse")}>
                  Browse Products
                </Button>
              </div>
            ) : (
              <div className="grid gap-3">
                {orders.map((order, idx) => (
                  <ConsumerOrderCard
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

      <footer className="py-6 px-4 border-t border-border text-center mt-8">
        <p className="text-muted-foreground text-xs">
          © {new Date().getFullYear()}. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="text-primary underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

// ── Product Card ──────────────────────────────────────────────────────────────

interface ProductCardProps {
  listing: ProductListing;
  index: number;
  onClick: () => void;
}

function ProductCard({ listing, index, onClick }: ProductCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: (index - 1) * 0.05 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      data-ocid={`consumer.product.item.${index}`}
      onClick={onClick}
      className="bg-card rounded-xl border border-border shadow-card text-left overflow-hidden w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Image */}
      <div className="w-full aspect-square bg-muted overflow-hidden">
        <ProductImage imageId={listing.imageId} title={listing.title} />
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-1">
          {listing.title}
        </h3>
        <p className="text-primary font-bold">
          ₹{Number(listing.price)}
          <span className="text-muted-foreground font-normal text-xs">
            /{listing.unit}
          </span>
        </p>
        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{listing.city}</span>
        </div>
      </div>
    </motion.button>
  );
}

// ── Consumer Order Card ───────────────────────────────────────────────────────

interface ConsumerOrderCardProps {
  order: Order;
  index: number;
  navigate: (v: AppView) => void;
}

function ConsumerOrderCard({ order, index, navigate }: ConsumerOrderCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      data-ocid={`consumer.order.item.${index}`}
      className="bg-card rounded-xl border border-border shadow-card p-4"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <span className="text-xs text-muted-foreground">
            Order #{order.id.toString()}
          </span>
          <p className="font-semibold text-sm text-foreground">
            ₹{Number(order.totalAmount)}
          </p>
          <p className="text-muted-foreground text-xs">
            Qty: {Number(order.quantity)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
      <Button
        size="sm"
        variant="outline"
        className="w-full"
        onClick={() => navigate({ page: "order-tracking", orderId: order.id })}
        data-ocid={`consumer.order.track_button.${index}`}
      >
        Track Order
      </Button>
    </motion.div>
  );
}
