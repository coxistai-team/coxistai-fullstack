import React from 'react';
import { motion } from 'framer-motion';
import { Clock, User, MoreHorizontal } from 'lucide-react';
import { CardData } from './cardData';

interface ContentCardProps {
  card: CardData;
}

const ContentCard: React.FC<ContentCardProps> = ({ card }) => {
  const getTagColor = (tag: string) => {
    const colors = {
      'SEO': 'bg-blue-100 text-blue-700 border-blue-200',
      'Storytelling': 'bg-purple-100 text-purple-700 border-purple-200',
      'Data': 'bg-green-100 text-green-700 border-green-200',
      'Conversion': 'bg-orange-100 text-orange-700 border-orange-200',
      'default': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[tag as keyof typeof colors] || colors.default;
  };

  return (
    <motion.div
      className="bg-white rounded-lg p-5 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 cursor-pointer group"
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-slate-800 text-base leading-tight group-hover:text-blue-600 transition-colors">
          {card.title}
        </h4>
        <motion.button
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <MoreHorizontal className="w-4 h-4 text-slate-400" />
        </motion.button>
      </div>
      
      {/* Card Content */}
      <div className="mb-4">
        <p className="text-slate-600 text-sm leading-relaxed">{card.description}</p>
      </div>
      
      {/* Tag */}
      {card.tag && (
        <div className="mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getTagColor(card.tag)}`}>
            {card.tag}
          </span>
        </div>
      )}
      
      {/* Card Footer */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{card.timeAgo}</span>
          </div>
          {card.author && (
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span>{card.author}</span>
            </div>
          )}
        </div>
        
        {/* Progress Indicator */}
        <div className="w-2 h-2 bg-slate-300 rounded-full group-hover:bg-blue-500 transition-colors"></div>
      </div>
    </motion.div>
  );
};

export default ContentCard;