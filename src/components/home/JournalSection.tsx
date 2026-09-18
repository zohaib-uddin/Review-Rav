import { motion } from 'framer-motion';
import { Calendar, User } from 'lucide-react';

const staticEntries = [
  {
    id: '1',
    title: 'The Birth of Ravenza',
    subtitle: 'Our journey from concept to reality',
    content: 'Ravenza was born from a simple vision: to create streetwear that speaks to the bold, the creative, and the unapologetically authentic. What started as a passion project in a small studio has grown into a movement that resonates with thousands across Pakistan.',
    featured_image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
    category: 'Brand Story',
    author: 'Ravenza Team',
    published_date: '2024-01-15',
  },
  {
    id: '2',
    title: 'Behind the Design: Shadow Realm',
    subtitle: 'The inspiration behind our best-selling collection',
    content: 'The Shadow Realm collection draws inspiration from urban mythology and the duality of modern life. Each piece is carefully crafted to represent the balance between light and shadow, comfort and edge.',
    featured_image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=600&fit=crop',
    category: 'Design',
    author: 'Creative Director',
    published_date: '2024-02-01',
  },
  {
    id: '3',
    title: 'Sustainability in Streetwear',
    subtitle: 'Our commitment to responsible fashion',
    content: 'At Ravenza, we believe that great fashion shouldnt come at the cost of our planet. We are committed to using sustainable materials and ethical manufacturing processes wherever possible.',
    featured_image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=600&fit=crop',
    category: 'Sustainability',
    author: 'Ravenza Team',
    published_date: '2024-03-01',
  },
];

export default function JournalSection() {
  const entries = staticEntries;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-xs tracking-[0.3em] text-gray-500 mb-2">THE RAVENZA JOURNAL</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold">Stories & Insights</h2>
        </motion.div>

        <div className="space-y-12">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`grid md:grid-cols-2 gap-8 items-center ${
                i % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              <div className={i % 2 === 1 ? 'md:order-2' : ''}>
                <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                  <img
                    src={entry.featured_image}
                    alt={entry.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className={i % 2 === 1 ? 'md:order-1' : ''}>
                <span className="text-xs tracking-widest text-purple-600 font-medium">
                  {entry.category}
                </span>
                <h3 className="text-2xl md:text-3xl font-bold mt-2 mb-3">{entry.title}</h3>
                <p className="text-gray-600 mb-4">{entry.subtitle}</p>
                <p className="text-gray-700 leading-relaxed mb-6">{entry.content}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    <span>{entry.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{new Date(entry.published_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
