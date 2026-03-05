import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";
import AccessControl "authorization/access-control";

module {
  type OldRole = {
    #farmer;
    #consumer;
  };

  type OldUserProfile = {
    name : Text;
    phone : Text;
    pincode : Text;
    city : Text;
    role : OldRole;
    upiId : ?Text;
    upiQrImageId : ?Text;
  };

  type OldFeeState = {
    totalFeesCollected : Nat;
    pendingWithdrawal : Nat;
    withdrawnAmount : Nat;
  };

  type OldOrderStatus = {
    #pending_payment;
    #payment_confirmed;
    #in_delivery;
    #ready_for_pickup;
    #completed;
    #cancelled;
  };

  type OldDeliveryType = {
    #delivery;
    #pickup;
  };

  type OldOrder = {
    id : Nat;
    listingId : Nat;
    buyer : Principal;
    seller : Principal;
    quantity : Nat;
    totalAmount : Nat;
    status : OldOrderStatus;
    deliveryType : OldDeliveryType;
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

  type OldActor = {
    accessControlState : AccessControl.AccessControlState;
    productListings : Map.Map<Nat, OldProductListing>;
    nextListingId : Nat;
    nextOrderId : Nat;
    orders : Map.Map<Nat, OldOrder>;
    feeState : OldFeeState;
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  type NewRole = {
    #farmer;
    #consumer;
  };

  type NewUserProfile = {
    name : Text;
    phone : Text;
    pincode : Text;
    city : Text;
    role : NewRole;
    upiId : ?Text;
    upiQrImageId : ?Text;
    acceptsCashOnDelivery : Bool;
  };

  type NewFeeState = {
    totalFeesCollected : Nat;
    pendingWithdrawal : Nat;
    withdrawnAmount : Nat;
  };

  type NewOrderStatus = {
    #pending_payment;
    #payment_confirmed;
    #in_delivery;
    #ready_for_pickup;
    #completed;
    #cancelled;
  };

  type NewDeliveryType = {
    #delivery;
    #pickup;
  };

  type NewOrder = {
    id : Nat;
    listingId : Nat;
    buyer : Principal;
    seller : Principal;
    quantity : Nat;
    totalAmount : Nat;
    status : NewOrderStatus;
    deliveryType : NewDeliveryType;
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

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    productListings : Map.Map<Nat, NewProductListing>;
    nextListingId : Nat;
    nextOrderId : Nat;
    orders : Map.Map<Nat, NewOrder>;
    feeState : NewFeeState;
    userProfiles : Map.Map<Principal, NewUserProfile>;
  };

  // Transform old actor state to new one
  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_principal, oldProfile) {
        { oldProfile with acceptsCashOnDelivery = false };
      }
    );
    { old with userProfiles = newUserProfiles };
  };
};
