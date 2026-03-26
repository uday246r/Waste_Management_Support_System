import { useState } from 'react';
import { Link } from 'react-router-dom';
import React from 'react';

export default function AboutUs() {
  const [activeTab, setActiveTab] = useState('mission');
  
  return (
    <div className="min-h-screen bg-teal-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-600 to-green-500 py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-white text-center">About Us</h1>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Tabs */}
        <div className="flex flex-wrap justify-center mb-8">
          <button 
            className={`px-6 py-3 font-medium rounded-t-lg transition duration-300 ${activeTab === 'mission' ? 'bg-white text-teal-600 border-t-2 border-teal-500' : 'bg-teal-100 text-teal-700'}`}
            onClick={() => setActiveTab('mission')}
          >
            Our Mission
          </button>
          <button 
            className={`px-6 py-3 font-medium rounded-t-lg transition duration-300 ${activeTab === 'team' ? 'bg-white text-teal-600 border-t-2 border-teal-500' : 'bg-teal-100 text-teal-700'}`}
            onClick={() => setActiveTab('team')}
          >
            Our Team
          </button>
          <button 
            className={`px-6 py-3 font-medium rounded-t-lg transition duration-300 ${activeTab === 'approach' ? 'bg-white text-teal-600 border-t-2 border-teal-500' : 'bg-teal-100 text-teal-700'}`}
            onClick={() => setActiveTab('approach')}
          >
            Our Approach
          </button>
        </div>
        
        {/* Content Panel */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Mission Content */}
          {activeTab === 'mission' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-teal-600 border-b-2 border-teal-200 pb-2">Our Mission</h2>
              <p className="text-gray-700">
                We are committed to revolutionizing waste management practices through innovative technology solutions. 
                We believe that effective waste management is not just an environmental necessity but a cornerstone 
                for building sustainable communities.
              </p>
              <div className="bg-teal-100 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-teal-700 mb-3">Our Solutions</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Smart waste collection scheduling systems</li>
                  <li>Recycling analytics and optimization</li>
                  <li>Community engagement tools for better waste sorting</li>
                  <li>Real-time monitoring of waste management operations</li>
                </ul>
              </div>
            </div>
          )}
          
          {/* Team Content */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-teal-600 border-b-2 border-teal-200 pb-2">Our Team</h2>
              <p className="text-gray-700">
                We are a passionate team of four professionals united by our commitment to environmental 
                sustainability and technological innovation.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                {/* Team Member 1 */}
                <div className="bg-teal-50 rounded-lg p-6 shadow-md">
                  <h3 className="text-xl font-bold text-teal-600">Uday</h3>
                  <p className="text-gray-600 font-medium">Backend Developer</p>
                  <p className="mt-3 text-gray-700">
                  Uday specializes in server-side architecture and database optimization. His expertise in 
                      building robust APIs and implementing efficient data processing algorithms has been 
                      crucial for our waste management tracking systems.
                  </p>
                </div>
                
                {/* Team Member 2 */}
                <div className="bg-teal-50 rounded-lg p-6 shadow-md">
                  <h3 className="text-xl font-bold text-teal-600">Tushar Vashisht</h3>
                  <p className="text-gray-600 font-medium">Backend Developer</p>
                  <p className="mt-3 text-gray-700">
                  Tushar focuses on backend infrastructure and data engineering. He has developed our core 
                      waste analytics engine and the company's routing system for waste collection.
                  </p>
                </div>
                
                {/* Team Member 3 */}
                <div className="bg-teal-50 rounded-lg p-6 shadow-md">
                  <h3 className="text-xl font-bold text-teal-600">Tania</h3>
                  <p className="text-gray-600 font-medium">Frontend Developer</p>
                  <p className="mt-3 text-gray-700">
                  Tania specializes in creating intuitive user interfaces and responsive designs. Her 
                      work ensures that our waste management applications are accessible and easy to use across 
                      all devices, enhancing community engagement.
                  </p>
                </div>
                
                {/* Team Member 4 */}
                <div className="bg-teal-50 rounded-lg p-6 shadow-md">
                  <h3 className="text-xl font-bold text-teal-600">Vaishali Kumari</h3>
                  <p className="text-gray-600 font-medium">Frontend Developer</p>
                  <p className="mt-3 text-gray-700">
                  Vaishali excels in interactive web development and visualization tools. She has created 
                      the dynamic dashboards and reporting interfaces that help users understand waste data 
                      and make informed decisions about recycling and disposal.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Approach Content */}
          {activeTab === 'approach' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-teal-600 border-b-2 border-teal-200 pb-2">Our Approach</h2>
              <p className="text-gray-700">
                We understand that effective waste management requires more than just technology—it demands 
                a holistic approach that considers environmental impact, community needs, and economic sustainability.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="bg-teal-100 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold text-teal-700">Innovation</h3>
                  <p className="mt-2 text-gray-700">
                    We leverage cutting-edge technology to create efficient waste management solutions.
                  </p>
                </div>
                
                <div className="bg-teal-100 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold text-teal-700">Sustainability</h3>
                  <p className="mt-2 text-gray-700">
                    All our processes and recommendations prioritize environmental sustainability.
                  </p>
                </div>
                
                <div className="bg-teal-100 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold text-teal-700">Accessibility</h3>
                  <p className="mt-2 text-gray-700">
                    We believe that effective waste management should be accessible to everyone.
                  </p>
                </div>
                
                <div className="bg-teal-100 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold text-teal-700">Community Focus</h3>
                  <p className="mt-2 text-gray-700">
                    We work closely with communities to tailor our solutions to their specific needs.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 bg-gradient-to-r from-teal-600 to-green-600 text-white p-6 rounded-lg text-center">
                <h3 className="text-2xl font-bold mb-3">Join Us in Creating a Cleaner Future</h3>
                <p>
                  We believe that responsible waste management is a collective effort. Join us in our mission 
                  to create a cleaner, more sustainable future.
                </p>
                <Link to="/contact">
                  <button className="mt-4 bg-white text-teal-600 font-bold py-2 px-6 rounded-lg hover:bg-teal-50 transition duration-300">
                    Contact Us
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      {/* <footer className="bg-green-600 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="font-medium">Waste Management Support System</p>
          <p className="text-green-100 text-sm mt-2">© 2025 All Rights Reserved</p>
        </div>
      </footer> */}
    </div>
  );
}