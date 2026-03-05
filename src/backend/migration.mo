import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import AccessControl "authorization/access-control";

module {
  // Types from old version
  type UserRole = {
    #farmer;
    #consumer;
  };

  type OrderStatus = {
    #pending_payment;
    #payment_confirmed;
    #in_delivery;
    #ready_for_pickup;
    #completed;
    #cancelled;
  };

  type DeliveryType = {
    #delivery;
    #pickup;
  };

  type OldUserProfile = {
    name : Text;
    phone : Text;
    pincode : Text;
    city : Text;
    role : UserRole;
    upiId : ?Text;
    upiQrImageId : ?Text;
  };

  type OldProductListing = {
    id : Nat;
    farmer : Principal;
    title : Text;
    description : Text;
    price : Nat;
    quantity : Nat;
    unit : Text;
    pincode : Text;
    city : Text;
    imageId : ?Text;
    active : Bool;
  };

  type OldOrder = {
    id : Nat;
    listingId : Nat;
    buyer : Principal;
    seller : Principal;
    quantity : Nat;
    totalAmount : Nat;
    status : OrderStatus;
    deliveryType : DeliveryType;
    upiRef : ?Text;
    timestamp : Time.Time;
    platformFee : Nat;
    sellerAmount : Nat;
  };

  type OldFeeState = {
    totalFeesCollected : Nat;
    pendingWithdrawal : Nat;
    withdrawnAmount : Nat;
  };

  type OldActor = {
    accessControlState : AccessControl.AccessControlState;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    productListings : Map.Map<Nat, OldProductListing>;
    nextListingId : Nat;
    nextOrderId : Nat;
    orders : Map.Map<Nat, OldOrder>;
    feeState : OldFeeState;
  };

  // Types from new version
  type NewUserProfile = {
    name : Text;
    phone : Text;
    pincode : Text;
    city : Text;
    role : UserRole;
    upiId : ?Text;
    upiQrImageId : ?Text;
  };

  type NewProductListing = {
    id : Nat;
    farmer : Principal;
    title : Text;
    description : Text;
    price : Nat;
    quantity : Nat;
    unit : Text;
    pincode : Text;
    city : Text;
    imageId : ?Text;
    active : Bool;
  };

  type NewOrder = {
    id : Nat;
    listingId : Nat;
    buyer : Principal;
    seller : Principal;
    quantity : Nat;
    totalAmount : Nat;
    status : OrderStatus;
    deliveryType : DeliveryType;
    upiRef : ?Text;
    timestamp : Time.Time;
    platformFee : Nat;
    sellerAmount : Nat;
    sellerLat : ?Float;
    sellerLng : ?Float;
    buyerLat : ?Float;
    buyerLng : ?Float;
    sellerLocationUpdatedAt : ?Time.Time;
    buyerLocationUpdatedAt : ?Time.Time;
  };

  type NewFeeState = {
    totalFeesCollected : Nat;
    pendingWithdrawal : Nat;
    withdrawnAmount : Nat;
  };

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    userProfiles : Map.Map<Principal, NewUserProfile>;
    productListings : Map.Map<Nat, NewProductListing>;
    nextListingId : Nat;
    nextOrderId : Nat;
    orders : Map.Map<Nat, NewOrder>;
    feeState : NewFeeState;
  };

  // Migration function
  public func run(old : OldActor) : NewActor {
    let newOrders = old.orders.map<Nat, OldOrder, NewOrder>(
      func(_id, oldOrder) {
        {
          oldOrder with
          sellerLat = null;
          sellerLng = null;
          buyerLat = null;
          buyerLng = null;
          sellerLocationUpdatedAt = null;
          buyerLocationUpdatedAt = null;
        };
      }
    );
    { old with orders = newOrders };
  };
};
