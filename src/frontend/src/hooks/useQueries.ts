import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  DeliveryType,
  Order,
  OrderStatus,
  ProductListing,
  UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

// ── User Profile ──────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useGetUserProfile(userPrincipal: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ["userProfile", userPrincipal],
    queryFn: async () => {
      if (!actor || !userPrincipal) return null;
      const { Principal } = await import("@dfinity/principal");
      return actor.getUserProfile(Principal.fromText(userPrincipal));
    },
    enabled: !!actor && !actorFetching && !!userPrincipal,
  });
}

// ── Product Listings ──────────────────────────────────────────────────────────

export function useGetAllActiveListings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ProductListing[]>({
    queryKey: ["allActiveListings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllActiveListings();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetFarmerListings() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<ProductListing[]>({
    queryKey: ["farmerListings", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getListingsFromFarmDirect();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useGetListing(listingId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ProductListing | null>({
    queryKey: ["listing", listingId?.toString()],
    queryFn: async () => {
      if (!actor || listingId === null) return null;
      return actor.getListing(listingId);
    },
    enabled: !!actor && !actorFetching && listingId !== null,
  });
}

export function useGetListingsBySearch(search: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ProductListing[]>({
    queryKey: ["listingsBySearch", search],
    queryFn: async () => {
      if (!actor || !search.trim()) return [];
      const pincode = /^\d{6}$/.test(search.trim());
      if (pincode) {
        return actor.getListingsByPincode(search.trim());
      }
      return actor.getListingsByCity(search.trim());
    },
    enabled: !!actor && !actorFetching && !!search.trim(),
  });
}

export function useCreateProductListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listing: ProductListing) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createProductListing(listing);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmerListings"] });
      queryClient.invalidateQueries({ queryKey: ["allActiveListings"] });
    },
  });
}

export function useDeactivateListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      await actor.deactivateListing(listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmerListings"] });
      queryClient.invalidateQueries({ queryKey: ["allActiveListings"] });
    },
  });
}

export function useDeleteListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      await actor.deleteListing(listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmerListings"] });
      queryClient.invalidateQueries({ queryKey: ["allActiveListings"] });
    },
  });
}

// ── Orders ────────────────────────────────────────────────────────────────────

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listingId,
      quantity,
      deliveryType,
    }: {
      listingId: bigint;
      quantity: bigint;
      deliveryType: DeliveryType;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.placeOrder(listingId, quantity, deliveryType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyerOrders"] });
    },
  });
}

export function useConfirmPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      upiRef,
    }: {
      orderId: bigint;
      upiRef: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.confirmPayment(orderId, upiRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyerOrders"] });
      queryClient.invalidateQueries({ queryKey: ["sellerOrders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: bigint;
      status: OrderStatus;
    }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellerOrders"] });
      queryClient.invalidateQueries({ queryKey: ["buyerOrders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
    },
  });
}

export function useCancelOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      await actor.cancelOrder(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyerOrders"] });
      queryClient.invalidateQueries({ queryKey: ["sellerOrders"] });
    },
  });
}

export function useGetBuyerOrders() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Order[]>({
    queryKey: ["buyerOrders", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getBuyerOrders(identity.getPrincipal());
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useGetSellerOrders() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Order[]>({
    queryKey: ["sellerOrders", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getSellerOrders(identity.getPrincipal());
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useGetOrder(orderId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Order | null>({
    queryKey: ["order", orderId?.toString()],
    queryFn: async () => {
      if (!actor || orderId === null) return null;
      return actor.getOrder(orderId);
    },
    enabled: !!actor && !actorFetching && orderId !== null,
  });
}
