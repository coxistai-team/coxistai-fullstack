import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import ContentCard from './ContentCard';
import { CardData } from './cardData';

interface KanbanColumnProps {
  title: string;
  count: number;
  cards: CardData[];
  viewMode: 'grid' | 'list';
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, count, cards, viewMode }) => {
  return (
    <div className="bg-slate-50 rounded-xl p-5 min-h-[600px]">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-slate-800 text-lg">{title}</h3>
          <span className="bg-slate-200 text-slate-600 text-sm font-medium px-2.5 py-1 rounded-full">
            {count}
          </span>
        </div>
        <motion.button
          className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Plus className="w-4 h-4 text-slate-500" />
        </motion.button>
      </div>
      
      {/* Cards Container */}
      <div className={`
        ${viewMode === 'grid' 
          ? 'space-y-4' 
          : 'grid gap-4'
        }
      `}>
        {cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (index + 1) * 0.1, duration: 0.4 }}
          >
            <ContentCard card={card} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default KanbanColumn;