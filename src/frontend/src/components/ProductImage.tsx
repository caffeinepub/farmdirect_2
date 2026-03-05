import { useEffect, useState } from "react";

interface ProductImageProps {
  imageId?: string;
  title: string;
  className?: string;
}

const EMOJI_MAP: Record<string, string> = {
  tomato: "🍅",
  spinach: "🥬",
  carrot: "🥕",
  corn: "🌽",
  potato: "🥔",
  onion: "🧅",
  garlic: "🧄",
  pepper: "🌶️",
  cucumber: "🥒",
  broccoli: "🥦",
  lettuce: "🥬",
  cabbage: "🥬",
  cauliflower: "🥦",
  pea: "🫛",
  bean: "🫘",
  mango: "🥭",
  banana: "🍌",
  apple: "🍎",
  orange: "🍊",
  lemon: "🍋",
  grape: "🍇",
  watermelon: "🍉",
  pineapple: "🍍",
  rice: "🌾",
  wheat: "🌾",
  milk: "🥛",
  egg: "🥚",
  honey: "🍯",
};

function getEmoji(title: string): string {
  const lower = title.toLowerCase();
  for (const [key, emoji] of Object.entries(EMOJI_MAP)) {
    if (lower.includes(key)) return emoji;
  }
  return "🌾";
}

export default function ProductImage({
  imageId,
  title,
  className = "w-full h-full object-cover",
}: ProductImageProps) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (imageId) {
      import("../backend")
        .then(({ ExternalBlob }) => {
          const url = ExternalBlob.fromURL(imageId).getDirectURL();
          setImgUrl(url);
        })
        .catch(() => setError(true));
    }
  }, [imageId]);

  if (imgUrl && !error) {
    return (
      <img
        src={imgUrl}
        alt={title}
        className={className}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
      <span className="text-4xl select-none">{getEmoji(title)}</span>
    </div>
  );
}
