import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    upiQrImageId?: string;
    city: string;
    name: string;
    role: Role;
    upiId?: string;
    phone: string;
    pincode: string;
    acceptsCashOnDelivery: boolean;
}
export type Time = bigint;
export interface Order {
    id: bigint;
    status: OrderStatus;
    platformFee: bigint;
    listingId: bigint;
    buyerLocationUpdatedAt?: Time;
    deliveryType: DeliveryType;
    seller: Principal;
    sellerLat?: number;
    sellerLng?: number;
    upiRef?: string;
    totalAmount: bigint;
    sellerAmount: bigint;
    timestamp: Time;
    quantity: bigint;
    sellerLocationUpdatedAt?: Time;
    buyerLat?: number;
    buyerLng?: number;
    buyer: Principal;
}
export interface ProductListing {
    id: bigint;
    title: string;
    active: boolean;
    city: string;
    unit: string;
    description: string;
    quantity: bigint;
    imageId?: string;
    pincode: string;
    price: bigint;
    farmer: Principal;
}
export interface PublicUserProfile {
    upiQrImageId?: string;
    city: string;
    name: string;
    role: Role;
    upiId?: string;
    phone: string;
    pincode: string;
    acceptsCashOnDelivery: boolean;
}
export interface FounderStats {
    totalOrders: bigint;
    pendingWithdrawal: bigint;
    totalFeesCollected: bigint;
    withdrawnAmount: bigint;
}
export interface OrderLocations {
    buyerLocationUpdatedAt?: Time;
    sellerLat?: number;
    sellerLng?: number;
    sellerLocationUpdatedAt?: Time;
    buyerLat?: number;
    buyerLng?: number;
}
export interface OrderWithFees {
    order: Order;
    platformFee: bigint;
    sellerAmount: bigint;
}
export enum DeliveryType {
    pickup = "pickup",
    delivery = "delivery"
}
export enum OrderStatus {
    cancelled = "cancelled",
    pending_payment = "pending_payment",
    completed = "completed",
    payment_confirmed = "payment_confirmed",
    in_delivery = "in_delivery",
    ready_for_pickup = "ready_for_pickup"
}
export enum Role {
    consumer = "consumer",
    farmer = "farmer"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelOrder(orderId: bigint): Promise<void>;
    confirmPayment(orderId: bigint, upiRef: string): Promise<void>;
    createProductListing(listingInput: ProductListing): Promise<bigint>;
    deactivateListing(listingId: bigint): Promise<void>;
    deleteListing(listingId: bigint): Promise<void>;
    getAllActiveListings(): Promise<Array<ProductListing>>;
    getAllOrders(): Promise<Array<Order>>;
    getAllOrdersWithFees(): Promise<Array<OrderWithFees>>;
    getBuyerOrders(buyer: Principal): Promise<Array<Order>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFounderStats(): Promise<FounderStats>;
    getListing(listingId: bigint): Promise<ProductListing | null>;
    getListingsByCity(city: string): Promise<Array<ProductListing>>;
    getListingsByPincode(pincode: string): Promise<Array<ProductListing>>;
    getListingsFromFarmDirect(): Promise<Array<ProductListing>>;
    getOrder(orderId: bigint): Promise<Order | null>;
    getOrderLocations(orderId: bigint): Promise<OrderLocations | null>;
    getOrdersByStatus(status: OrderStatus): Promise<Array<Order>>;
    getSellerOrders(seller: Principal): Promise<Array<Order>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserPublicProfile(user: Principal): Promise<PublicUserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(listingId: bigint, quantity: bigint, deliveryType: DeliveryType): Promise<bigint>;
    recordWithdrawal(amount: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateOrderLocation(orderId: bigint, lat: number, lng: number): Promise<void>;
    updateOrderStatus(orderId: bigint, status: OrderStatus): Promise<void>;
}
