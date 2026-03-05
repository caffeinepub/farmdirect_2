import { Button } from "@/components/ui/button";
import {
  Loader2,
  MapPin,
  ShoppingBag,
  Smartphone,
  Sprout,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { AppView } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface LandingPageProps {
  onSelectRole: (role: "farmer" | "consumer") => void;
  onAuthenticated: (role: "farmer" | "consumer") => void;
  navigate: (v: AppView) => void;
}

export default function LandingPage({ navigate }: LandingPageProps) {
  const { login, loginStatus, identity } = useInternetIdentity();
  const [pendingRole, setPendingRole] = useState<"farmer" | "consumer" | null>(
    null,
  );
  const isLoggingIn = loginStatus === "logging-in";

  const handleRoleClick = async (role: "farmer" | "consumer") => {
    if (identity) {
      navigate({
        page: role === "farmer" ? "farmer-dashboard" : "consumer-home",
      });
      return;
    }
    setPendingRole(role);
    try {
      await login();
    } catch (err) {
      console.error("Login failed", err);
      setPendingRole(null);
    }
  };

  const features = [
    {
      id: "no-middlemen",
      icon: <Sprout className="w-5 h-5" />,
      text: "Direct from farm, no middlemen",
    },
    {
      id: "nearest",
      icon: <MapPin className="w-5 h-5" />,
      text: "Find farmers nearest to you",
    },
    {
      id: "upi",
      icon: <Smartphone className="w-5 h-5" />,
      text: "Pay via UPI, GPay, Paytm",
    },
    {
      id: "delivery",
      icon: <Zap className="w-5 h-5" />,
      text: "Delivery or farm pickup",
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/assets/generated/farm-hero.dim_1200x600.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-foreground/60" />

        {/* Decorative grain overlay */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px",
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white rounded-full px-4 py-1.5 text-sm font-medium mb-6 border border-white/20">
              <Sprout className="w-4 h-4 text-farm-green-light" />
              Farm Fresh, Directly to You
            </div>

            <h1 className="font-display text-5xl sm:text-7xl font-bold text-white mb-4 leading-none tracking-tight">
              Farm<span className="text-farm-amber">Direct</span>
            </h1>

            <p className="text-white/85 text-lg sm:text-xl max-w-xl mx-auto mb-10 font-body leading-relaxed">
              Connect with local farmers. Buy fresh produce directly from the
              source — no markets, no middlemen.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto"
          >
            {/* Farmer CTA */}
            <button
              type="button"
              data-ocid="landing.farmer_button"
              onClick={() => handleRoleClick("farmer")}
              disabled={isLoggingIn}
              className="group relative bg-primary text-primary-foreground rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.03] hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <div className="text-3xl mb-3">🌾</div>
              <div className="font-display font-bold text-lg mb-1">
                I'm a Farmer
              </div>
              <div className="text-primary-foreground/80 text-sm">
                Sell your fresh produce directly to nearby consumers
              </div>
              {isLoggingIn && pendingRole === "farmer" && (
                <Loader2 className="absolute top-4 right-4 w-4 h-4 animate-spin" />
              )}
            </button>

            {/* Consumer CTA */}
            <button
              type="button"
              data-ocid="landing.consumer_button"
              onClick={() => handleRoleClick("consumer")}
              disabled={isLoggingIn}
              className="group relative rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.03] hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white"
            >
              <div className="text-3xl mb-3">🛒</div>
              <div className="font-display font-bold text-lg mb-1">
                I'm a Consumer
              </div>
              <div className="text-white/80 text-sm">
                Discover and buy fresh farm produce near you
              </div>
              {isLoggingIn && pendingRole === "consumer" && (
                <Loader2 className="absolute top-4 right-4 w-4 h-4 animate-spin" />
              )}
            </button>
          </motion.div>

          {isLoggingIn && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex items-center justify-center gap-2 text-white/70 text-sm"
              data-ocid="auth.login_button"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              Connecting to Internet Identity...
            </motion.div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl font-bold text-foreground mb-3">
              Why FarmDirect?
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              The easiest way to connect farmers with hungry consumers in your
              area
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-card rounded-xl p-5 shadow-card flex flex-col items-start gap-3"
              >
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                  {f.icon}
                </div>
                <p className="font-medium text-foreground text-sm">{f.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl font-bold mb-3">
              How It Works
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                emoji: "📸",
                title: "Farmers List Products",
                desc: "Take a photo, set your price, and list fresh produce in minutes",
              },
              {
                step: "2",
                emoji: "🔍",
                title: "Consumers Browse Nearby",
                desc: "Search by pincode or city to find freshest produce close to you",
              },
              {
                step: "3",
                emoji: "💳",
                title: "Pay & Receive",
                desc: "Pay via UPI/GPay/Paytm. Choose delivery or farm pickup",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                  {item.emoji}
                </div>
                <div className="font-display font-bold text-foreground mb-2">
                  {item.title}
                </div>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample listings preview */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="font-display text-2xl font-bold mb-2">
              Fresh Today Near You
            </h2>
            <p className="text-muted-foreground text-sm">
              Popular products on FarmDirect
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                id: "tomatoes",
                emoji: "🍅",
                name: "Organic Tomatoes",
                price: "₹45/kg",
                loc: "Pune",
              },
              {
                id: "spinach",
                emoji: "🥬",
                name: "Fresh Spinach",
                price: "₹30/bundle",
                loc: "Nashik",
              },
              {
                id: "carrots",
                emoji: "🥕",
                name: "Farm Carrots",
                price: "₹60/kg",
                loc: "Nagpur",
              },
              {
                id: "corn",
                emoji: "🌽",
                name: "Sweet Corn",
                price: "₹20/piece",
                loc: "Aurangabad",
              },
            ].map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                className="bg-card rounded-xl p-4 shadow-card text-center"
              >
                <div className="text-3xl mb-2">{item.emoji}</div>
                <div className="font-medium text-sm text-foreground truncate">
                  {item.name}
                </div>
                <div className="text-primary font-bold text-sm">
                  {item.price}
                </div>
                <div className="text-muted-foreground text-xs flex items-center justify-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {item.loc}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border text-center">
        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
          <ShoppingBag className="w-4 h-4 text-primary" />
          <span className="font-display font-semibold text-foreground">
            FarmDirect
          </span>
        </div>
        <p className="text-muted-foreground text-xs mt-2">
          © {new Date().getFullYear()}. Built with{" "}
          <span className="text-destructive">♥</span> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="text-primary underline hover:opacity-80"
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
