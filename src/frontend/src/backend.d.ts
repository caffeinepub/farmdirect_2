import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
export type Time = bigint;
export interface Order {
    id: bigint;
    status: OrderStatus;
    listingId: bigint;
    deliveryType: DeliveryType;
    seller: Principal;
    upiRef?: string;
    totalAmount: bigint;
    timestamp: Time;
    quantity: bigint;
    buyer: Principal;
}
export interface UserProfile {
    city: string;
    name: string;
    role: Role;
    phone: string;
    pincode: string;
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
    getBuyerOrders(buyer: Principal): Promise<Array<Order>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getListing(listingId: bigint): Promise<ProductListing | null>;
    getListingsByCity(city: string): Promise<Array<ProductListing>>;
    getListingsByPincode(pincode: string): Promise<Array<ProductListing>>;
    getListingsFromFarmDirect(): Promise<Array<ProductListing>>;
    getOrder(orderId: bigint): Promise<Order | null>;
    getOrdersByStatus(status: OrderStatus): Promise<Array<Order>>;
    getSellerOrders(seller: Principal): Promise<Array<Order>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(listingId: bigint, quantity: bigint, deliveryType: DeliveryType): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateOrderStatus(orderId: bigint, status: OrderStatus): Promise<void>;
}
