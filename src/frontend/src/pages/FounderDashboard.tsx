import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  BanknoteIcon,
  Loader2,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { AppView } from "../App";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useGetAllOrdersWithFees,
  useGetFounderStats,
  useRecordWithdrawal,
} from "../hooks/useQueries";

interface FounderDashboardProps {
  navigate: (v: AppView) => void;
}

const FOUNDER_NAME = "RANJITH S";
const FOUNDER_UPI = "raceranjith333@okaxis";
const FOUNDER_PHONE = "9751917451";

// Static mock QR for founder
function FounderQR() {
  return (
    <svg
      viewBox="0 0 120 120"
      width="120"
      height="120"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Founder QR Code"
      role="img"
    >
      <title>Founder UPI QR Code</title>
      <rect width="120" height="120" fill="white" rx="6" />
      <rect x="8" y="8" width="30" height="30" rx="2" fill="#1a1a1a" />
      <rect x="13" y="13" width="20" height="20" rx="1" fill="white" />
      <rect x="18" y="18" width="10" height="10" fill="#1a1a1a" />
      <rect x="82" y="8" width="30" height="30" rx="2" fill="#1a1a1a" />
      <rect x="87" y="13" width="20" height="20" rx="1" fill="white" />
      <rect x="92" y="18" width="10" height="10" fill="#1a1a1a" />
      <rect x="8" y="82" width="30" height="30" rx="2" fill="#1a1a1a" />
      <rect x="13" y="87" width="20" height="20" rx="1" fill="white" />
      <rect x="18" y="92" width="10" height="10" fill="#1a1a1a" />
      <rect x="44" y="8" width="5" height="5" fill="#1a1a1a" />
      <rect x="52" y="8" width="5" height="5" fill="#1a1a1a" />
      <rect x="60" y="16" width="5" height="5" fill="#1a1a1a" />
      <rect x="44" y="24" width="5" height="5" fill="#1a1a1a" />
      <rect x="68" y="24" width="5" height="5" fill="#1a1a1a" />
      <rect x="44" y="44" width="5" height="5" fill="#1a1a1a" />
      <rect x="60" y="44" width="5" height="5" fill="#1a1a1a" />
      <rect x="76" y="44" width="5" height="5" fill="#1a1a1a" />
      <rect x="100" y="44" width="5" height="5" fill="#1a1a1a" />
      <rect x="44" y="52" width="5" height="5" fill="#1a1a1a" />
      <rect x="76" y="52" width="5" height="5" fill="#1a1a1a" />
      <rect x="108" y="52" width="5" height="5" fill="#1a1a1a" />
      <rect x="32" y="60" width="5" height="5" fill="#1a1a1a" />
      <rect x="52" y="60" width="5" height="5" fill="#1a1a1a" />
      <rect x="84" y="60" width="5" height="5" fill="#1a1a1a" />
      <rect x="44" y="68" width="5" height="5" fill="#1a1a1a" />
      <rect x="76" y="68" width="5" height="5" fill="#1a1a1a" />
      <rect x="44" y="84" width="5" height="5" fill="#1a1a1a" />
      <rect x="68" y="84" width="5" height="5" fill="#1a1a1a" />
      <rect x="84" y="84" width="5" height="5" fill="#1a1a1a" />
      <rect x="60" y="92" width="5" height="5" fill="#1a1a1a" />
      <rect x="44" y="100" width="5" height="5" fill="#1a1a1a" />
      <rect x="84" y="100" width="5" height="5" fill="#1a1a1a" />
      <rect x="60" y="108" width="5" height="5" fill="#1a1a1a" />
      <rect x="92" y="108" width="5" height="5" fill="#1a1a1a" />
    </svg>
  );
}

export default function FounderDashboard({ navigate }: FounderDashboardProps) {
  const { t } = useLanguage();
  const { data: stats, isLoading: statsLoading } = useGetFounderStats();
  const { data: ordersWithFees, isLoading: ordersLoading } =
    useGetAllOrdersWithFees();
  const recordWithdrawal = useRecordWithdrawal();

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);

  const pendingStr = stats ? Number(stats.pendingWithdrawal).toString() : "0";

  const handleWithdraw = async () => {
    const amount = BigInt(Math.round(Number(withdrawAmount) * 100));
    try {
      await recordWithdrawal.mutateAsync(amount);
      toast.success(`Withdrawal of ₹${withdrawAmount} recorded!`);
      setWithdrawDialogOpen(false);
      setWithdrawAmount("");
    } catch {
      toast.error("Failed to record withdrawal");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ page: "farmer-dashboard" })}
              className="gap-1.5 -ml-2"
              data-ocid="founder.back_button"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <span className="font-display font-bold text-foreground">
                  {t("founder_panel")}
                </span>
                <span className="ml-2 text-xs text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded-full">
                  Admin Only
                </span>
              </div>
            </div>
          </div>

          {/* Founder identity */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary/30">
              <img
                src="/assets/uploads/IMG_20260207_004605-1.jpg"
                alt="Ranjith S"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-foreground">
                {FOUNDER_NAME}
              </p>
              <p className="text-xs text-primary font-mono">{FOUNDER_UPI}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats cards */}
        {statsLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              className="bg-card rounded-2xl border border-border p-5 shadow-card"
              data-ocid="founder.fees.card"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                {t("platform_fees_collected")}
              </p>
              <p className="font-display text-2xl font-bold text-foreground">
                ₹{Number(stats.totalFeesCollected)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-card rounded-2xl border border-border p-5 shadow-card"
              data-ocid="founder.pending.card"
            >
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
                <Wallet className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                {t("pending_withdrawal")}
              </p>
              <p className="font-display text-2xl font-bold text-foreground">
                ₹{Number(stats.pendingWithdrawal)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl border border-border p-5 shadow-card"
              data-ocid="founder.withdrawn.card"
            >
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                <BanknoteIcon className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                {t("total_withdrawn")}
              </p>
              <p className="font-display text-2xl font-bold text-foreground">
                ₹{Number(stats.withdrawnAmount)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-card rounded-2xl border border-border p-5 shadow-card"
              data-ocid="founder.orders.card"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                {t("total_orders")}
              </p>
              <p className="font-display text-2xl font-bold text-foreground">
                {Number(stats.totalOrders)}
              </p>
            </motion.div>
          </div>
        ) : null}

        {/* Withdraw section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl border border-border p-6 mb-8 shadow-card"
          data-ocid="founder.withdraw.panel"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* QR code */}
              <div className="flex-shrink-0 p-2 bg-white rounded-xl border border-border shadow-sm">
                <FounderQR />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground mb-1">
                  {t("withdraw_to")}
                </h3>
                <p className="font-bold text-foreground">{FOUNDER_NAME}</p>
                <p className="text-primary font-mono text-sm">{FOUNDER_UPI}</p>
                <p className="text-muted-foreground text-xs">
                  📞 {FOUNDER_PHONE}
                </p>
              </div>
            </div>

            <Dialog
              open={withdrawDialogOpen}
              onOpenChange={setWithdrawDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  className="gap-2 h-12 px-6"
                  data-ocid="founder.withdraw.open_modal_button"
                  onClick={() => setWithdrawAmount(pendingStr)}
                >
                  <Wallet className="w-4 h-4" />
                  {t("withdraw")}
                </Button>
              </DialogTrigger>
              <DialogContent data-ocid="founder.withdraw.dialog">
                <DialogHeader>
                  <DialogTitle>{t("withdraw")}</DialogTitle>
                  <DialogDescription>
                    {t("withdraw_to")}: <strong>{FOUNDER_NAME}</strong> (
                    {FOUNDER_UPI})
                  </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-white rounded-xl border border-border shadow-sm">
                      <FounderQR />
                    </div>
                  </div>
                  <Label
                    htmlFor="withdraw-amount"
                    className="text-sm font-medium mb-1.5 block"
                  >
                    {t("amount_to_withdraw")} (₹)
                  </Label>
                  <Input
                    id="withdraw-amount"
                    data-ocid="founder.withdraw.input"
                    type="number"
                    min="0"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="text-lg font-bold"
                  />
                  {stats && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("pending_withdrawal")}: ₹
                      {Number(stats.pendingWithdrawal)}
                    </p>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setWithdrawDialogOpen(false)}
                    data-ocid="founder.withdraw.cancel_button"
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    onClick={handleWithdraw}
                    disabled={recordWithdrawal.isPending || !withdrawAmount}
                    data-ocid="founder.withdraw.confirm_button"
                  >
                    {recordWithdrawal.isPending ? (
                      <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      t("confirm_withdrawal")
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* All transactions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h2 className="font-display text-xl font-bold text-foreground mb-4">
            {t("all_transactions")}
          </h2>

          {ordersLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : !ordersWithFees || ordersWithFees.length === 0 ? (
            <div
              data-ocid="founder.transactions.empty_state"
              className="text-center py-12 bg-card rounded-xl border border-dashed border-border"
            >
              <div className="text-4xl mb-3">💸</div>
              <h3 className="font-semibold text-foreground mb-1">
                No transactions yet
              </h3>
              <p className="text-muted-foreground text-sm">
                Platform fees will appear here once orders are placed
              </p>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
              <Table data-ocid="founder.transactions.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("order_id")}</TableHead>
                    <TableHead>{t("you_pay")}</TableHead>
                    <TableHead>{t("seller_receives")}</TableHead>
                    <TableHead className="text-primary">
                      {t("platform_fee")}
                    </TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordersWithFees.map((owf, idx) => (
                    <TableRow
                      key={owf.order.id.toString()}
                      data-ocid={`founder.transaction.row.${idx + 1}`}
                    >
                      <TableCell className="font-mono text-xs">
                        #{owf.order.id.toString()}
                      </TableCell>
                      <TableCell className="font-semibold">
                        ₹{Number(owf.order.totalAmount)}
                      </TableCell>
                      <TableCell>₹{Number(owf.sellerAmount)}</TableCell>
                      <TableCell className="text-primary font-bold">
                        ₹{Number(owf.platformFee)}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-medium">
                          {owf.order.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </motion.div>
      </main>

      <footer className="py-6 px-4 border-t border-border text-center mt-8">
        <p className="text-muted-foreground text-xs">
          © {new Date().getFullYear()}. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="text-primary underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
