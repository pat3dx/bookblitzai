import React from 'react';
import { FaBookOpen, FaDownload, FaStar } from 'react-icons/fa'; // Importing icons
import Link from 'next/link'; // Import Link from next/link

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-6xl font-bold text-blue-600 mt-10 flex items-center">
        📚 Bookblitz AI <span className="text-lg text-gray-500 ml-2">Your one-stop solution for creating stunning ebooks.</span>
      </h1>
      
      <div className="bg-blue-500 text-white p-6 rounded-lg shadow-lg text-center mt-10">
        <h2 className="text-3xl font-bold">Try it Free for 3 Days!</h2>
        <p className="mt-2">Generate up to 3 ebooks for free and see how our AI can transform your writing process!</p>
      </div>

      <div className="mt-10">
        <h2 className="text-4xl font-semibold text-center">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className="bg-gray-300 p-6 rounded-lg shadow-lg text-center border-4 border-blue-500">
            <FaBookOpen className="text-blue-500 mb-2 mx-auto" size={40} />
            <h3 className="text-xl font-semibold">Start Your Amazon Book Business</h3>
            <p className="text-gray-600">Generate an ebook in just 2 or 3 clicks with our AI-powered tool.</p>
            <p className="text-gray-600">AI generates 25,000 to 50,000 words in less than 15 minutes.</p>
            <p className="text-gray-600">Download your ebook in DOCX format and upload it to Draft2Digital for amazing formatting.</p>
          </div>
          <div className="bg-gray-300 p-6 rounded-lg shadow-lg text-center border-4 border-blue-500">
            <FaDownload className="text-green-500 mb-2 mx-auto" size={40} />
            <h3 className="text-xl font-semibold">Customizable templates</h3>
            <p className="text-gray-600">Choose from a variety of templates or let the AI select the genre for you.</p>
            <p className="text-gray-600">Currently, the AI generates only non-fiction ebooks.</p>
          </div>
          <div className="bg-gray-300 p-6 rounded-lg shadow-lg text-center border-4 border-blue-500">
            <FaStar className="text-yellow-500 mb-2 mx-auto" size={40} />
            <h3 className="text-xl font-semibold">Download in DOCX format</h3>
            <p className="text-gray-600">Get your ebooks in DOCX format.</p>
          </div>
        </div>
      </div>

      <div className="mt-10 mb-16">
        <h2 className="text-4xl font-semibold text-center">Testimonials</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <blockquote className="bg-gray-300 p-6 rounded-lg shadow-lg italic border-4 border-blue-500 text-center">
            &quot;This app helped me launch my Amazon book business effortlessly! I generated my ebook in minutes!&quot; - Happy User
          </blockquote>
          <blockquote className="bg-gray-300 p-6 rounded-lg shadow-lg italic border-4 border-blue-500 text-center">
            &quot;I couldn&apos;t believe how quickly I had a 50,000-word ebook ready to publish!&quot; - Satisfied Customer
          </blockquote>
          <blockquote className="bg-gray-300 p-6 rounded-lg shadow-lg italic border-4 border-blue-500 text-center">
            &quot;The AI made it so easy to create a professional ebook. I love how I can choose the genre or let it decide!&quot; - Thrilled Author
          </blockquote>
        </div>
      </div>

      <div className="mt-10">
        <Link href="/pricing" className="bg-red-500 text-white p-10 rounded-full text-lg hover:bg-red-600 transition duration-300 shadow-lg transform hover:scale-105">
          View Pricing
        </Link>
      </div>

      <div className="mt-10 mb-16">
        <h2 className="text-4xl font-semibold text-center">Frequently Asked Questions (FAQs)</h2>
        <div className="mt-6 space-y-4">
          <div className="bg-gray-300 p-4 rounded-lg shadow-lg">
            <h3 className="font-semibold">1. How does the free trial work?</h3>
            <p className="text-gray-600">You can try our app free for 3 days and generate up to 3 ebooks without any cost.</p>
          </div>
          <div className="bg-gray-300 p-4 rounded-lg shadow-lg">
            <h3 className="font-semibold">2. What types of ebooks can I generate?</h3>
            <p className="text-gray-600">Currently, our AI generates only non-fiction ebooks.</p>
          </div>
          <div className="bg-gray-300 p-4 rounded-lg shadow-lg">
            <h3 className="font-semibold">3. How long does it take to generate an ebook?</h3>
            <p className="text-gray-600">The AI can generate an ebook of 25,000 to 50,000 words in less than 15 minutes.</p>
          </div>
          <div className="bg-gray-300 p-4 rounded-lg shadow-lg">
            <h3 className="font-semibold">4. How do I publish my ebook on Amazon?</h3>
            <p className="text-gray-600">After downloading your ebook in DOCX format, you can upload it to Draft2Digital for formatting, and then download the required EPUB and PDF files to publish on Amazon.</p>
          </div>
          <div className="bg-gray-300 p-4 rounded-lg shadow-lg">
            <h3 className="font-semibold">5. What payment methods are accepted?</h3>
            <p className="text-gray-600">You can pay for your subscription using PayPal.</p>
          </div>
          <div className="bg-gray-300 p-4 rounded-lg shadow-lg">
            <h3 className="font-semibold">6. How do I cancel my membership?</h3>
            <p className="text-gray-600">To cancel your membership, simply log in to your PayPal account and cancel the recurring subscription for this app.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;