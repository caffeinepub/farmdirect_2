import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Banknote,
  CreditCard,
  Hash,
  Loader2,
  MapPin,
  Phone,
  Sprout,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { AppView } from "../App";
import { Role } from "../backend.d";
import LanguageToggle from "../components/LanguageToggle";
import { useLanguage } from "../contexts/LanguageContext";
import { useSaveCallerUserProfile } from "../hooks/useQueries";

interface OnboardingPageProps {
  preSelectedRole: "farmer" | "consumer";
  navigate: (v: AppView) => void;
}

export default function OnboardingPage({
  preSelectedRole,
  navigate,
}: OnboardingPageProps) {
  const { t } = useLanguage();
  const [role, setRole] = useState<"farmer" | "consumer">(preSelectedRole);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [upiId, setUpiId] = useState("");
  const [acceptsCashOnDelivery, setAcceptsCashOnDelivery] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const saveProfile = useSaveCallerUserProfile();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!/^\d{10}$/.test(phone))
      e.phone = "Enter a valid 10-digit phone number";
    if (!city.trim()) e.city = "City is required";
    if (!/^\d{6}$/.test(pincode)) e.pincode = "Enter a valid 6-digit pincode";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        phone: phone.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        role: role === "farmer" ? Role.farmer : Role.consumer,
        upiId: upiId.trim() || undefined,
        acceptsCashOnDelivery:
          role === "farmer" ? acceptsCashOnDelivery : false,
      });
      toast.success("Profile created! Welcome to FarmDirect 🌱");
      navigate({
        page: role === "farmer" ? "farmer-dashboard" : "consumer-home",
      });
    } catch (_err) {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8 relative">
          {/* Language toggle in top-right */}
          <div className="absolute right-0 top-0">
            <LanguageToggle />
          </div>

          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sprout className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            {t("welcome_to_farmdirect")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("setup_your_profile")}
          </p>
        </div>

        {/* Role selection */}
        <div className="mb-6" data-ocid="onboarding.role_select">
          <Label className="text-sm font-medium text-foreground mb-3 block">
            {t("i_am_a")}
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("farmer")}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                role === "farmer"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <div className="text-2xl mb-1">🌾</div>
              <div className="font-semibold text-sm">{t("farmer")}</div>
              <div className="text-muted-foreground text-xs">
                {t("i_sell_produce")}
              </div>
            </button>
            <button
              type="button"
              onClick={() => setRole("consumer")}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                role === "consumer"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <div className="text-2xl mb-1">🛒</div>
              <div className="font-semibold text-sm">{t("consumer")}</div>
              <div className="text-muted-foreground text-xs">
                {t("i_buy_produce")}
              </div>
            </button>
          </div>
        </div>

        {/* Profile form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium mb-1.5 block">
              <User className="w-4 h-4 inline mr-1.5" />
              {t("full_name")}
            </Label>
            <Input
              id="name"
              data-ocid="onboarding.name_input"
              placeholder="e.g. Rajesh Kumar"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: "" }));
              }}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p
                className="text-destructive text-xs mt-1"
                data-ocid="onboarding.name_error"
              >
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm font-medium mb-1.5 block">
              <Phone className="w-4 h-4 inline mr-1.5" />
              {t("phone_number")}
            </Label>
            <Input
              id="phone"
              data-ocid="onboarding.phone_input"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                setErrors((prev) => ({ ...prev, phone: "" }));
              }}
              type="tel"
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && (
              <p
                className="text-destructive text-xs mt-1"
                data-ocid="onboarding.phone_error"
              >
                {errors.phone}
              </p>
            )}
          </div>

          {/* UPI ID + COD — farmers only */}
          {role === "farmer" && (
            <>
              <div>
                <Label
                  htmlFor="upiId"
                  className="text-sm font-medium mb-1.5 block"
                >
                  <CreditCard className="w-4 h-4 inline mr-1.5" />
                  {t("upi_id_for_receiving")}
                </Label>
                <Input
                  id="upiId"
                  data-ocid="onboarding.upi_input"
                  placeholder="e.g. farmer@upi or 9999999999@gpay"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
                <p className="text-muted-foreground text-xs mt-1">
                  Optional — consumers will pay directly to this UPI ID
                </p>
              </div>

              {/* Cash on Delivery toggle */}
              <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <Banknote className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground leading-none">
                      Accept Cash on Delivery
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Buyers can pay cash when they receive the product
                    </p>
                  </div>
                </div>
                <Switch
                  id="acceptsCod"
                  data-ocid="onboarding.cod_switch"
                  checked={acceptsCashOnDelivery}
                  onCheckedChange={setAcceptsCashOnDelivery}
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="city" className="text-sm font-medium mb-1.5 block">
              <MapPin className="w-4 h-4 inline mr-1.5" />
              {t("city")}
            </Label>
            <Input
              id="city"
              data-ocid="onboarding.city_input"
              placeholder="e.g. Pune"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setErrors((prev) => ({ ...prev, city: "" }));
              }}
              className={errors.city ? "border-destructive" : ""}
            />
            {errors.city && (
              <p
                className="text-destructive text-xs mt-1"
                data-ocid="onboarding.city_error"
              >
                {errors.city}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="pincode"
              className="text-sm font-medium mb-1.5 block"
            >
              <Hash className="w-4 h-4 inline mr-1.5" />
              {t("pincode")}
            </Label>
            <Input
              id="pincode"
              data-ocid="onboarding.pincode_input"
              placeholder="6-digit pincode"
              value={pincode}
              onChange={(e) => {
                setPincode(e.target.value.replace(/\D/g, "").slice(0, 6));
                setErrors((prev) => ({ ...prev, pincode: "" }));
              }}
              type="text"
              inputMode="numeric"
              className={errors.pincode ? "border-destructive" : ""}
            />
            {errors.pincode && (
              <p
                className="text-destructive text-xs mt-1"
                data-ocid="onboarding.pincode_error"
              >
                {errors.pincode}
              </p>
            )}
          </div>

          <Button
            type="submit"
            data-ocid="onboarding.submit_button"
            className="w-full h-12 text-base font-semibold mt-2"
            disabled={saveProfile.isPending}
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up profile...
              </>
            ) : role === "farmer" ? (
              `${t("continue_as_farmer")} 🌾`
            ) : (
              `${t("continue_as_consumer")} 🛒`
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
