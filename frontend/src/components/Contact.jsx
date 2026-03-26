import { useState } from 'react';
import React from 'react';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [submitted, setSubmitted] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    // Show success message
    setSubmitted(true);
    // Reset form after submission
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
    // Reset success message after 5 seconds
    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };
  
  return (
    <div className="min-h-screen bg-teal-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-600 to-green-500 py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-white text-center">Contact Us</h1>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          
          
          {/* Contact Form */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-teal-600 border-b-2 border-teal-200 pb-2 mb-6">Send Us a Message</h2>
              
              {submitted && (
                <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6">
                  <p className="font-medium">Thank you for your message!</p>
                  <p>We'll get back to you as soon as possible.</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Name Input */}
                  <div>
                    <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Your Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-500"
                      required
                    />
                  </div>
                  
                  {/* Email Input */}
                  <div>
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Your Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-500"
                      required
                    />
                  </div>
                  
                  {/* Phone Input */}
                  <div>
                    <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-500"
                    />
                  </div>
                  
                  {/* Subject Input */}
                  <div>
                    <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">Subject *</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-500"
                      required
                    >
                      <option value="">Please select</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Partnership">Partnership Opportunity</option>
                      <option value="Feedback">Feedback</option>
                    </select>
                  </div>
                </div>
                
                {/* Message Input */}
                <div className="mb-6">
                  <label htmlFor="message" className="block text-gray-700 font-medium mb-2 ">Your Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="6"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-500"
                    required
                  ></textarea>
                </div>
                
                {/* Submit Button */}
                <div className="text-right">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-teal-600 to-green-600 text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 transition duration-300"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
            
            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
              <h2 className="text-2xl font-bold text-teal-600 border-b-2 border-teal-200 pb-2 mb-6">Frequently Asked Questions</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-teal-700 mb-1">What areas do your waste management services cover?</h3>
                  <p className="text-gray-700">Our services currently cover major metropolitan areas with plans for expansion. Please contact us to check if your location is serviced.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-teal-700 mb-1">How can I schedule a waste pickup?</h3>
                  <p className="text-gray-700">You can schedule a pickup through our mobile app or web portal. For assistance, please contact our support team.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-teal-700 mb-1">Do you offer recycling services?</h3>
                  <p className="text-gray-700">Yes, we offer comprehensive recycling solutions for various materials. Our team can provide tailored recycling programs for your specific needs.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      
    </div>
  );
}
