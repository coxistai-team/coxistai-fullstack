import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Tag, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface TagFilterProps {
  allTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({
  allTags,
  selectedTags,
  onTagsChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleTagToggle = (tag: string) => {
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    onTagsChange(newSelectedTags);
  };

  const handleClearAll = () => {
    onTagsChange([]);
  };

  const handleSelectAll = () => {
    onTagsChange([...allTags]);
  };

  const getTagColor = (tag: string) => {
    const colors = [
      'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'bg-green-500/20 text-green-300 border-green-500/30',
      'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'bg-pink-500/20 text-pink-300 border-pink-500/30',
      'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'bg-red-500/20 text-red-300 border-red-500/30',
      'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    ];
    const index = tag.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (allTags.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-slate-800/50 border-white/20 text-white hover:bg-slate-700/50"
          >
            <Filter className="w-4 h-4 mr-2" />
            Tags
            {selectedTags.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-blue-500/20 text-blue-300">
                {selectedTags.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 bg-slate-900 border-white/20">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-white">Filter by Tags</h4>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-xs text-blue-300 hover:text-blue-200"
                >
                  Select All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-xs text-gray-400 hover:text-gray-300"
                >
                  Clear
                </Button>
              </div>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {allTags.map((tag) => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox
                    id={tag}
                    checked={selectedTags.includes(tag)}
                    onCheckedChange={() => handleTagToggle(tag)}
                    className="border-white/30 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <Label
                    htmlFor={tag}
                    className="flex-1 text-sm text-white cursor-pointer"
                  >
                    <Badge
                      variant="outline"
                      className={`${getTagColor(tag)} border`}
                    >
                      {tag}
                    </Badge>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected tags display */}
      {selectedTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {selectedTags.map((tag) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1"
            >
              <Badge
                variant="outline"
                className={`${getTagColor(tag)} border cursor-pointer hover:opacity-80`}
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagFilter; 