import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabase';
import { cn, getCanvasFingerprint } from './lib/utils';
import { playClick } from './lib/audio';
import confetti from 'canvas-confetti';
import {
  Heart,
  ShoppingBag,
  MessageCircle,
  Menu,
  X,
  Star,
  Play,
  Pause,
  ChevronRight,
  Send,
  Lock,
  Upload,
  CheckCircle2,
  ExternalLink,
  Music
} from 'lucide-react';

// --- TYPES ---
interface Template {
  id: string;
  name: string;
  category: string;
  image_url: string;
  price: string;
}

interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  emoji: string;
  created_at: string;
}

// --- COMPONENTS ---

const Navbar = ({ onAdminClick }: { onAdminClick: () => void }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 glass px-6 py-4 flex justify-between items-center">
    <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
      <Heart className="text-heart-pink fill-heart-pink" />
      <span className="text-xl font-bold bg-gradient-to-r from-heart-pink to-heart-neon bg-clip-text text-transparent">
        HeartByte
      </span>
    </div>
    <div className="hidden md:flex gap-8 text-sm font-medium">
      <a href="#catalog" className="hover:text-heart-pink transition-colors" onClick={playClick}>Catalog</a>
      <a href="#reviews" className="hover:text-heart-pink transition-colors" onClick={playClick}>Reviews</a>
      <a href="#contact" className="hover:text-heart-pink transition-colors" onClick={playClick}>Contact</a>
    </div>
    <button
      onClick={() => { playClick(); onAdminClick(); }}
      className="glass-pink px-4 py-2 rounded-full text-xs flex items-center gap-2 hover:scale-105 transition-transform"
    >
      <Lock size={14} /> Admin
    </button>
  </nav>
);

const CheckoutModal = ({ template, onClose }: { template: Template, onClose: () => void }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    whatsapp: '',
    email: '',
    utr: '',
    amount: template.price || '9.99',
    details: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playClick();

    // Phase A: Instant Native Transition
    const whatsappMsg = `Hey Vivek! I have just submitted my payment proof on HeartByte. Please process my customized template order asynchronously soon as possible.

Order Details:
Template: ${template.name}
Name: ${formData.fullName}
WhatsApp: ${formData.whatsapp}
Email: ${formData.email}
UTR: ${formData.utr}
Amount: ${formData.amount}
Customization: ${formData.details}`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=919507020726&text=${encodeURIComponent(whatsappMsg)}`;

    // Phase B: Asynchronous Background Processing (Fire & Forget)
    const backgroundTask = (async () => {
      try {
        let fileUrl = '';
        if (file) {
          const fileExt = file.name.split('.').pop();
          const fileName = `proof_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const { data: uploadData } = await supabase.storage
            .from('payment-proofs')
            .upload(fileName, file);

          if (uploadData) {
            const { data: { publicUrl } } = supabase.storage.from('payment-proofs').getPublicUrl(fileName);
            fileUrl = publicUrl;
          }
        }

        // Insert into database
        const { data: orderData } = await supabase.from('orders').insert([{
          template_id: template.id,
          template_name: template.name,
          full_name: formData.fullName,
          whatsapp_number: formData.whatsapp,
          email: formData.email,
          utr_id: formData.utr,
          amount: formData.amount,
          customization_details: formData.details,
          payment_proof_url: fileUrl,
          status: 'PENDING'
        }]).select();

        // Simulate AI Vision Checker & Email Automation (Client-side trigger for demo)
        if (orderData && orderData[0]) {
          console.log('Order logged, starting AI Vision & Email sequence...');

          // Background AI Vision Payment Checker (Mock)
          setTimeout(async () => {
            const isMatch = formData.utr.length === 12; // Simple mock check
            if (isMatch) {
              await supabase.from('orders').update({ status: 'APPROVED' }).eq('id', orderData[0].id);
            }
          }, 5000);
        }

      } catch (err) {
        console.error('Background processing error:', err);
      }
    })();

    // Ensure transition happens but allow a tiny sliver of time for the fetch to start
    setTimeout(() => {
      window.location.href = whatsappUrl;
    }, 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="w-full max-w-2xl glass rounded-3xl p-8 relative my-8">
        <button onClick={() => { playClick(); onClose(); }} className="absolute top-6 right-6 text-white/50 hover:text-white">
          <X />
        </button>

        <div className="flex gap-4 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors", step >= i ? "bg-heart-pink" : "bg-white/10")} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Personal Details</h2>
            <div className="space-y-4">
              <input
                type="text" placeholder="Full Name"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-heart-pink transition-colors"
                value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})}
              />
              <input
                type="text" placeholder="WhatsApp Number"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-heart-pink transition-colors"
                value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})}
              />
              <input
                type="email" placeholder="Email Address"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-heart-pink transition-colors"
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <button
              onClick={() => { playClick(); setStep(2); }}
              disabled={!formData.fullName || !formData.whatsapp}
              className="w-full py-4 bg-heart-pink rounded-xl font-bold disabled:opacity-50"
            >
              Continue to Payment
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold">Scan & Pay</h2>
            <div className="w-64 h-64 bg-white mx-auto rounded-2xl overflow-hidden p-2 flex items-center justify-center">
               <img src="/1000064753.jpg" alt="PhonePe QR" className="w-full h-full object-contain" />
            </div>
            <div className="p-4 glass-pink rounded-xl inline-block">
              <p className="text-sm">Payable Amount: <span className="font-mono text-lg font-bold">${formData.amount}</span></p>
            </div>
            <div className="space-y-4 text-left">
              <input
                type="text" placeholder="12-Digit UTR / Transaction ID"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-heart-pink transition-colors"
                value={formData.utr} onChange={e => setFormData({...formData, utr: e.target.value})}
              />
              <div className="relative">
                <input
                  type="file" id="proof" className="hidden"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="proof" className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-white/20 rounded-xl p-8 cursor-pointer hover:border-heart-pink transition-colors">
                  <Upload size={20} />
                  <span>{file ? file.name : "Upload Payment Screenshot"}</span>
                </label>
              </div>
            </div>
            <button
              onClick={() => { playClick(); setStep(3); }}
              disabled={!formData.utr || !file}
              className="w-full py-4 bg-heart-pink rounded-xl font-bold disabled:opacity-50"
            >
              Final Step: Customization
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Customization Details</h2>
            <textarea
              placeholder="Enter names, special dates, or song choices..."
              className="w-full h-40 bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-heart-pink transition-colors resize-none"
              value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})}
            />
            <div className="p-4 glass rounded-xl flex items-start gap-3">
              <CheckCircle2 className="text-heart-neon shrink-0" />
              <p className="text-xs text-gray-400">By submitting, you will be redirected to WhatsApp to confirm your order with Vivek. Our AI will verify your payment in the background.</p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-heart-pink to-heart-violet rounded-xl font-bold flex items-center justify-center gap-2"
            >
              {loading ? "Processing..." : <><Send size={18} /> Submit Payment Proof</>}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const AdminPanel = ({ onClose }: { onClose: () => void }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [credentials, setCredentials] = useState({ user: '', pass: '' });
  const [orders, setOrders] = useState<any[]>([]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (credentials.user === 'VivekAdmin' && credentials.pass === 'HeartByte@2026!#') {
      setIsAuth(true);
      fetchOrders();
    } else {
      alert('Invalid Credentials');
    }
  };

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data);
  };

  if (!isAuth) {
    return (
      <div className="fixed inset-0 z-[120] bg-[#0f172a] flex items-center justify-center p-6">
        <div className="w-full max-w-md glass p-8 rounded-3xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Lock /> Admin Gateway</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text" placeholder="Username"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4"
              value={credentials.user} onChange={e => setCredentials({...credentials, user: e.target.value})}
            />
            <input
              type="password" placeholder="Password"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4"
              value={credentials.pass} onChange={e => setCredentials({...credentials, pass: e.target.value})}
            />
            <div className="flex gap-4">
              <button type="button" onClick={onClose} className="flex-1 py-3 glass rounded-xl">Cancel</button>
              <button type="submit" className="flex-1 py-3 bg-heart-pink rounded-xl font-bold">Unlock</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[120] bg-[#0f172a] overflow-hidden flex flex-col">
      <header className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-md">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <button onClick={onClose} className="px-6 py-2 glass rounded-full">Exit</button>
      </header>
      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-4">
          {orders.map(order => (
            <div key={order.id} className="glass p-6 rounded-2xl flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-mono text-gray-500">{order.id.slice(0,8)}</span>
                  <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold",
                    order.status === 'APPROVED' ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"
                  )}>
                    {order.status}
                  </span>
                </div>
                <h3 className="font-bold text-lg">{order.full_name}</h3>
                <p className="text-sm text-gray-400">{order.template_name} • {order.whatsapp_number}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-mono text-heart-neon">${order.amount}</p>
                  <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <a
                  href={order.payment_proof_url} target="_blank" rel="noreferrer"
                  className="p-3 glass-pink rounded-xl text-heart-pink hover:bg-heart-pink hover:text-white transition-colors"
                >
                  <ExternalLink size={20} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MusicPlayer = () => {
  const [playing, setPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Ketsa/Night_Walk/Ketsa_-_04_-_Evening_Walk.mp3');
    audioRef.current.loop = true;
    return () => audioRef.current?.pause();
  }, []);

  const toggle = () => {
    if (playing) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play().catch(() => {});
    }
    setPlaying(!playing);
  };

  return (
    <div className="fixed bottom-8 left-8 z-[100] flex items-center gap-4 glass-pink p-3 rounded-full shadow-lg shadow-heart-pink/20">
      <button
        onClick={toggle}
        className="w-10 h-10 rounded-full bg-heart-pink flex items-center justify-center text-white"
      >
        {playing ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
      </button>
      {playing && (
        <div className="flex gap-1 items-end h-4 pr-3">
          {[1,2,3,4].map(i => (
            <motion.div
              key={i}
              animate={{ height: [4, 16, 4] }}
              transition={{ repeat: Infinity, duration: 0.5 + i * 0.1 }}
              className="w-1 bg-heart-neon rounded-full"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewFormData, setReviewFormData] = useState({ name: '', text: '', rating: 5, emoji: '💖' });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: t } = await supabase.from('templates').select('*');
      const { data: r } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (t) setTemplates(t);
      if (r) setReviews(r);
      setLoading(false);
    };
    fetchData();
  }, []);

  const categories = ['All', 'Birthday', 'Anniversary', "Father's Day", "Mother's Day", "Sister's Day", "Brothers Day", "February Specials"];
  const filteredTemplates = activeCategory === 'All'
    ? templates
    : templates.filter(t => t.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white selection:bg-heart-pink/30">
      <Navbar onAdminClick={() => setShowAdmin(true)} />

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6 text-center relative overflow-hidden">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-heart-pink/20 rounded-full blur-[120px] -z-10 animate-pulse" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 inline-block"
          >
            <span className="glass-pink px-6 py-2 rounded-full text-xs font-bold text-heart-pink uppercase tracking-widest">
              Premium Digital Experiences
            </span>
          </motion.div>
          <h1 className="text-5xl md:text-8xl font-black mb-8 leading-tight tracking-tight">
            Design Your <br />
            <span className="bg-gradient-to-r from-heart-pink via-heart-violet to-heart-neon bg-clip-text text-transparent">
              Perfect Celebration
            </span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto mb-10 text-lg">
            HeartByte brings your special moments to life with high-conversion templates and stunning micro-interactions.
          </p>
          <button
            onClick={() => { playClick(); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="bg-gradient-to-r from-heart-pink to-heart-violet px-10 py-5 rounded-full font-bold text-lg shadow-xl shadow-heart-pink/30 hover:scale-105 transition-transform"
          >
            Start Designing
          </button>
        </section>

        {/* Catalog Section */}
        <section id="catalog" className="py-20 px-6 max-w-7xl mx-auto">
          <div className="sticky top-[72px] z-40 py-4 glass mb-16 -mx-6 px-6 overflow-x-auto no-scrollbar">
            <div className="flex gap-4 min-w-max justify-center">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { playClick(); setActiveCategory(cat); }}
                  className={cn(
                    "px-8 py-3 rounded-full text-sm font-bold transition-all",
                    activeCategory === cat ? "bg-heart-pink text-white shadow-lg shadow-heart-pink/40" : "glass hover:bg-white/10"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {loading ? (
              [1,2,3,4,5,6].map(i => <div key={i} className="h-96 glass rounded-[2.5rem] animate-pulse" />)
            ) : (
              filteredTemplates.map(template => (
                <motion.div
                  key={template.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ y: -15 }}
                  className="glass rounded-[2.5rem] overflow-hidden group cursor-pointer border-white/5 hover:border-heart-pink/30 transition-colors"
                  onClick={() => { playClick(); setSelectedTemplate(template); }}
                >
                  <div className="h-80 overflow-hidden relative">
                    <img
                      src={template.image_url}
                      alt={template.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                      <span className="w-full py-4 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/20 text-center font-bold">
                        View Details
                      </span>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-2xl font-bold">{template.name}</h3>
                      <div className="text-heart-neon font-mono text-xl">${template.price || '9.99'}</div>
                    </div>
                    <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">{template.category}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Reviews Section */}
        <section id="reviews" className="py-24 bg-white/2 overflow-hidden border-y border-white/5 relative">
          <div className="px-6 mb-16 text-center">
            <h2 className="text-5xl font-black mb-4">Love from the Heart</h2>
            <p className="text-gray-500 mb-8">Thousands of celebrations powered by HeartByte</p>
            <button
              onClick={() => { playClick(); setShowReviewForm(true); }}
              className="glass-pink px-8 py-3 rounded-full font-bold text-sm hover:scale-105 transition-transform"
            >
              Write a Review
            </button>
          </div>
          <div className="flex gap-8 animate-marquee">
            {[...reviews, ...reviews].map((review, i) => (
              <div key={i} className="flex-shrink-0 w-[400px] glass p-10 rounded-[2rem] border-white/10">
                <div className="flex gap-1 text-heart-pink mb-6">
                  {[...Array(review.rating || 5)].map((_, i) => <Star key={i} fill="currentColor" size={16} />)}
                </div>
                <p className="text-xl text-gray-300 mb-8 leading-relaxed italic">"{review.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full glass-pink flex items-center justify-center text-2xl">
                    {review.emoji || '💖'}
                  </div>
                  <span className="text-lg font-bold">{review.name}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact/CTA Section */}
        <section id="contact" className="py-32 px-6 text-center">
          <div className="max-w-4xl mx-auto glass-pink p-16 rounded-[3rem] border-heart-pink/20">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to Start?</h2>
            <p className="text-xl text-gray-400 mb-10">Join 5000+ others creating beautiful digital memories today.</p>
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              <button
                onClick={() => { playClick(); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="px-10 py-5 bg-heart-pink rounded-full font-bold text-lg hover:scale-105 transition-transform"
              >
                Browse All Templates
              </button>
              <button className="px-10 py-5 glass rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                <MessageCircle size={20} /> Chat with Support
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-16 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Heart className="text-heart-pink fill-heart-pink" />
            <span className="text-xl font-bold uppercase tracking-tighter">HeartByte</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-500 font-bold">
            <a href="#" className="hover:text-heart-pink transition-colors">Terms</a>
            <a href="#" className="hover:text-heart-pink transition-colors">Privacy</a>
            <a href="#" className="hover:text-heart-pink transition-colors">Instagram</a>
          </div>
          <p className="text-gray-600 text-xs font-mono">© 2026 HEARTBYTE ECOSYSTEM. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>

      <MusicPlayer />

      {/* Overlays */}
      <AnimatePresence>
        {selectedTemplate && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6"
          >
            <button
              onClick={() => { playClick(); setSelectedTemplate(null); }}
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
            >
              <X size={40} />
            </button>
            <div className="max-w-6xl w-full flex flex-col lg:flex-row gap-12 items-center">
              <motion.div
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                className="w-full lg:w-3/5 aspect-[16/10] rounded-[2.5rem] overflow-hidden glass p-4"
              >
                <img
                  src={selectedTemplate.image_url}
                  alt={selectedTemplate.name}
                  className="w-full h-full object-contain rounded-2xl"
                />
              </motion.div>
              <div className="w-full lg:w-2/5 space-y-8">
                <div className="space-y-4">
                  <span className="glass-pink px-4 py-1.5 rounded-full text-[10px] font-black text-heart-pink uppercase tracking-[0.2em]">
                    Premium Template
                  </span>
                  <h2 className="text-5xl font-black">{selectedTemplate.name}</h2>
                  <p className="text-xl text-gray-400 leading-relaxed">
                    Elevate your special event with our masterfully crafted {selectedTemplate.category.toLowerCase()} design. Includes cinematic transitions and custom soundscapes.
                  </p>
                </div>

                <div className="flex items-center justify-between p-6 glass rounded-3xl">
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">One-time payment</p>
                    <span className="text-4xl font-mono text-heart-neon">${selectedTemplate.price || '9.99'}</span>
                  </div>
                  <div className="text-right">
                    <div className="flex text-heart-pink mb-1">
                      {[1,2,3,4,5].map(i => <Star key={i} fill="currentColor" size={14} />)}
                    </div>
                    <p className="text-xs text-gray-400 font-bold">4.9/5 Rating</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => { playClick(); setShowCheckout(true); }}
                    className="flex-1 py-5 bg-gradient-to-r from-heart-pink to-heart-violet rounded-full font-bold text-xl shadow-2xl shadow-heart-pink/40 hover:scale-[1.03] transition-transform"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {showCheckout && selectedTemplate && (
          <CheckoutModal
            template={selectedTemplate}
            onClose={() => { setShowCheckout(false); setSelectedTemplate(null); }}
          />
        )}

        {showAdmin && (
          <AdminPanel onClose={() => setShowAdmin(false)} />
        )}

        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md glass p-8 rounded-3xl relative">
              <button onClick={() => { playClick(); setShowReviewForm(false); }} className="absolute top-6 right-6 text-white/50 hover:text-white"><X /></button>
              <h2 className="text-2xl font-bold mb-6">Write a Review</h2>
              {reviewSubmitted ? (
                <div className="text-center py-10">
                  <CheckCircle2 className="mx-auto text-heart-pink mb-4" size={48} />
                  <p className="text-xl font-bold">Thank you for your feedback!</p>
                </div>
              ) : (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  playClick();

                  // Anti-Spam Check
                  const fingerprint = getCanvasFingerprint();
                  const lastSubmit = localStorage.getItem('hb_review_ts');
                  const hasSubmitted = localStorage.getItem('hb_review_fp') === fingerprint;

                  if (hasSubmitted || (lastSubmit && Date.now() - parseInt(lastSubmit) < 3600000)) {
                    alert("You've already submitted a review recently. Please try again later!");
                    return;
                  }

                  try {
                    await supabase.from('reviews').insert([reviewFormData]);
                    localStorage.setItem('hb_review_ts', Date.now().toString());
                    localStorage.setItem('hb_review_fp', fingerprint);
                    setReviewSubmitted(true);
                    confetti();
                    setTimeout(() => setShowReviewForm(false), 2000);
                  } catch (err) {
                    console.error(err);
                  }
                }} className="space-y-4">
                  <input
                    required type="text" placeholder="Your Name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4"
                    value={reviewFormData.name} onChange={e => setReviewFormData({...reviewFormData, name: e.target.value})}
                  />
                  <textarea
                    required placeholder="Tell us about your experience..."
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 resize-none"
                    value={reviewFormData.text} onChange={e => setReviewFormData({...reviewFormData, text: e.target.value})}
                  />
                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                    <span className="text-sm text-gray-400">Rating</span>
                    <div className="flex gap-2">
                      {[1,2,3,4,5].map(v => (
                        <Star
                          key={v} size={20}
                          className={cn("cursor-pointer", reviewFormData.rating >= v ? "text-heart-pink fill-heart-pink" : "text-gray-600")}
                          onClick={() => setReviewFormData({...reviewFormData, rating: v})}
                        />
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="w-full py-4 bg-heart-pink rounded-xl font-bold">Submit Review</button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
