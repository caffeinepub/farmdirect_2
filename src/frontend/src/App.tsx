import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { LanguageProvider } from "./contexts/LanguageContext";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile, useIsCallerAdmin } from "./hooks/useQueries";
import ConsumerHome from "./pages/ConsumerHome";
import FarmerDashboard from "./pages/FarmerDashboard";
import FounderDashboard from "./pages/FounderDashboard";
import LandingPage from "./pages/LandingPage";
import OnboardingPage from "./pages/OnboardingPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import PaymentPage from "./pages/PaymentPage";
import ProductDetailPage from "./pages/ProductDetailPage";

export type AppView =
  | { page: "landing" }
  | { page: "onboarding"; role: "farmer" | "consumer" }
  | { page: "farmer-dashboard"; tab?: string }
  | { page: "consumer-home" }
  | { page: "product-detail"; listingId: bigint }
  | {
      page: "payment";
      orderId: bigint;
      amount: bigint;
      listingTitle: string;
      sellerPrincipal: string;
    }
  | { page: "order-tracking"; orderId: bigint }
  | { page: "founder-dashboard" };

function AppInner() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();

  const [view, setView] = useState<AppView>({ page: "landing" });
  const [pendingRole, setPendingRole] = useState<"farmer" | "consumer" | null>(
    null,
  );

  const navigate = (v: AppView) => setView(v);

  // Show loading while initializing
  if (isInitializing || (isAuthenticated && profileLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <span className="text-3xl">🌱</span>
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  // Determine routing
  if (!isAuthenticated) {
    return (
      <>
        <LandingPage
          onSelectRole={(role) => {
            setPendingRole(role);
          }}
          onAuthenticated={(role) => {
            setPendingRole(role);
          }}
          navigate={navigate}
        />
        <Toaster richColors />
      </>
    );
  }

  // Authenticated — check if profile exists
  const showOnboarding = isAuthenticated && isFetched && userProfile === null;

  if (showOnboarding || view.page === "onboarding") {
    return (
      <>
        <OnboardingPage
          preSelectedRole={
            pendingRole ?? (view.page === "onboarding" ? view.role : "consumer")
          }
          navigate={navigate}
        />
        <Toaster richColors />
      </>
    );
  }

  // Profile exists — route based on view
  if (!userProfile) {
    return (
      <>
        <OnboardingPage
          preSelectedRole={pendingRole ?? "consumer"}
          navigate={navigate}
        />
        <Toaster richColors />
      </>
    );
  }

  // Founder dashboard – admin only
  if (view.page === "founder-dashboard") {
    return (
      <>
        <FounderDashboard navigate={navigate} />
        <Toaster richColors />
      </>
    );
  }

  const currentView =
    view.page === "landing"
      ? userProfile.role === "farmer"
        ? { page: "farmer-dashboard" as const }
        : { page: "consumer-home" as const }
      : view;

  return (
    <>
      {currentView.page === "farmer-dashboard" && (
        <FarmerDashboard
          profile={userProfile}
          initialTab={
            (currentView as { page: "farmer-dashboard"; tab?: string }).tab
          }
          isAdmin={!!isAdmin}
          navigate={navigate}
        />
      )}
      {currentView.page === "consumer-home" && (
        <ConsumerHome profile={userProfile} navigate={navigate} />
      )}
      {currentView.page === "product-detail" && (
        <ProductDetailPage
          listingId={
            (currentView as { page: "product-detail"; listingId: bigint })
              .listingId
          }
          navigate={navigate}
        />
      )}
      {currentView.page === "payment" && (
        <PaymentPage
          orderId={
            (
              currentView as {
                page: "payment";
                orderId: bigint;
                amount: bigint;
                listingTitle: string;
                sellerPrincipal: string;
              }
            ).orderId
          }
          amount={
            (
              currentView as {
                page: "payment";
                orderId: bigint;
                amount: bigint;
                listingTitle: string;
                sellerPrincipal: string;
              }
            ).amount
          }
          listingTitle={
            (
              currentView as {
                page: "payment";
                orderId: bigint;
                amount: bigint;
                listingTitle: string;
                sellerPrincipal: string;
              }
            ).listingTitle
          }
          sellerPrincipal={
            (
              currentView as {
                page: "payment";
                orderId: bigint;
                amount: bigint;
                listingTitle: string;
                sellerPrincipal: string;
              }
            ).sellerPrincipal
          }
          navigate={navigate}
        />
      )}
      {currentView.page === "order-tracking" && (
        <OrderTrackingPage
          orderId={
            (currentView as { page: "order-tracking"; orderId: bigint }).orderId
          }
          navigate={navigate}
        />
      )}
      <Toaster richColors />
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  );
}
