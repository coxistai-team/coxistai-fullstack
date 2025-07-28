import React from 'react';
import { motion } from 'framer-motion';
import KanbanColumn from './KanbanColumn';
import { cardData } from './cardData';

interface KanbanBoardProps {
  viewMode: 'grid' | 'list';
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ viewMode }) => {
  const columns = [
    { title: 'Ideas', count: 5, cards: cardData.ideas },
    { title: 'Research', count: 3, cards: cardData.research },
    { title: 'Outline', count: 1, cards: cardData.outline }
  ];

  return (
    <div className={`
      ${viewMode === 'grid' 
        ? 'grid grid-cols-1 lg:grid-cols-3 gap-6' 
        : 'space-y-6'
      }
    `}>
      {columns.map((column, index) => (
        <motion.div
          key={column.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
        >
          <KanbanColumn
            title={column.title}
            count={column.count}
            cards={column.cards}
            viewMode={viewMode}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default KanbanBoard;