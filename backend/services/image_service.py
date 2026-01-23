import os
import requests
import json
from google.oauth2 import service_account
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

class ImageService:
    def __init__(self):
        self.api_key = os.getenv("PEXELS_API_KEY")
        self.base_url = "https://api.pexels.com/v1/search"
        google_creds_json = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
        self.llm = None
        
        if google_creds_json:
            try:
                creds_dict = json.loads(google_creds_json)
                creds = service_account.Credentials.from_service_account_info(
                    creds_dict,
                    scopes=["https://www.googleapis.com/auth/cloud-platform"]
                )
                self.llm = ChatGoogleGenerativeAI(
                    model="gemini-1.5-flash",
                    credentials=creds
                )
            except Exception as e:
                print(f"Warning: Could not init Gemini in ImageService: {e}")
        else:
            print("Warning: GOOGLE_APPLICATION_CREDENTIALS not found for ImageService")

    def _generate_search_term(self, user_query: str) -> str:
        """
        Uses LLM to convert a complex topic into a simple stock photo search query.
        Example: "The future of AI in healthcare" -> "Doctor Technology"
        """
        if not self.llm:
            return user_query

        try:
            prompt = (
                f"Act as a search engine optimizer for a stock photo site (Pexels). "
                f"Convert the following text into a single, highly effective, 2-3 word visual search query. "
                f"Focus on the main visual subject (nouns). Do not use abstract concepts. "
                f"Return ONLY the keywords. \n\n"
                f"Text: {user_query}"
            )
            response = self.llm.invoke([HumanMessage(content=prompt)])
            cleaned_query = response.content.strip().replace('"', '')
            print(f"Refined Image Query: '{user_query}' -> '{cleaned_query}'")
            return cleaned_query
        except Exception as e:
            print(f"Error generating search term: {e}")
            return user_query

    def get_images(self, query: str, per_page: int = 5):
        if not self.api_key:
            print("WARNING: PEXELS_API_KEY not found in .env")
            return []

        optimized_query = self._generate_search_term(query)

        headers = {"Authorization": self.api_key}
        params = {"query": optimized_query, "per_page": per_page, "orientation": "landscape"}
        
        try:
            response = requests.get(self.base_url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            
            image_urls = [photo["src"]["medium"] for photo in data.get("photos", [])]
            return image_urls
        except Exception as e:
            print(f"Error fetching images: {e}")
            return []