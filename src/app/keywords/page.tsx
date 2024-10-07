"use client";

import Head from 'next/head';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Navbar from '../../components/Navbar';
import 'tailwindcss/tailwind.css';
import { UserButton } from '@clerk/nextjs';

interface Keyword {
  text: string;
  volume: number;
  competition_level: string;
  trend: number;
  isSelected: boolean;
  id: string;
}

const IndexPage = () => {
  const [query, setQuery] = useState('');
  const [length, setLength] = useState('800');
  const [keywordsData, setKeywordsData] = useState<Keyword[]>([]);
  const [filteredData, setFilteredData] = useState<Keyword[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [blogContent, setBlogContent] = useState('');
  const [metaTitle, setMetaTitle] = useState(''); 
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState<string[]>([]);
  const [twitterPost, setTwitterPost] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Keyword; direction: string } | null>(null);
  const pageSize = 20;

  // Load stored query and keywordsData on initial render
  useEffect(() => {
    const storedQuery = localStorage.getItem('query') || '';
    const storedKeywordsData = JSON.parse(localStorage.getItem('keywordsData') || '[]');
    setQuery(storedQuery);
    setKeywordsData(storedKeywordsData);
  }, []);

  // Save query and keywordsData to local storage on updates
  useEffect(() => {
    localStorage.setItem('query', query);
    localStorage.setItem('keywordsData', JSON.stringify(keywordsData));
  }, [query, keywordsData]);

  const fetchKeywords = async () => {
    const response = await fetch('/api/serper', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword: query, location: 'US', lang: 'en' }),
    });

    const data = await response.json();
    if (response.ok) {
      const updatedData = data.map((item: Keyword, index: number) => ({
        ...item,
        id: `keyword-${index}`,
        isSelected: false,
        competition_level: item.competition_level === 'LOW' ? 'High' : item.competition_level === 'MEDIUM' ? 'Medium' : 'Low', // Inverting competition level
      }));
      setKeywordsData(updatedData);
      setFilteredData(updatedData); // Initialize filtered data
    } else {
      console.error(data.error);
    }
  };

  useEffect(() => {
    if (filter === 'All') {
      setFilteredData(keywordsData);
    } else {
      setFilteredData(keywordsData.filter((keyword) => keyword.competition_level === filter));
    }
  }, [filter, keywordsData]);

  const generateBlogPost = async () => {
    const selectedKeywords = keywordsData
      .filter((row) => row.isSelected)
      .map((row) => row.text)
      .join(', ');

    if (!selectedKeywords) {
      alert("Please select keywords for generating the content.");
      return;
    }

    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords: selectedKeywords, length: parseInt(length, 10) }),
    });

    const data = await response.json();
    setBlogContent(data.content);

    setMetaTitle(data.metaTitle);
    setMetaDescription(data.metaDescription);
    setMetaKeywords(data.metaKeywords || []);
    setTwitterPost(data.twitterPost);
  };

  const downloadCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Text,Volume,Competition Level,Trend']
        .concat(
          keywordsData.map((k) => `${k.text},${k.volume},${k.competition_level},${k.trend}`)
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'keywords.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(message);
    });
  };

  const sortedData = (() => {
    if (!sortConfig) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key])
        return sortConfig.direction === 'ascending' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key])
        return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
    return sorted;
  })();

  const requestSort = (key: keyof Keyword) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const displayData = sortedData.slice(
    pageIndex * pageSize,
    (pageIndex + 1) * pageSize
  );

  const handleKeywordSelection = (id: string, selected: boolean) => {
    const updatedKeywordsData = keywordsData.map((item) =>
      item.id === id ? { ...item, isSelected: selected } : item
    );
    setKeywordsData(updatedKeywordsData);

    // Update local storage with the selected keyword
    const selectedKeyword = updatedKeywordsData.find((item) => item.isSelected)?.text || '';
    localStorage.setItem('selectedKeyword', selectedKeyword);
  };

  return (
    <div>
      <Head>
        <title>MedPostFusionAI</title>
      </Head>
      <Navbar userButton={<UserButton />} />
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-4xl font-bold mb-4">MedPostFusionAI</h1>
        <form className="w-full max-w-md mb-8">
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            placeholder="Enter topic or URL"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            value={length}
            onChange={(e) => setLength(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
          >
            <option value="800">Short (800 words)</option>
            <option value="1500">Medium (1500 words)</option>
            <option value="2500">Long (2500 words)</option>
          </select>
          <button
            type="button"
            onClick={fetchKeywords}
            className="w-full bg-blue-500 text-white p-2 rounded mb-4"
          >
            Extract Keywords
          </button>
          <button
            type="button"
            onClick={generateBlogPost}
            disabled={keywordsData.every((row) => !row.isSelected)}
            className="w-full bg-green-500 text-white p-2 rounded"
          >
            Generate Blog Post
          </button>
        </form>

        <div className="flex w-full space-x-4">
          <div className="flex-1 p-8 shadow-lg rounded-lg bg-white border-4 border-blue-500 relative">
            <h2 className="text-center text-2xl font-bold mb-4">Keywords</h2>
            <button
              onClick={downloadCSV}
              className="absolute top-4 right-4 bg-blue-500 text-white py-2 px-4 rounded"
            >
              Download CSV
            </button>

            {/* Filter Dropdown */}
            <div className="mb-4">
              <label className="block text-gray-700">Filter by Competition Level:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="All">All</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <table className="min-w-full table-auto">
              <thead>
                <tr>
                  <th onClick={() => requestSort('text')} className="px-4 py-2 text-left">
                    Keywords
                  </th>
                  <th onClick={() => requestSort('volume')} className="px-4 py-2 text-left">
                    Volume
                  </th>
                  <th onClick={() => requestSort('competition_level')} className="px-4 py-2 text-left">
                    Competition
                  </th>
                  <th onClick={() => requestSort('trend')} className="px-4 py-2 text-left">
                    Trend
                  </th>
                  <th className="px-4 py-2 text-left">Select</th>
                </tr>
              </thead>
              <tbody>
                {displayData.map((row) => (
                  <tr key={row.id}>
                    <td className="border-t px-4 py-2">{row.text}</td>
                    <td className="border-t px-4 py-2">{row.volume}</td>
                    <td className="border-t px-4 py-2">
                      <span
                        className={
                          row.competition_level === 'Low'
                            ? 'text-green-500'
                            : row.competition_level === 'Medium'
                            ? 'text-blue-500'
                            : 'text-red-500'
                        }
                      >
                        {row.competition_level}
                      </span>
                    </td>
                    <td className="border-t px-4 py-2">{row.trend}</td>
                    <td className="border-t px-4 py-2">
                      <input
                        type="checkbox"
                        checked={row.isSelected}
                        onChange={(e) => handleKeywordSelection(row.id, e.target.checked)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination p-4">
              <button onClick={() => setPageIndex(0)} disabled={pageIndex === 0}>
                {'<<'}
              </button>{' '}
              <button onClick={() => setPageIndex((p) => Math.max(p - 1, 0))} disabled={pageIndex === 0}>
                {'<'}
              </button>{' '}
              <button
                onClick={() =>
                  setPageIndex((p) => Math.min(p + 1, Math.ceil(filteredData.length / pageSize) - 1))
                }
                disabled={(pageIndex + 1) * pageSize >= filteredData.length}
              >
                {'>'}
              </button>{' '}
              <button
                onClick={() => setPageIndex(Math.ceil(filteredData.length / pageSize) - 1)}
                disabled={(pageIndex + 1) * pageSize >= filteredData.length}
              >
                {'>>'}
              </button>{' '}
              <span>
                Page {pageIndex + 1} of {Math.ceil(filteredData.length / pageSize)}
              </span>
            </div>
          </div>

          <div className="flex-1 p-8 shadow-lg rounded-lg bg-white border-4 border-blue-500">
            <h2 className="text-center text-2xl font-bold mb-4">Meta Data and Twitter/X</h2>
            <div className="space-y-4">
              <div className="border p-4 rounded-lg shadow relative">
                <h3 className="text-lg font-bold">Meta Title</h3>
                <button
                  onClick={() => copyToClipboard(metaTitle, 'Meta Title copied to clipboard!')}
                  className="absolute top-2 right-2 bg-blue-500 text-white py-1 px-2 rounded"
                >
                  Copy
                </button>
                <p>{metaTitle}</p>
              </div>
              <div className="border p-4 rounded-lg shadow relative">
                <h3 className="text-lg font-bold">Meta Description</h3>
                <button
                  onClick={() => copyToClipboard(metaDescription, 'Meta Description copied to clipboard!')}
                  className="absolute top-2 right-2 bg-blue-500 text-white py-1 px-2 rounded"
                >
                  Copy
                </button>
                <p>{metaDescription}</p>
              </div>
              <div className="border p-4 rounded-lg shadow relative">
                <h3 className="text-lg font-bold">Keywords</h3>
                <button
                  onClick={() => copyToClipboard(metaKeywords.join(', '), 'Keywords copied to clipboard!')}
                  className="absolute top-2 right-2 bg-blue-500 text-white py-1 px-2 rounded"
                >
                  Copy
                </button>
                <ul className="list-disc list-inside">
                  {metaKeywords.map((kw, index) => (
                    <li key={index}>{kw}</li>
                  ))}
                </ul>
              </div>
              <div className="border p-4 rounded-lg shadow relative">
                <h3 className="text-lg font-bold">Twitter Post</h3>
                <button
                  onClick={() => copyToClipboard(twitterPost, 'Twitter Post copied to clipboard!')}
                  className="absolute top-2 right-2 bg-blue-500 text-white py-1 px-2 rounded"
                >
                  Copy
                </button>
                <p>{twitterPost}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-12 shadow-lg rounded-lg bg-gray-100 border-4 border-blue-500 text-gray-800 relative">
            <h2 className="text-center text-2xl font-bold mb-4">Blog Post</h2>
            <button
              onClick={() => copyToClipboard(blogContent, 'Blog post copied to clipboard!')}
              className="absolute top-4 left-4 bg-blue-500 text-white py-2 px-4 rounded"
            >
              Copy to Clipboard
            </button>
            <div className="prose">
              <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                {blogContent}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IndexPage;
