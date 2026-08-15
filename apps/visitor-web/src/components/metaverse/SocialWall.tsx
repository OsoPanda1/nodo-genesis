import React from "react";
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Globe,
  Users,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import FederationBadge from "./FederationBadge";

interface PostAuthor {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified?: boolean;
}

interface Post {
  id: string;
  author: PostAuthor;
  content: string;
  media?: {
    type: "image" | "video" | "audio" | "dreamspace";
    url: string;
    thumbnail?: string;
  }[];
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  visibility: "public" | "friends" | "private";
  federationHash?: string;
}

interface SocialWallProps {
  posts: Post[];
  title?: string;
  onPostClick?: (postId: string) => void;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
}

const PostCard: React.FC<{
  post: Post;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}> = ({ post, onLike, onComment, onShare }) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const visibilityIcons = {
    public: Globe,
    friends: Users,
    private: Lock,
  };
  const VisibilityIcon = visibilityIcons[post.visibility];

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/30 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary p-0.5"
          >
            <div
              className="w-full h-full rounded-full bg-cover bg-center border-2 border-card"
              style={{ backgroundImage: `url(${post.author.avatar})` }}
            />
          </motion.div>

          {/* Author Info */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{post.author.name}</span>
              {post.author.verified && (
                <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>@{post.author.username}</span>
              <span>·</span>
              <span>{post.timestamp}</span>
              <VisibilityIcon className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <button className="p-2 rounded-full hover:bg-accent/20 transition-colors">
          <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-foreground/90 whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Media */}
      {(() => {
        const m = post.media;
        if (!m || m.length === 0) return null;
        return (
          <div
            className={cn(
              "grid gap-1",
              m.length === 1 && "grid-cols-1",
              m.length === 2 && "grid-cols-2",
              m.length >= 3 && "grid-cols-2",
            )}
          >
            {m.slice(0, 4).map((media, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className={cn(
                  "relative aspect-video bg-muted overflow-hidden cursor-pointer",
                  m.length === 3 && index === 0 && "row-span-2",
                )}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${media.thumbnail || media.url})` }}
                />
                {media.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white ml-1"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}
                {m.length > 4 && index === 3 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <span className="text-2xl font-bold text-white">+{m.length - 4}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        );
      })()}

      {/* Federation Badge */}
      {post.federationHash && (
        <div className="px-4 pt-3">
          <FederationBadge entityType="post" entityId={post.id} hash={post.federationHash} />
        </div>
      )}

      {/* Actions Bar */}
      <div className="p-4 flex items-center justify-between border-t border-border/30">
        <div className="flex items-center gap-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onLike}
            className="flex items-center gap-2 text-muted-foreground hover:text-pink-500 transition-colors"
          >
            <Heart className="w-5 h-5" />
            <span className="text-sm">{formatNumber(post.likes)}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onComment}
            className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm">{formatNumber(post.comments)}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onShare}
            className="flex items-center gap-2 text-muted-foreground hover:text-green-500 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm">{formatNumber(post.shares)}</span>
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="text-muted-foreground hover:text-accent transition-colors"
        >
          <Bookmark className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.article>
  );
};

const SocialWall: React.FC<SocialWallProps> = ({
  posts,
  title = "Muro Social TAMV",
  onPostClick,
  onLike,
  onComment,
  onShare,
}) => {
  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-accent to-primary rounded-full" />
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
            Recientes
          </button>
          <button className="px-4 py-2 text-sm font-medium text-accent bg-accent/10 rounded-lg">
            Populares
          </button>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={() => onLike?.(post.id)}
            onComment={() => onComment?.(post.id)}
            onShare={() => onShare?.(post.id)}
          />
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-8 py-3 rounded-xl bg-card/50 border border-border/50 text-foreground/80 hover:text-foreground hover:bg-card transition-all"
        >
          Cargar más publicaciones
        </motion.button>
      </div>
    </section>
  );
};

export default SocialWall;
