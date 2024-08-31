import axios from 'axios';
import React, { useState } from 'react';

function App() {
  const [url, setUrl] = useState('');
  const [recursions, setRecursions] = useState(1);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const crawlWebsite = async () => {
    setIsLoading(true);
    setError('');
    setResult('');

    try {
      const response = await axios.post('/api/crawl', { url, recursions });
      setResult(response.data.text);
    } catch (err) {
      setError('An error occurred while crawling the website. Please check the URL and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Web Crawler</h1>
      <div className="space-y-4">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL to crawl"
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          value={recursions}
          onChange={(e) => setRecursions(parseInt(e.target.value))}
          min="1"
          max="3"
          placeholder="Number of recursions (1-3)"
          className="w-full p-2 border rounded"
        />
        <button
          onClick={crawlWebsite}
          disabled={isLoading}
          className="w-full p-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
        >
          {isLoading ? 'Crawling...' : 'Start Crawling'}
        </button>
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
            <p>{error}</p>
          </div>
        )}
        {result && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Crawl Results:</h3>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96 whitespace-pre-wrap">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;