import { useState } from "react";
import { Link } from "react-router";
import { useFactCheck } from "../hooks/useApi";
import { formatTime } from "../utils/formatTime";
import { CATEGORY_COLORS } from "../utils/categories";
import type { Post } from "../types";
import ProfessionalBadge from "./ProfessionalBadge";
import FactCheckBadge from "./FactCheckBadge";
import LikeButton from "./LikeButton";
import TranslateButton from "./TranslateButton";

interface ArticleCardProps {
  post: Post;
  isVerified?: boolean;
}

export default function ArticleCard({
  post,
  isVerified = false,
}: ArticleCardProps) {
  const { factCheck, loading: factCheckLoading } = useFactCheck(post.id);
  const [translatedBody, setTranslatedBody] = useState<string | null>(null);

  const category = post.category;
  const authorDisplay = post.authorDisplayName || post.authorUsername;
  const timeAgo = formatTime(post.createdAt);
  const displayBody = translatedBody || post.body;

  return (
    <article className="border-b border-gray-100 px-4 py-4 hover:bg-gray-50">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[category]}`}
        >
          {category}
        </span>
        {isVerified && <ProfessionalBadge />}

        {factCheck && (
          <FactCheckBadge
            status={factCheck.status as any}
            confidenceScore={factCheck.confidenceScore}
          />
        )}
        {factCheckLoading && <FactCheckBadge loading />}

        <span className="text-xs text-gray-400">
          {authorDisplay} · {timeAgo}
        </span>
      </div>

      <Link to={`/article/${post.id}`} className="group">
        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600">
          {post.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-gray-500">{displayBody}</p>
      </Link>

      {post.locationName && (
        <p className="mt-2 text-xs text-gray-400">📍 {post.locationName}</p>
      )}

      <div className="mt-3 flex items-center gap-4">
        <LikeButton postId={post.id} />
        <TranslateButton
          postId={post.id}
          isTranslated={false}
          onTranslated={(body) => setTranslatedBody(body)}
        />
      </div>
    </article>
  );
}
