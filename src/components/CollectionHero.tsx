import { motion } from 'framer-motion';

interface CollectionHeroProps {
  category: any;
}

export default function CollectionHero({ category }: CollectionHeroProps) {
  return (
    <div className="relative h-[60vh] overflow-hidden bg-black">
      {/* Background Image */}
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0"
      >
        <img
          src={category.cover_image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop'}
          alt={category.name}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </motion.div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 flex items-end pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl"
        >
          {category.badge && (
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-block bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full mb-4"
            >
              {category.badge}
            </motion.span>
          )}
          
          {category.tag && (
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="text-white/70 text-sm tracking-[0.3em] mb-2"
            >
              {category.tag}
            </motion.p>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-5xl md:text-7xl font-black text-white font-display leading-tight"
          >
            {category.name}
          </motion.h1>

          {category.description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-white/80 mt-4 text-lg max-w-xl"
            >
              {category.description}
            </motion.p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
