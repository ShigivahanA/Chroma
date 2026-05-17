import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitContact } from '../utils/api';
import SEO from '../components/SEO';

const Connect = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    try {
      await submitContact(formData);
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      const errorDetail = err.response?.data?.error ? ` (${err.response.data.error})` : '';
      setErrorMessage((err.response?.data?.message || 'Message failed to send.') + errorDetail);
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-art-white flex items-center justify-center relative px-6 md:px-12">
      <SEO
        title="Connect"
        description="Get in touch with the Chroma team. Send us a message for collaborations, feedback, or any questions about our color palette tools."
        path="/connect"
      />

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {(status === 'success' || status === 'error') && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%", scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
            exit={{ opacity: 0, y: -20, x: "-50%", scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 p-4 border-2 border-art-black rounded-xl font-mono text-[10px] uppercase tracking-wider font-extrabold shadow-[4px_4px_0px_0px_#000100] max-w-[280px] sm:max-w-xs text-center ${
              status === 'success'
                ? 'bg-[#94C5CC] text-art-black'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {status === 'success' ? 'Message sent successfully ✓' : errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-5xl z-10 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center">

        {/* Left Side */}
        <div className="space-y-6">
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-sans font-black tracking-tighter text-art-black uppercase leading-none select-none">
            Get in<br /><span className="text-art-teal">Touch.</span>
          </h1>
          <p className="font-mono text-xs sm:text-sm text-art-gray tracking-widest uppercase max-w-sm">
            Have a question or want to work together? Drop us a message.
          </p>
        </div>

        {/* Right Side — Form */}
        <div className="w-full">
          <form onSubmit={handleSubmit} className="bg-art-white border-2 border-art-black rounded-2xl p-6 sm:p-8 space-y-5 shadow-[6px_6px_0px_0px_#000100]">

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-art-gray font-bold">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-art-black/[0.03] border border-art-gray/30 focus:border-art-teal rounded-lg py-3 px-4 font-sans text-sm text-art-black focus:outline-none transition-colors placeholder:text-art-gray/50"
                placeholder="Your name"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-art-gray font-bold">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-art-black/[0.03] border border-art-gray/30 focus:border-art-teal rounded-lg py-3 px-4 font-sans text-sm text-art-black focus:outline-none transition-colors placeholder:text-art-gray/50"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-art-gray font-bold">Message</label>
              <textarea
                required
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-art-black/[0.03] border border-art-gray/30 focus:border-art-teal rounded-lg py-3 px-4 font-sans text-sm text-art-black focus:outline-none transition-colors placeholder:text-art-gray/50 resize-none"
                placeholder="Write your message here..."
              />
            </div>

            <button
              type="submit"
              disabled={status === 'sending' || status === 'success'}
              className="w-full py-3.5 bg-art-black text-art-white hover:bg-art-teal hover:text-art-black transition-all duration-300 rounded-lg font-sans text-xs tracking-[0.2em] font-black uppercase cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === 'idle' || status === 'error' ? (
                'Send Message'
              ) : status === 'sending' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Sent ✓'
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Connect;
