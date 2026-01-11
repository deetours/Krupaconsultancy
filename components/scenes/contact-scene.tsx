"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "@/hooks/use-in-view";
import { toast } from "@/hooks/use-toast";

interface ContactSceneProps {
  className?: string;
}

export function ContactScene({ className = "" }: ContactSceneProps) {
  const [ref, isInView] = useInView({ threshold: 0.2 });
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Please fill in all fields",
        description: "We need your name, email, and message to get back to you.",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate sending (in real app, would call API)
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast({
        title: "Message received",
        description: "We'll be in touch within a day.",
      });
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({ name: "", email: "", message: "" });
        setIsSubmitted(false);
      }, 3000);
    }, 800);
  };

  return (
    <section
      ref={ref}
      className={`min-h-screen flex items-center px-6 md:px-12 py-24 md:py-32 bg-[#FDFBF7] ${className}`}
    >
      <div className="max-w-2xl mx-auto w-full">
        {/* Arrival space */}
        <div className="h-12 md:h-16" />

        {/* Opening sentence */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-4xl md:text-5xl lg:text-6xl text-gray-900 mb-16 leading-tight"
          style={{ fontFamily: "var(--font-crimson)" }}
        >
          What's on your mind?
        </motion.h1>

        {/* Form Section */}
        {!isSubmitted ? (
          <motion.form
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            onSubmit={handleSubmit}
            className="space-y-6 mb-12"
          >
            {/* Name field */}
            <motion.div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Your name
              </label>
              <motion.input
                whileFocus={{ y: -2 }}
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="What should we call you?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all duration-300"
                style={{ fontFamily: "var(--font-inter)" }}
              />
            </motion.div>

            {/* Email field */}
            <motion.div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Email address
              </label>
              <motion.input
                whileFocus={{ y: -2 }}
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="we'll reply here"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all duration-300"
                style={{ fontFamily: "var(--font-inter)" }}
              />
            </motion.div>

            {/* Message field */}
            <motion.div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-2"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Your message
              </label>
              <motion.textarea
                whileFocus={{ y: -2 }}
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us what you're thinking..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all duration-300 resize-none"
                style={{ fontFamily: "var(--font-inter)" }}
              />
            </motion.div>

            {/* Submit button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-lg border border-gray-300 text-gray-800 font-medium hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {isSubmitting ? "Sending..." : "Send message"}
            </motion.button>
          </motion.form>
        ) : (
          /* Success message */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 p-8 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="w-8 h-8 mx-auto mb-4 rounded-full border-2 border-gray-600 flex items-center justify-center"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <p
              className="text-center text-gray-700 font-medium"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Thanks for reaching out.
            </p>
            <p
              className="text-center text-gray-500 text-sm mt-2"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              We'll be in touch within a day.
            </p>
          </motion.div>
        )}

        {/* Reassurance line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center text-sm text-gray-500 mb-12"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          We usually reply within a day. No sales calls unless you want one.
        </motion.p>

        {/* Alternative contact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center"
        >
          <p className="text-sm text-gray-500 mb-2" style={{ fontFamily: "var(--font-inter)" }}>
            Or write directly:
          </p>
          <a
            href="mailto:hello@krupa.ai"
            className="text-gray-700 hover:text-gray-900 underline underline-offset-2 font-medium transition-colors"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            hello@krupa.ai
          </a>
        </motion.div>

        {/* Exit space */}
        <div className="h-12 md:h-16" />
      </div>
    </section>
  );
}

export default ContactScene;
