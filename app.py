from flask import Flask, request, jsonify
from flask_cors import CORS
from bs4 import BeautifulSoup
import requests
from urllib.parse import urljoin, urlparse
import concurrent.futures

app = Flask(__name__)
CORS(app)  # This enables CORS for all routes

def is_valid(url):
    parsed = urlparse(url)
    return bool(parsed.netloc) and bool(parsed.scheme)

def get_all_links(url):
    soup = BeautifulSoup(requests.get(url).content, "html.parser")
    return [urljoin(url, link.get("href")) for link in soup.find_all("a") if link.get("href")]

def get_text(url):
    soup = BeautifulSoup(requests.get(url).content, "html.parser")
    return soup.get_text(separator='\n', strip=True)

def crawl(url, max_depth):
    seen = set()

    def crawl_recursive(current_url, depth):
        if depth > max_depth or current_url in seen or not is_valid(current_url):
            return ""

        seen.add(current_url)
        text = f"URL: {current_url}\n\n{get_text(current_url)}\n\n"

        if depth < max_depth:
            links = get_all_links(current_url)
            with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
                future_to_url = {executor.submit(crawl_recursive, link, depth + 1): link for link in links[:5]}
                for future in concurrent.futures.as_completed(future_to_url):
                    text += future.result()

        return text

    return crawl_recursive(url, 0)

@app.route('/api/crawl', methods=['POST'])
def start_crawl():
    data = request.json
    url = data.get('url')
    recursions = min(int(data.get('recursions', 1)), 3)  # Limit to max 3 recursions

    if not url:
        return jsonify({"error": "URL is required"}), 400

    try:
        result = crawl(url, recursions)
        return jsonify({"text": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)