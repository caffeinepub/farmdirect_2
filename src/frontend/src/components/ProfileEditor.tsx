import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { Hash, Loader2, LogOut, MapPin, Phone, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSaveCallerUserProfile } from "../hooks/useQueries";

interface ProfileEditorProps {
  profile: UserProfile;
}

export default function ProfileEditor({ profile }: ProfileEditorProps) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const saveProfile = useSaveCallerUserProfile();

  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [city, setCity] = useState(profile.city);
  const [pincode, setPincode] = useState(profile.pincode);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveProfile.mutateAsync({
        ...profile,
        name: name.trim(),
        phone: phone.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
      });
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-card rounded-xl border border-border shadow-card p-6 mb-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-bold text-foreground">
              {profile.name}
            </h3>
            <p className="text-xs text-muted-foreground capitalize">
              {profile.role} Account
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label htmlFor="pname" className="text-sm font-medium mb-1.5 block">
              <User className="w-3.5 h-3.5 inline mr-1" />
              Name
            </Label>
            <Input
              id="pname"
              data-ocid="profile.name_input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label
              htmlFor="pphone"
              className="text-sm font-medium mb-1.5 block"
            >
              <Phone className="w-3.5 h-3.5 inline mr-1" />
              Phone
            </Label>
            <Input
              id="pphone"
              data-ocid="profile.phone_input"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              type="tel"
            />
          </div>
          <div>
            <Label htmlFor="pcity" className="text-sm font-medium mb-1.5 block">
              <MapPin className="w-3.5 h-3.5 inline mr-1" />
              City
            </Label>
            <Input
              id="pcity"
              data-ocid="profile.city_input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="ppin" className="text-sm font-medium mb-1.5 block">
              <Hash className="w-3.5 h-3.5 inline mr-1" />
              Pincode
            </Label>
            <Input
              id="ppin"
              data-ocid="profile.pincode_input"
              value={pincode}
              onChange={(e) =>
                setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              type="text"
              inputMode="numeric"
            />
          </div>
          <Button
            type="submit"
            data-ocid="profile.save_button"
            className="w-full"
            disabled={saveProfile.isPending}
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </div>

      <Button
        variant="outline"
        className="w-full text-destructive hover:text-destructive"
        onClick={handleLogout}
        data-ocid="profile.logout_button"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
}
