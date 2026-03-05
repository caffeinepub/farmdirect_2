export type Language = "en" | "ta";

export type TranslationKey =
  | "im_a_farmer"
  | "im_a_consumer"
  | "welcome_to_farmdirect"
  | "setup_your_profile"
  | "full_name"
  | "phone_number"
  | "city"
  | "pincode"
  | "continue_as_farmer"
  | "continue_as_consumer"
  | "upi_id"
  | "payment"
  | "you_pay"
  | "seller_receives"
  | "platform_fee"
  | "pay_now"
  | "order_confirmed"
  | "track_order"
  | "back_to_home"
  | "farm_fresh_directly_to_you"
  | "no_middlemen"
  | "logout"
  | "my_listings"
  | "orders"
  | "profile"
  | "search_by_city_or_pincode"
  | "farmer"
  | "consumer"
  | "i_sell_produce"
  | "i_buy_produce"
  | "i_am_a"
  | "upi_id_for_receiving"
  | "upi_id_for_receiving_ta"
  | "payment_successful"
  | "your_order_confirmed"
  | "amount_paid"
  | "product_amount"
  | "service_fee"
  | "order_id"
  | "paid_to"
  | "upi_ref"
  | "product"
  | "scan_and_pay"
  | "scan_qr_upi"
  | "or_pay_with"
  | "secure_upi_payment"
  | "processing_payment"
  | "please_wait"
  | "paying_to"
  | "back"
  | "browse"
  | "add_product"
  | "my_products"
  | "incoming_orders"
  | "no_products_yet"
  | "no_orders_yet"
  | "founder_panel"
  | "farmdirect"
  | "platform_fees_collected"
  | "pending_withdrawal"
  | "total_withdrawn"
  | "withdraw"
  | "withdraw_to"
  | "amount_to_withdraw"
  | "confirm_withdrawal"
  | "cancel"
  | "all_transactions"
  | "you_receive"
  | "platform_fee_label"
  | "order_number"
  | "buyer"
  | "seller"
  | "qty"
  | "delivery"
  | "pickup"
  | "manage"
  | "total_orders";

type TranslationMap = Record<TranslationKey, string>;

const translations: Record<Language, TranslationMap> = {
  en: {
    im_a_farmer: "I'm a Farmer",
    im_a_consumer: "I'm a Consumer",
    welcome_to_farmdirect: "Welcome to FarmDirect",
    setup_your_profile: "Set up your profile",
    full_name: "Full Name",
    phone_number: "Phone Number",
    city: "City",
    pincode: "Pincode",
    continue_as_farmer: "Continue as Farmer",
    continue_as_consumer: "Continue as Consumer",
    upi_id: "UPI ID",
    payment: "Payment",
    you_pay: "You Pay",
    seller_receives: "Seller Receives",
    platform_fee: "Platform Fee",
    pay_now: "Pay Now",
    order_confirmed: "Order Confirmed",
    track_order: "Track Order",
    back_to_home: "Back to Home",
    farm_fresh_directly_to_you: "Farm Fresh, Directly to You",
    no_middlemen: "No middlemen",
    logout: "Logout",
    my_listings: "My Listings",
    orders: "Orders",
    profile: "Profile",
    search_by_city_or_pincode: "Search by city or pincode",
    farmer: "Farmer",
    consumer: "Consumer",
    i_sell_produce: "I sell produce",
    i_buy_produce: "I buy produce",
    i_am_a: "I am a...",
    upi_id_for_receiving: "UPI ID (for receiving payments)",
    upi_id_for_receiving_ta: "UPI ID (for receiving payments)",
    payment_successful: "Payment Successful!",
    your_order_confirmed: "Your order has been confirmed",
    amount_paid: "Amount Paid",
    product_amount: "Product Amount",
    service_fee: "Service Fee",
    order_id: "Order ID",
    paid_to: "Paid To",
    upi_ref: "UPI Ref",
    product: "Product",
    scan_and_pay: "Scan & Pay",
    scan_qr_upi: "Scan this QR code with any UPI app",
    or_pay_with: "or pay with",
    secure_upi_payment: "100% secure UPI payment",
    processing_payment: "Processing Payment",
    please_wait: "Please wait while we confirm your payment...",
    paying_to: "Paying to",
    back: "Back",
    browse: "Browse",
    add_product: "Add Product",
    my_products: "My Products",
    incoming_orders: "Incoming Orders",
    no_products_yet: "No products yet",
    no_orders_yet: "No orders yet",
    founder_panel: "Founder Panel",
    farmdirect: "FarmDirect",
    platform_fees_collected: "Platform Fees Collected",
    pending_withdrawal: "Pending Withdrawal",
    total_withdrawn: "Total Withdrawn",
    withdraw: "Withdraw",
    withdraw_to: "Withdraw to",
    amount_to_withdraw: "Amount to Withdraw",
    confirm_withdrawal: "Confirm Withdrawal",
    cancel: "Cancel",
    all_transactions: "All Transactions",
    you_receive: "You receive",
    platform_fee_label: "Platform fee",
    order_number: "Order #",
    buyer: "Buyer",
    seller: "Seller",
    qty: "Qty",
    delivery: "Delivery",
    pickup: "Pickup",
    manage: "Manage",
    total_orders: "Total Orders",
  },
  ta: {
    im_a_farmer: "நான் ஒரு விவசாயி",
    im_a_consumer: "நான் ஒரு நுகர்வோர்",
    welcome_to_farmdirect: "FarmDirect-க்கு வரவேற்கிறோம்",
    setup_your_profile: "உங்கள் சுயவிவரத்தை அமைக்கவும்",
    full_name: "முழு பெயர்",
    phone_number: "தொலைபேசி எண்",
    city: "நகரம்",
    pincode: "பின்கோடு",
    continue_as_farmer: "விவசாயியாக தொடரவும்",
    continue_as_consumer: "நுகர்வோராக தொடரவும்",
    upi_id: "UPI ID",
    payment: "கட்டணம்",
    you_pay: "நீங்கள் செலுத்துவது",
    seller_receives: "விற்பனையாளர் பெறுவது",
    platform_fee: "தள கட்டணம்",
    pay_now: "இப்போது செலுத்துங்கள்",
    order_confirmed: "ஆர்டர் உறுதிசெய்யப்பட்டது",
    track_order: "ஆர்டரை கண்காணி",
    back_to_home: "முகப்பு பக்கத்திற்கு திரும்பு",
    farm_fresh_directly_to_you: "விவசாயத்தில் இருந்து நேரடியாக உங்களுக்கு",
    no_middlemen: "தரகர்கள் இல்லை",
    logout: "வெளியேறு",
    my_listings: "என் பட்டியல்கள்",
    orders: "ஆர்டர்கள்",
    profile: "சுயவிவரம்",
    search_by_city_or_pincode: "நகரம் அல்லது பின்கோடு மூலம் தேடுங்கள்",
    farmer: "விவசாயி",
    consumer: "நுகர்வோர்",
    i_sell_produce: "நான் விளைபொருட்கள் விற்கிறேன்",
    i_buy_produce: "நான் விளைபொருட்கள் வாங்குகிறேன்",
    i_am_a: "நான் ஒரு...",
    upi_id_for_receiving: "UPI ID (கட்டணம் பெற)",
    upi_id_for_receiving_ta: "UPI ID (கட்டணம் பெற)",
    payment_successful: "கட்டணம் வெற்றிகரமாக முடிந்தது!",
    your_order_confirmed: "உங்கள் ஆர்டர் உறுதிசெய்யப்பட்டது",
    amount_paid: "செலுத்திய தொகை",
    product_amount: "பொருட்களின் தொகை",
    service_fee: "சேவை கட்டணம்",
    order_id: "ஆர்டர் எண்",
    paid_to: "செலுத்தியவர்",
    upi_ref: "UPI குறிப்பு",
    product: "பொருள்",
    scan_and_pay: "ஸ்கேன் செய்து செலுத்துங்கள்",
    scan_qr_upi: "எந்த UPI பயன்பாட்டிலும் QR குறியீட்டை ஸ்கேன் செய்யவும்",
    or_pay_with: "அல்லது இதன் மூலம் செலுத்துங்கள்",
    secure_upi_payment: "100% பாதுகாப்பான UPI கட்டணம்",
    processing_payment: "கட்டணம் செயலாக்கப்படுகிறது",
    please_wait: "உங்கள் கட்டணத்தை உறுதிப்படுத்தும் வரை காத்திருக்கவும்...",
    paying_to: "செலுத்துவது",
    back: "திரும்பு",
    browse: "உலாவுக",
    add_product: "பொருள் சேர்",
    my_products: "என் பொருட்கள்",
    incoming_orders: "வரும் ஆர்டர்கள்",
    no_products_yet: "இன்னும் பொருட்கள் இல்லை",
    no_orders_yet: "இன்னும் ஆர்டர்கள் இல்லை",
    founder_panel: "நிறுவனர் பலகை",
    farmdirect: "FarmDirect",
    platform_fees_collected: "திரட்டப்பட்ட தள கட்டணங்கள்",
    pending_withdrawal: "நிலுவையில் உள்ள திரும்பப்பெறல்",
    total_withdrawn: "மொத்த திரும்பப்பெற்றது",
    withdraw: "திரும்பப்பெறு",
    withdraw_to: "இதற்கு திரும்பப்பெறு",
    amount_to_withdraw: "திரும்பப்பெற வேண்டிய தொகை",
    confirm_withdrawal: "திரும்பப்பெறலை உறுதிப்படுத்தவும்",
    cancel: "ரத்து செய்",
    all_transactions: "அனைத்து பரிவர்த்தனைகள்",
    you_receive: "நீங்கள் பெறுவது",
    platform_fee_label: "தள கட்டணம்",
    order_number: "ஆர்டர் #",
    buyer: "வாங்குபவர்",
    seller: "விற்பவர்",
    qty: "அளவு",
    delivery: "டெலிவரி",
    pickup: "எடுத்துச் செல்",
    manage: "நிர்வகி",
    total_orders: "மொத்த ஆர்டர்கள்",
  },
};

export default translations;
