import os
import requests
import random

class ImageService:
    def __init__(self):
        self.api_key = os.getenv("PEXELS_API_KEY")
        self.base_url = "https://api.pexels.com/v1/search"

    def get_images(self, query: str, per_page: int = 5):
        if not self.api_key:
            print("WARNING: PEXELS_API_KEY not found in .env")
            return []

        headers = {"Authorization": self.api_key}
        params = {"query": query, "per_page": per_page, "orientation": "landscape"}
        
        try:
            response = requests.get(self.base_url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            
            # Extract medium sized image URLs
            image_urls = [photo["src"]["medium"] for photo in data.get("photos", [])]
            return image_urls
        except Exception as e:
            print(f"Error fetching images: {e}")
            return []