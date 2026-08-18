import React from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Story {
  id: string;
  username: string;
  avatar: string;
  hasNew: boolean;
  isOwn?: boolean;
  preview?: string;
}

interface StoriesSectionProps {
  stories: Story[];
  onStoryClick?: (storyId: string) => void;
  onAddStory?: () => void;
}

const StoriesSection: React.FC<StoriesSectionProps> = ({ stories, onStoryClick, onAddStory }) => {
  return (
    <div className="relative">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Historias</h2>
        <button className="text-sm text-accent hover:underline">Ver todas</button>
      </div>

      {/* Stories Scroll */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {/* Add Story Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddStory}
          className="flex-shrink-0 flex flex-col items-center gap-2"
        >
          <div className="relative w-20 h-20 rounded-full bg-card border-2 border-dashed border-accent/50 flex items-center justify-center hover:border-accent transition-colors">
            <Plus className="w-8 h-8 text-accent" />
          </div>
          <span className="text-xs text-muted-foreground">Tu Historia</span>
        </motion.button>

        {/* Stories */}
        {stories.map((story, index) => (
          <motion.button
            key={story.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onStoryClick?.(story.id)}
            className="flex-shrink-0 flex flex-col items-center gap-2"
          >
            {/* Avatar with gradient ring */}
            <div
              className={cn(
                "relative w-20 h-20 rounded-full p-0.5",
                story.hasNew
                  ? "bg-gradient-to-br from-accent via-primary to-pink-500"
                  : "bg-border",
              )}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-card p-0.5">
                <div
                  className="w-full h-full rounded-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${story.avatar})` }}
                />
              </div>

              {/* New indicator */}
              {story.hasNew && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                  NUEVO
                </span>
              )}
            </div>

            {/* Username */}
            <span className="text-xs text-foreground/80 truncate max-w-[80px]">
              {story.username}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default StoriesSection;
