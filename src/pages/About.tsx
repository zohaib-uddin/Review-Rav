import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Award, Heart, Leaf, Users } from 'lucide-react';

export default function About() {
  return (
    <div>
      <section className="relative h-[60vh] overflow-hidden bg-black">
        <div className="absolute inset-0"><img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&h=1080&fit=crop" alt="" className="w-full h-full object-cover opacity-50" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" /></div>
        <div className="relative h-full flex items-center justify-center text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white">OUR STORY</h1>
            <p className="text-white/70 mt-4 text-lg">Born from the streets, crafted for the bold.</p>
          </motion.div>
        </div>
      </section>
      <section className="py-20 max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">WHERE IT ALL BEGAN</h2>
          <p className="text-gray-600 leading-relaxed text-lg">Ravenza was founded with a single vision — to create streetwear that speaks to the bold, the creative, and the unapologetically authentic. What started as a passion project has grown into a movement.</p>
          <blockquote className="mt-8 text-2xl font-display italic text-gray-800 border-l-4 border-black pl-6 text-left">"We didn't follow the trend. We set the standard."</blockquote>
        </motion.div>
      </section>
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-display font-bold text-center mb-12">OUR VALUES</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[{ icon: Award, title: 'Premium Quality', desc: 'Every piece crafted with premium fabrics.' }, { icon: Heart, title: 'Customer First', desc: 'Your satisfaction is our priority.' }, { icon: Leaf, title: 'Sustainable', desc: 'Responsible fashion practices.' }, { icon: Users, title: 'Community', desc: 'Building a community of self-expression.' }].map((v, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white p-8 rounded-xl text-center shadow-sm">
                <v.icon className="mx-auto mb-4 text-black" size={32} />
                <h3 className="font-bold text-lg mb-2">{v.title}</h3>
                <p className="text-gray-600 text-sm">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 bg-black text-white text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">JOIN THE MOVEMENT</h2>
          <p className="text-gray-400 mb-8">Be part of the Ravenza community.</p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 font-bold text-sm hover:bg-gray-200 rounded-full">SHOP NOW</Link>
        </motion.div>
      </section>
    </div>
  );
}
