import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight } from 'lucide-react';

import img1 from '../../images/journal1.jfif';
import img2 from '../../images/journal2.jfif';
import img3 from '../../images/journal3.jfif';
import img4 from '../../images/journal4.jfif';

// Journal Entries Data - Updated for Ravenza Brand Voice & Layout Flow
const journalEntries = [
  {
    id: '1',
    title: 'WHERE IT ALL BEGAN',
    subtitle: 'The Genesis of Ravenza Streetwear',
    content: 'Officially launched on 15 January 2024 as the first-ever Season Drop on the Ravenza website, our Shadow Realm Collection introduced over 20+ unique articles that defined the beginning of our journey. The response has been incredible from the very first day, and today the collection has surpassed 10,000+ sales while continuing to grow.',
    featured_image: img1,
    category: '',
    author: 'THE FOUNDER OF RAVENZA',
    published_date: '2024-01-15',
    quote: '"Every legacy starts with a single drop. This was ours."'
  },
  {
    id: '2',
    title: 'THE PERFECT PAIR',
    subtitle: 'Redefining Co-Ord Sets for the Streets',
    content: 'Officially launched on 22 May 2024, the Ravenza Co-Ord Sets were introduced following the incredible response to our Graphic Trousers and Acid Wash Tees. Designed to offer a complete matching outfit in one purchase, this collection gives customers the perfect top-and-bottom combination.',
    featured_image: img2,
    category: '',
    author: 'THE FOUNDER OF RAVENZA',
    published_date: '2024-05-22',
    quote: '"Some pieces belong together. We made sure they always do."'
  },
  {
    id: '3',
    title: 'THE GAME CHANGER',
    subtitle: 'Acid Wash & The New Era of Graphics',
    content: 'Officially launched on 29 April 2024, the Ravenza Acid Wash Tees began with clean plain designs. While the initial response was modest, we redefined the collection with bold streetwear graphics that quickly transformed it into a bestseller. Today, with 5,000+ pieces sold and counting.',
    featured_image: img3,
    category: '',
    author: 'THE FOUNDER OF RAVENZA',
    published_date: '2024-04-29',
    quote: '"We didn\'t follow the trend. We changed the game."'
  },
  {
    id: '4',
    title: 'THE HEAT DROP',
    subtitle: 'Graphic Shorts & Summer Evolution',
    content: 'Officially launched on 20 June 2024, the Ravenza Graphic Shorts mark the next step in the evolution of streetwear. Following the incredible response to our Graphic Trousers, we introduced this collection as graphic fashion continued to dominate the scene.',
    featured_image: img4,
    category: '',
    author: 'THE FOUNDER OF RAVENZA',
    published_date: '2024-06-20',
    quote: '"When the temperature rises, so does the standard."'
  },
];

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  }
};

const imageVariants = {
  hidden: { opacity: 0, scale: 1.1 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] }
  }
};

const textVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.6, delay: 0.2 }
  }
};

export default function JournalSection() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        
        {/* Animated Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-24"
        >
          <p className="text-xs font-bold tracking-[0.4em] text-gray-400 mb-4 uppercase animate-pulse">
            The Ravenza Journal
          </p>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-black mb-6">
            Stories & Insights
          </h2>
          <p className="mt-4 text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed">
            A closer look at the drops that shaped the Ravenza journey. From the studio to the streets.
          </p>
        </motion.div>

        {/* Animated Entries List */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-32"
        >
          {journalEntries.map((entry, i) => {
            const isSplitLayout = i % 2 === 0; 

            return (
              <motion.div
                key={entry.id}
                variants={itemVariants}
                className={`flex flex-col ${isSplitLayout ? 'md:grid md:grid-cols-2 gap-12 lg:gap-20 items-center' : ''}`}
              >
                
                {/* IMAGE SECTION WITH ZOOM REVEAL */}
                <div className={`${isSplitLayout ? (i % 2 === 1 ? 'md:order-2' : 'md:order-1') : 'w-full col-span-2'} relative group`}>
                  <motion.div 
                    variants={imageVariants}
                    className={`${isSplitLayout ? 'aspect-[4/5] md:aspect-[3/4]' : 'aspect-[16/9] w-full'} overflow-hidden rounded-none bg-gray-100 shadow-2xl`}
                  >
                    <img
                      src={entry.featured_image}
                      alt={entry.title}
                      loading={i === 0 ? "eager" : "lazy"}
                      fetchPriority={i === 0 ? "high" : "low"}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0"
                    />
                    
                    {/* Overlay Category Text on Hover */}
                    {!isSplitLayout && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/20 backdrop-blur-[2px]">
                         <span className="text-white text-5xl font-black uppercase tracking-widest drop-shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                           {entry.category.split(' ')[0]}
                         </span>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* CONTENT SECTION WITH LINE-BY-LINE REVEAL */}
                <div className={`${isSplitLayout ? (i % 2 === 1 ? 'md:order-1' : 'md:order-2') : 'w-full col-span-2 mt-10 md:mt-16'} flex flex-col justify-center`}>
                  
                  <motion.div variants={textVariants} className="flex items-center gap-4 text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-6">
                    <span>{entry.author}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>{new Date(entry.published_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}</span>
                  </motion.div>

                  <motion.h3 variants={textVariants} className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-black mb-6 leading-[0.9] group-hover:translate-x-2 transition-transform duration-500">
                    {entry.title}
                  </motion.h3>

                  <motion.p variants={textVariants} className="text-gray-600 text-sm md:text-base leading-[1.8] mb-8 font-medium">
                    {entry.content}
                  </motion.p>

                  <motion.blockquote variants={textVariants} className="border-l-2 border-black pl-6 py-2 mb-8 hover:border-purple-600 transition-colors duration-300">
                    <p className="text-lg md:text-xl font-serif italic text-gray-800">
                      {entry.quote}
                    </p>
                  </motion.blockquote>


                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}