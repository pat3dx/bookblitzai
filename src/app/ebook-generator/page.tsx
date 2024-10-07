"use client";

import Head from 'next/head';
import { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import 'tailwindcss/tailwind.css';
import DownloadButton from '../../components/DownloadButton';
import { useUser } from '@clerk/nextjs';

const EbookGenerator = () => {
  const { user } = useUser();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [language, setLanguage] = useState('English (US)');
  const [ebookType, setEbookType] = useState('Non-Fiction');
  const [topic, setTopic] = useState('');
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [writingStyle, setWritingStyle] = useState('');
  const [outline, setOutline] = useState('');
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(25000);
  const [progress, setProgress] = useState(0);

  // New state variables for Amazon data
  const [amazonCategories, setAmazonCategories] = useState('');
  const [longTailKeywords, setLongTailKeywords] = useState('');
  const [priceSuggestions, setPriceSuggestions] = useState('');
  const [twitterPost, setTwitterPost] = useState('');
  const [blogPostTitles, setBlogPostTitles] = useState('');
  const [bookSeries, setBookSeries] = useState('');

  const languages = [
    "Arabic", "Bengali", "Chinese (Simplified)", "Chinese (Traditional)", "English (US)",
    "French", "German", "Hindi", "Indonesian", "Italian", "Japanese", "Korean",
    "Malay", "Persian", "Portuguese (Brazil)", "Portuguese (Portugal)", "Punjabi",
    "Russian", "Spanish", "Swahili", "Tamil", "Telugu", "Thai", "Turkish", "Vietnamese"
  ];

  const ebookTypes = [
    "Non-Fiction", "Novel", "Fantasy Novel", "Mystery Novel", "Science Fiction",
    "Romance", "Thriller", "Historical Fiction", "Young Adult", "Dystopian",
    "Adventure", "Horror", "Biography", "Autobiography", "Self-Help",
    "Health", "Travel", "Cooking", "Art", "Music",
    "Poetry", "Drama", "Children’s Book", "Short Story", "Graphic Novel",
    "Personal Development", "True Crime", "Spiritual", "Business", "Memoir"
  ];

  // Use useCallback to memoize suggestDetails and fix eslint warnings
  const suggestDetails = useCallback(async (topic: string, lang: string) => {
    console.log('Requesting AI suggestions for topic:', topic, 'in language:', lang);
    try {
      const response = await fetch('/api/suggestDetails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, language: lang, ebookType })
      });

      if (response.ok) {
        const { title, genre, targetAudience, writingStyle } = await response.json();
        console.log('AI suggestions:', { title, genre, targetAudience, writingStyle });
        setTitle(title);
        setGenre(genre);
        setTargetAudience(targetAudience);
        setWritingStyle(writingStyle);
      } else {
        console.error('Error fetching details from AI:', response.statusText);
      }
    } catch (error) {
      console.error('Error during API call:', error);
    }
  }, [ebookType]);

  useEffect(() => {
    const savedTopic = localStorage.getItem('selectedKeyword') || '';
    setTopic(savedTopic);

    if (savedTopic) {
      suggestDetails(savedTopic, language);
    }
  }, [language, suggestDetails]);

  useEffect(() => {
    if (topic) {
      suggestDetails(topic, language);
    }
  }, [topic, language, suggestDetails]);

  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user, checkSubscription]);

  const checkSubscription = useCallback(async () => {
    if (!user) return;

    try {
      const userMetadata = await user.getOrganizationMemberships();
      
      console.log('User:', user);
      console.log('User Metadata:', userMetadata);
      
      setIsAdmin(userMetadata.some(membership => membership.role === 'admin'));
      setIsSubscribed(userMetadata.some(membership => membership.role === 'member' && membership.status === 'active') || userMetadata.some(membership => membership.role === 'admin'));
      
      console.log('Is Admin:', isAdmin);
      console.log('Is Subscribed:', isSubscribed);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  }, [user]);

  if (!isSubscribed && !isAdmin) {
    console.log('Access denied. Is Subscribed:', isSubscribed, 'Is Admin:', isAdmin);
    return (
      <div className="text-center mt-10">
        <h1 className="text-2xl font-bold">Upgrade to Access Ebook Generator</h1>
        <p className="mt-4">Please subscribe to use this feature.</p>
        <a href="/pricing" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded">
          View Pricing
        </a>
      </div>
    );
  }

  const handleGenerateOutline = async () => {
    try {
      const response = await fetch('/api/generateOutline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          ebookType,
          topic,
          genre,
          targetAudience,
          writingStyle,
          wordCount,
        }),
      });
      
      if (response.ok) {
        const { outlineContent } = await response.json();
        setOutline(outlineContent);
        setContent('');
        console.log('Outline generated successfully.');
      } else {
        console.error('Error generating outline:', response.statusText);
      }
    } catch (error) {
      console.error('Error during outline generation:', error);
    }
  };

  const handleGenerateEbook = async () => {
    console.log('Generate eBook button clicked');

    if (!outline) {
      console.log('Outline not found! Ensure an outline is generated first.');
      return;
    }

    console.log('Sending the following data for complete eBook generation:', {
      language,
      ebookType,
      topic,
      title,
      genre,
      targetAudience,
      writingStyle,
      wordCount,
      outline,
    });

    try {
      const response = await fetch('/api/generateEbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          ebookType,
          topic,
          title,
          genre,
          targetAudience,
          writingStyle,
          wordCount,
          outline,
        }),
      });

      if (response.ok) {
        const { fullEbookContent } = await response.json();
        console.log('Received full eBook content:', fullEbookContent);
        setContent(fullEbookContent);
        setProgress(100);
        console.log('Progress updated to: 100%');
      } else {
        const errorText = await response.text();
        console.error('Error generating full eBook content:', errorText);
      }
    } catch (error) {
      console.error('Error during full eBook generation:', error);
    }
  };

  // New function to generate Amazon data
  const handleGenerateAmazonData = async () => {
    console.log('Generate Amazon Data button clicked');

    if (!title || !topic || !outline) {
      console.log('Missing required data! Ensure the ebook is generated first.');
      return;
    }

    console.log('Sending data to generate Amazon content:', {
      language,
      ebookType,
      topic,
      title,
      genre,
      targetAudience,
      writingStyle,
      wordCount,
      outline,
    });

    try {
      const response = await fetch('/api/generateAmazonData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          ebookType,
          topic,
          title,
          genre,
          targetAudience,
          writingStyle,
          wordCount,
          outline,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Received Amazon data:', data);

        // Log the complete response data
        console.log('Complete Amazon Data Response:', data);

        // Removed amazonBlurb as per user request
        setAmazonCategories(data.amazonCategories);
        setLongTailKeywords(data.longTailKeywords);
        setPriceSuggestions(data.priceSuggestions);
        setTwitterPost(data.twitterPost);
        setBlogPostTitles(data.blogPostTitles);
        setBookSeries(data.bookSeries);
      } else {
        const errorText = await response.text();
        console.error('Error generating Amazon data:', errorText);
      }
    } catch (error) {
      console.error('Error during Amazon data generation:', error);
    }
  };

  return (
    <div>
      <Head>
        <title>Ebook Generator</title>
      </Head>
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-4xl font-bold mb-4">Ebook Generator</h1>
        <form className="w-full max-w-xl mb-8">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
          >
            {languages.map((lang, index) => (
              <option key={index} value={lang}>{lang}</option>
            ))}
          </select>

          <select
            value={ebookType}
            onChange={(e) => setEbookType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
          >
            {ebookTypes.map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
          </select>

          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            placeholder="Enter eBook Topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            placeholder="AI Generated Title"
            value={title}
            readOnly
          />
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            placeholder="Enter Genre"
            value={genre}
            readOnly
          />
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            placeholder="Enter Target Audience"
            value={targetAudience}
            readOnly
          />
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            placeholder="Enter Writing Style"
            value={writingStyle}
            readOnly
          />
          <div className="w-full mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Word Count: {wordCount}</label>
            <input
              type="range"
              min="25000"
              max="50000"
              step="1000"
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <button
            type="button"
            onClick={handleGenerateOutline}
            className="w-full bg-blue-500 text-white p-2 rounded mt-4"
          >
            Generate Outline
          </button>
          <button
            type="button"
            onClick={handleGenerateEbook}
            className="w-full bg-green-500 text-white p-2 rounded mt-4"
          >
            Generate eBook
          </button>
        </form>

        <div className="flex w-full max-w-full space-x-8 justify-center">
          <div className="flex-1 p-8 shadow-lg rounded-lg bg-white border-4 border-blue-500 max-w-3xl">
            <h2 className="text-center text-2xl font-bold mb-4">eBook Outline</h2>
            <ReactMarkdown className="prose">{outline}</ReactMarkdown>
          </div>
          <div className="relative flex-1 p-8 shadow-lg rounded-lg bg-white border-4 border-blue-500 max-w-3xl overflow-y-auto" style={{ height: '1000px' }}>
            <DownloadButton fullEbookContent={content} title={title} />
            <h2 className="text-center text-2xl font-bold mb-4">eBook</h2>
            <div className="w-full bg-gray-200 h-3 rounded-full mb-4">
              <div
                style={{ width: `${progress}%` }}
                className="bg-green-500 h-full rounded-full"
              ></div>
            </div>
            <ReactMarkdown className="prose">{content}</ReactMarkdown>
          </div>
          <div className="flex-1 p-8 shadow-lg rounded-lg bg-white border-4 border-blue-500 max-w-3xl">
            <h2 className="text-center text-2xl font-bold mb-4">Amazon Publishing</h2>

            {/* Generate Amazon Data Button */}
            <button
              type="button"
              onClick={handleGenerateAmazonData}
              className="w-full bg-yellow-500 text-white p-2 rounded mt-2 mb-4"
            >
              Generate Amazon Data
            </button>

            {/* Amazon Categories */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Amazon Categories</label>
              <textarea
                readOnly
                className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-800"
                value={amazonCategories}
                rows={3}
              />
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(amazonCategories)}
                className="w-full bg-blue-500 text-white p-2 rounded mt-2"
              >
                Copy Categories
              </button>
            </div>

            {/* Long-Tail Keywords */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Long-Tail Keywords</label>
              <textarea
                readOnly
                className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-800"
                value={longTailKeywords}
                rows={3}
              />
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(longTailKeywords)}
                className="w-full bg-blue-500 text-white p-2 rounded mt-2"
              >
                Copy Keywords
              </button>
            </div>

            {/* Price Suggestions */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Price Suggestions</label>
              <textarea
                readOnly
                className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-800"
                value={priceSuggestions}
                rows={2}
              />
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(priceSuggestions)}
                className="w-full bg-blue-500 text-white p-2 rounded mt-2"
              >
                Copy Prices
              </button>
            </div>

            {/* Twitter/X Post */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Twitter/X Post</label>
              <textarea
                readOnly
                className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-800"
                value={twitterPost}
                rows={4}
              />
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(twitterPost)}
                className="w-full bg-blue-500 text-white p-2 rounded mt-2"
              >
                Copy Post
              </button>
            </div>

            {/* Blog Post Titles */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Blog Post Titles</label>
              <textarea
                readOnly
                className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-800"
                value={blogPostTitles}
                rows={3}
              />
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(blogPostTitles)}
                className="w-full bg-blue-500 text-white p-2 rounded mt-2"
              >
                Copy Titles
              </button>
            </div>

            {/* Book Series */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Book Series</label>
              <textarea
                readOnly
                className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-800"
                value={bookSeries}
                rows={4}
              />
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(bookSeries)}
                className="w-full bg-blue-500 text-white p-2 rounded mt-2"
              >
                Copy Series
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EbookGenerator;