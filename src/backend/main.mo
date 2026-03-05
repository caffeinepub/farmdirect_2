import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Time "mo:core/Time";

import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  type Role = {
    #farmer;
    #consumer;
  };

  type UserProfile = {
    name : Text;
    phone : Text;
    pincode : Text;
    city : Text;
    role : Role;
  };

  type ProductListing = {
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

  type Order = {
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
  };

  // State
  let userProfiles = Map.empty<Principal, UserProfile>();
  let productListings = Map.empty<Nat, ProductListing>();
  var nextListingId = 1;
  var nextOrderId = 1;
  let orders = Map.empty<Nat, Order>();

  // User Profiles
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  // Product Listings
  public shared ({ caller }) func createProductListing(listingInput : ProductListing) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create listings");
    };

    switch (userProfiles.get(caller)) {
      case (?profile) {
        if (profile.role != #farmer) {
          Runtime.trap("Only farmers can create product listings");
        };
      };
      case (null) { Runtime.trap("You must have a profile first") };
    };

    let listing : ProductListing = {
      id = nextListingId;
      farmer = caller;
      title = listingInput.title;
      description = listingInput.description;
      price = listingInput.price;
      quantity = listingInput.quantity;
      unit = listingInput.unit;
      pincode = listingInput.pincode;
      city = listingInput.city;
      imageId = listingInput.imageId;
      active = true;
    };

    productListings.add(nextListingId, listing);
    nextListingId += 1;
    listing.id;
  };

  public query ({ caller }) func getListing(listingId : Nat) : async ?ProductListing {
    // Public read access - no auth check needed
    productListings.get(listingId);
  };

  public query ({ caller }) func getAllActiveListings() : async [ProductListing] {
    // Public read access - no auth check needed
    productListings.values().toArray().filter(
      func(listing) {
        listing.active
      }
    );
  };

  public query ({ caller }) func getListingsByPincode(pincode : Text) : async [ProductListing] {
    // Public read access - no auth check needed
    productListings.values().toArray().filter(
      func(listing) {
        listing.active and listing.pincode == pincode;
      }
    );
  };

  public query ({ caller }) func getListingsByCity(city : Text) : async [ProductListing] {
    // Public read access - no auth check needed
    productListings.values().toArray().filter(
      func(listing) {
        listing.active and listing.city == city;
      }
    );
  };

  public shared ({ caller }) func deactivateListing(listingId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can deactivate listings");
    };

    switch (productListings.get(listingId)) {
      case (?listing) {
        if (listing.farmer != caller) {
          Runtime.trap("Only the farmer who created the listing can deactivate it");
        };

        let updatedListing : ProductListing = {
          listing with active = false
        };
        productListings.add(listingId, updatedListing);
      };
      case (null) {
        Runtime.trap("Listing does not exist");
      };
    };
  };

  public shared ({ caller }) func deleteListing(listingId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete listings");
    };

    switch (productListings.get(listingId)) {
      case (?listing) {
        if (listing.farmer != caller) {
          Runtime.trap("Only the farmer who created the listing can delete it");
        };
        productListings.remove(listingId);
      };
      case (null) {
        Runtime.trap("Listing does not exist");
      };
    };
  };

  // Orders
  public shared ({ caller }) func placeOrder(listingId : Nat, quantity : Nat, deliveryType : DeliveryType) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };

    let listing = switch (productListings.get(listingId)) {
      case (?l) { l };
      case (null) { Runtime.trap("Listing does not exist") };
    };

    let order : Order = {
      id = nextOrderId;
      listingId;
      buyer = caller;
      seller = listing.farmer;
      quantity;
      totalAmount = listing.price * quantity;
      status = #pending_payment;
      deliveryType;
      upiRef = null;
      timestamp = Time.now();
    };

    orders.add(nextOrderId, order);
    nextOrderId += 1;
    order.id;
  };

  public shared ({ caller }) func confirmPayment(orderId : Nat, upiRef : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can confirm payment");
    };

    switch (orders.get(orderId)) {
      case (?order) {
        if (order.buyer != caller) {
          Runtime.trap("Only the buyer can confirm payment");
        };
        if (order.status != #pending_payment) {
          Runtime.trap("Order is not in pending payment status");
        };

        let updatedOrder : Order = {
          order with
          status = #payment_confirmed;
          upiRef = ?upiRef;
        };

        orders.add(orderId, updatedOrder);

        // Update product listing quantity
        switch (productListings.get(order.listingId)) {
          case (?listing) {
            let updatedListing : ProductListing = {
              listing with quantity = listing.quantity - order.quantity
            };
            productListings.add(order.listingId, updatedListing);
          };
          case (null) {};
        };
      };
      case (null) {
        Runtime.trap("Order does not exist");
      };
    };
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update order status");
    };

    switch (orders.get(orderId)) {
      case (?order) {
        if (order.seller != caller) {
          Runtime.trap("Only the seller can update order status");
        };
        let updatedOrder : Order = {
          order with status
        };
        orders.add(orderId, updatedOrder);
      };
      case (null) {
        Runtime.trap("Order does not exist");
      };
    };
  };

  public query ({ caller }) func getOrder(orderId : Nat) : async ?Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    switch (orders.get(orderId)) {
      case (?order) {
        // Only buyer, seller, or admin can view the order
        if (order.buyer != caller and order.seller != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        ?order;
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getBuyerOrders(buyer : Principal) : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    // Only the buyer themselves or admin can view buyer orders
    if (caller != buyer and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own orders");
    };

    orders.values().toArray().filter(
      func(order) {
        order.buyer == buyer;
      }
    );
  };

  public query ({ caller }) func getSellerOrders(seller : Principal) : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    // Only the seller themselves or admin can view seller orders
    if (caller != seller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own orders");
    };

    orders.values().toArray().filter(
      func(order) {
        order.seller == seller;
      }
    );
  };

  public query ({ caller }) func getOrdersByStatus(status : OrderStatus) : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view orders by status");
    };

    orders.values().toArray().filter(
      func(order) {
        order.status == status;
      }
    );
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };

    orders.values().toArray();
  };

  public shared ({ caller }) func cancelOrder(orderId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can cancel orders");
    };

    switch (orders.get(orderId)) {
      case (?order) {
        if (order.buyer != caller) {
          Runtime.trap("Only the buyer can cancel the order");
        };
        if (order.status != #pending_payment and order.status != #payment_confirmed) {
          Runtime.trap("Order cannot be cancelled at this stage");
        };

        let updatedOrder : Order = {
          order with status = #cancelled
        };
        orders.add(orderId, updatedOrder);

        // Refund product listing quantity
        if (order.status == #payment_confirmed) {
          switch (productListings.get(order.listingId)) {
            case (?listing) {
              let updatedListing : ProductListing = {
                listing with quantity = listing.quantity + order.quantity;
              };
              productListings.add(order.listingId, updatedListing);
            };
            case (null) {};
          };
        };
      };
      case (null) {
        Runtime.trap("Order does not exist");
      };
    };
  };

  // Listings from FarmDirect
  public query ({ caller }) func getListingsFromFarmDirect() : async [ProductListing] {
    // Public read access - no auth check needed
    productListings.values().toArray().filter(
      func(listing) {
        listing.active;
      }
    );
  };
};
