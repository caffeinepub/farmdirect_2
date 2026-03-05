import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Camera,
  Loader2,
  RotateCcw,
  SwitchCamera,
  Upload,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { ProductListing } from "../backend.d";
import { useCamera } from "../camera/useCamera";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateProductListing } from "../hooks/useQueries";

interface AddProductFormProps {
  existingListing: ProductListing | null;
  onClose: () => void;
  onSuccess: () => void;
  farmerCity: string;
  farmerPincode: string;
}

const UNITS = ["kg", "gram", "dozen", "piece", "litre", "bundle"];

export default function AddProductForm({
  existingListing,
  onClose,
  onSuccess,
  farmerCity,
  farmerPincode,
}: AddProductFormProps) {
  const { identity } = useInternetIdentity();
  const createListing = useCreateProductListing();

  const [mode, setMode] = useState<"form" | "camera">("form");
  const [capturedImage, setCapturedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    existingListing?.imageId ? null : null,
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(existingListing?.title ?? "");
  const [description, setDescription] = useState(
    existingListing?.description ?? "",
  );
  const [price, setPrice] = useState(
    existingListing ? Number(existingListing.price).toString() : "",
  );
  const [quantity, setQuantity] = useState(
    existingListing ? Number(existingListing.quantity).toString() : "",
  );
  const [unit, setUnit] = useState(existingListing?.unit ?? "kg");
  const [city, setCity] = useState(existingListing?.city ?? farmerCity);
  const [pincode, setPincode] = useState(
    existingListing?.pincode ?? farmerPincode,
  );

  const {
    isActive,
    isLoading: cameraLoading,
    error: cameraError,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    videoRef,
    canvasRef,
  } = useCamera({ facingMode: "environment", quality: 0.85 });

  const handleCameraCapture = async () => {
    const file = await capturePhoto();
    if (file) {
      setCapturedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      await stopCamera();
      setMode("form");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCapturedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleOpenCamera = async () => {
    setMode("camera");
    await startCamera();
  };

  const handleCloseCamera = async () => {
    await stopCamera();
    setMode("form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !title.trim() ||
      !price ||
      !quantity ||
      !city.trim() ||
      !pincode.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!identity) {
      toast.error("Not authenticated");
      return;
    }

    try {
      let imageId: string | undefined;

      // Upload image if we have one
      if (capturedImage) {
        setIsUploading(true);
        try {
          const { ExternalBlob } = await import("../backend");
          const data = new Uint8Array(await capturedImage.arrayBuffer());
          const blob = ExternalBlob.fromBytes(data).withUploadProgress(
            (pct) => {
              setUploadProgress(pct);
            },
          );
          const url = blob.getDirectURL();
          // We need to actually upload — trigger the upload
          await blob.getBytes(); // this triggers upload if not cached
          imageId = url;
        } catch (err) {
          console.error("Image upload failed", err);
          toast.error("Image upload failed, continuing without image");
        } finally {
          setIsUploading(false);
        }
      }

      const listing: ProductListing = {
        id: existingListing?.id ?? BigInt(0),
        title: title.trim(),
        description: description.trim(),
        price: BigInt(Math.round(Number.parseFloat(price))),
        quantity: BigInt(Math.round(Number.parseFloat(quantity))),
        unit,
        city: city.trim(),
        pincode: pincode.trim(),
        active: true,
        farmer: identity.getPrincipal(),
        imageId,
      };

      await createListing.mutateAsync(listing);
      toast.success(
        existingListing
          ? "Product updated!"
          : "Product listed successfully! 🌾",
      );
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save product. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm cursor-default"
        onClick={onClose}
        aria-label="Close"
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 w-full sm:max-w-lg bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        data-ocid="farmer.listing_form.modal"
      >
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-display text-lg font-bold">
            {existingListing ? "Edit Product" : "Add New Product"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            data-ocid="farmer.listing_form.close_button"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Camera mode */}
        {mode === "camera" ? (
          <div className="p-4">
            <div
              className="relative rounded-xl overflow-hidden bg-black"
              style={{ aspectRatio: "4/3", minHeight: "240px" }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ minHeight: "240px" }}
              />
              <canvas ref={canvasRef} className="hidden" />
              {cameraLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
              {cameraError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4">
                  <div className="text-center text-white">
                    <p className="font-semibold">Camera Error</p>
                    <p className="text-sm text-white/70 mt-1">
                      {cameraError.message}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                onClick={handleCloseCamera}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-1.5" />
                Cancel
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => switchCamera()}
                disabled={cameraLoading || !isActive}
                title="Switch camera"
              >
                <SwitchCamera className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleCameraCapture}
                disabled={!isActive || cameraLoading}
                className="flex-1"
              >
                <Camera className="w-4 h-4 mr-1.5" />
                Capture
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Image capture */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Product Photo
              </Label>
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-44 object-cover rounded-xl"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setPreviewUrl(null);
                      setCapturedImage(null);
                    }}
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Change
                  </Button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleOpenCamera}
                    data-ocid="farmer.listing_form.upload_button"
                    className="flex-1 border-2 border-dashed border-border rounded-xl p-5 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Camera className="w-6 h-6 text-muted-foreground mx-auto mb-1.5" />
                    <span className="text-sm text-muted-foreground">
                      Take Photo
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 border-2 border-dashed border-border rounded-xl p-5 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    data-ocid="farmer.listing_form.dropzone"
                  >
                    <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-1.5" />
                    <span className="text-sm text-muted-foreground">
                      Upload
                    </span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              )}
              {isUploading && (
                <div className="mt-2">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Uploading image... {uploadProgress}%
                  </p>
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <Label
                htmlFor="title"
                className="text-sm font-medium mb-1.5 block"
              >
                Product Title *
              </Label>
              <Input
                id="title"
                data-ocid="farmer.listing_form.title_input"
                placeholder="e.g. Fresh Organic Tomatoes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label
                htmlFor="desc"
                className="text-sm font-medium mb-1.5 block"
              >
                Description
              </Label>
              <Textarea
                id="desc"
                data-ocid="farmer.listing_form.textarea"
                placeholder="Describe your product — variety, freshness, growing method..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Price + Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label
                  htmlFor="price"
                  className="text-sm font-medium mb-1.5 block"
                >
                  Price (₹) *
                </Label>
                <Input
                  id="price"
                  data-ocid="farmer.listing_form.price_input"
                  placeholder="45"
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value.replace(/[^0-9.]/g, ""))
                  }
                  type="number"
                  min="1"
                  required
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">
                  Unit *
                </Label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger data-ocid="farmer.listing_form.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <Label htmlFor="qty" className="text-sm font-medium mb-1.5 block">
                Available Quantity *
              </Label>
              <Input
                id="qty"
                data-ocid="farmer.listing_form.quantity_input"
                placeholder="e.g. 50"
                value={quantity}
                onChange={(e) =>
                  setQuantity(e.target.value.replace(/[^0-9]/g, ""))
                }
                type="number"
                min="1"
                required
              />
            </div>

            {/* City + Pincode */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label
                  htmlFor="city"
                  className="text-sm font-medium mb-1.5 block"
                >
                  City *
                </Label>
                <Input
                  id="city"
                  data-ocid="farmer.listing_form.city_input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label
                  htmlFor="pin"
                  className="text-sm font-medium mb-1.5 block"
                >
                  Pincode *
                </Label>
                <Input
                  id="pin"
                  data-ocid="farmer.listing_form.pincode_input"
                  value={pincode}
                  onChange={(e) =>
                    setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              data-ocid="farmer.listing_form.submit_button"
              className="w-full h-12 text-base font-semibold"
              disabled={createListing.isPending || isUploading}
            >
              {createListing.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : existingListing ? (
                "Update Product"
              ) : (
                "List Product 🌾"
              )}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
