import React, { useEffect, useState } from 'react';
import { BASE_URL } from "../utils/constants";
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { addFeed } from "../utils/feedSlice";
import UserCard from './UserCard';
import CompanyCard from './CompanyCard';

const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'companies', 'tips', 'news'
  
  // Waste management tips
  const wasteTips = [
    {
      id: 'tip1',
      title: "Composting 101",
      description: "Turn kitchen scraps into garden gold! Learn how to start composting at home with minimal space requirements.",
      imageUrl: "https://thesustainablebrandsjournal.com/wp-content/uploads/2024/04/Untitled-design-91-1024x683.jpg",
      category: "Organic Waste",
      readTime: "3 min read"
    },
    {
      id: 'tip2',
      title: "Plastic-Free Alternatives",
      description: "Discover everyday swaps to eliminate single-use plastics from your daily routine.",
      imageUrl: "https://parade.com/.image/t_share/MTkwNTc1OTY5MTUyODY5NTAx/how-to-quit-single-use-plastic.jpg",
      category: "Plastic Reduction",
      readTime: "4 min read"
    },
    {
      id: 'tip3',
      title: "E-Waste Recycling Guide",
      description: "What to do with old electronics? This guide explains how to responsibly dispose of e-waste.",
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJFvwg1P7l6SZ6BqavtCyhQNQX4Q-nKgvJnA&s",
      category: "Electronic Waste",
      readTime: "5 min read"
    }
  ];
  
  // Waste management news
  const wasteNews = [
    {
      id: 'news1',
      title: "New Recycling Policy Launched",
      description: "Local government introduces incentives for households participating in expanded recycling programs.",
      publishedDate: "May 1, 2025",
      source: "Environmental Times",
      imageUrl: "https://media.springernature.com/lw1200/springer-static/image/art%3A10.1007%2Fs10640-021-00640-3/MediaObjects/10640_2021_640_Fig4_HTML.jpg"
    },
    {
      id: 'news2',
      title: "Breakthrough in Plastic Degradation",
      description: "Scientists discover new enzyme that breaks down plastic waste in record time.",
      publishedDate: "April 28, 2025",
      source: "Science Daily",
      imageUrl: "https://scx2.b-cdn.net/gfx/news/hires/2022/new-enzyme-discovery-i-1.jpg"
    },
    {
      id: 'news3',
      title: "Community Clean-Up Initiative Grows",
      description: "Volunteer-led waste collection program expands to 50 cities nationwide.",
      publishedDate: "April 22, 2025",
      source: "Community News",
      imageUrl: "https://earth5r.org/wp-content/uploads/2025/04/Community-Led-Waste-Segregation-Sustainability-ESG-CSR-Earth5R-NGO-Mumbai-6.jpg"
    }
  ];

  const getFeed = async () => {
    try {
      setLoading(true);
      const res = await axios.get(BASE_URL + "/user/feed", { withCredentials: true });
      dispatch(addFeed(res?.data?.data));
    } catch (err) {
      console.log("Feed data not received");
      setError("Failed to load feed data");
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  useEffect(() => {
    getFeed();
  }, []);

  useEffect(() => {
    if (!loading && feed.length === 0) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [feed]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-teal-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-teal-700 font-medium">Loading your eco-friendly feed...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-teal-50 to-green-50">
        <div className="bg-white p-8 rounded-lg shadow-lg border-l-4 border-red-500 max-w-md">
          <h2 className="text-xl font-semibold text-red-600">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => {
              setError(null);
              getFeed();
            }}
            className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Filter to only show company cards
  const companyFeed = feed.filter(item => item?.companyName);
  
  // Function to render sustainability tip cards
  const renderTipCard = (tip) => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="md:flex">
        <div className="md:shrink-0">
          <img className="h-48 w-full object-cover md:h-full md:w-48" src={tip.imageUrl} alt={tip.title} />
        </div>
        <div className="p-6">
          <div className="uppercase tracking-wide text-xs text-teal-600 font-bold">{tip.category}</div>
          <h3 className="mt-2 text-xl font-semibold leading-tight text-gray-900">{tip.title}</h3>
          <p className="mt-2 text-gray-600">{tip.description}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">{tip.readTime}</span>
            <button className="text-teal-600 hover:text-teal-800 text-sm font-medium">Read More →</button>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Function to render news cards
  const renderNewsCard = (news) => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <img className="w-full h-48 object-cover" src={news.imageUrl} alt={news.title} />
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900">{news.title}</h3>
        <p className="mt-2 text-gray-600">{news.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-500">{news.source}</span>
            <span className="mx-2 text-gray-300">|</span>
            <span className="text-sm text-gray-500">{news.publishedDate}</span>
          </div>
          <button className="text-teal-600 hover:text-teal-800 text-sm font-medium">Read Article →</button>
        </div>
      </div>
    </div>
  );


  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-green-50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-teal-600 to-green-500 rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="px-8 py-12 md:flex items-center justify-between">
            <div className="md:w-2/3 mb-6 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold text-white">Waste Management Hub</h1>
              <p className="mt-3 text-teal-50 text-lg">Discover companies, tips, and news about sustainable waste management.</p>
            </div>
            <div className="md:w-1/3 flex justify-end">
              <button 
                onClick={getFeed}
                className="bg-white text-teal-600 hover:bg-teal-50 shadow-md font-medium px-5 py-3 rounded-lg transition-all duration-300 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Feed
              </button>
            </div>
          </div>
        </div>
        
        {/* Tabs Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('all')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-md ${
                activeTab === 'all'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Updates
            </button>
            <button
              onClick={() => setActiveTab('companies')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-md ${
                activeTab === 'companies'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Companies
            </button>
            <button
              onClick={() => setActiveTab('tips')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-md ${
                activeTab === 'tips'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sustainability Tips
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-md ${
                activeTab === 'news'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Industry News
            </button>
          </nav>
        </div>

        {/* Content based on active tab */}
        <div className="space-y-8">
          {/* Companies */}
          {(activeTab === 'all' || activeTab === 'companies') && (
            <>
              {activeTab === 'companies' && (
                <h2 className="text-2xl font-bold text-teal-800 mb-4">Waste Management Companies</h2>
              )}
              {activeTab === 'all' && (
                <h2 className="text-2xl font-bold text-teal-800 mb-4">Featured Companies</h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companyFeed.slice(0, activeTab === 'all' ? 3 : undefined).map((item, index) => (
                  <div key={item._id || index} className="transform transition-all duration-300 hover:-translate-y-1">
                    <CompanyCard company={item} />
                  </div>
                ))}
                {companyFeed.length === 0 && (
                  <div className="col-span-3 bg-white p-8 rounded-lg shadow text-center">
                    <p className="text-gray-600">No companies found. Check back later!</p>
                  </div>
                )}
              </div>
              {activeTab === 'all' && companyFeed.length > 3 && (
                <div className="text-center mt-4">
                  <button 
                    onClick={() => setActiveTab('companies')}
                    className="text-teal-600 hover:text-teal-800 font-medium flex items-center mx-auto"
                  >
                    View All Companies
                    <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}

          {/* Sustainability Tips */}
          {(activeTab === 'all' || activeTab === 'tips') && (
            <>
              {activeTab === 'tips' && (
                <h2 className="text-2xl font-bold text-teal-800 mb-4">Waste Reduction Tips</h2>
              )}
              {activeTab === 'all' && (
                <h2 className="text-2xl font-bold text-teal-800 mb-4">Trending Tips</h2>
              )}
              <div className="space-y-6">
                {wasteTips.slice(0, activeTab === 'all' ? 2 : undefined).map((tip) => (
                  <div key={tip.id} className="transform transition-all duration-300 hover:-translate-y-1">
                    {renderTipCard(tip)}
                  </div>
                ))}
              </div>
              {activeTab === 'all' && wasteTips.length > 2 && (
                <div className="text-center mt-4">
                  <button 
                    onClick={() => setActiveTab('tips')}
                    className="text-teal-600 hover:text-teal-800 font-medium flex items-center mx-auto"
                  >
                    View All Tips
                    <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}

          {/* Industry News */}
          {(activeTab === 'all' || activeTab === 'news') && (
            <>
              {activeTab === 'news' && (
                <h2 className="text-2xl font-bold text-teal-800 mb-4">Waste Management News</h2>
              )}
              {activeTab === 'all' && (
                <h2 className="text-2xl font-bold text-teal-800 mb-4">Latest News</h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wasteNews.slice(0, activeTab === 'all' ? 3 : undefined).map((news) => (
                  <div key={news.id} className="transform transition-all duration-300 hover:-translate-y-1">
                    {renderNewsCard(news)}
                  </div>
                ))}
              </div>
              {activeTab === 'all' && wasteNews.length > 3 && (
                <div className="text-center mt-4">
                  <button 
                    onClick={() => setActiveTab('news')}
                    className="text-teal-600 hover:text-teal-800 font-medium flex items-center mx-auto"
                  >
                    View All News
                    <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        
        {activeTab !== 'all' && (
          <div className="mt-12 text-center text-gray-500 text-sm">
            {activeTab === 'companies' && `End of companies • ${companyFeed.length} items shown`}
            {activeTab === 'tips' && `End of tips • ${wasteTips.length} items shown`}
            {activeTab === 'news' && `End of news • ${wasteNews.length} items shown`}
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;