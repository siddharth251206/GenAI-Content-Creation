import os
import vertexai
from dotenv import load_dotenv
from vertexai.generative_models import GenerativeModel

load_dotenv()

try:
    vertexai.init(project="siddharth-genai-ccp", location="us-central1")

    print("Connecting to Gemini 2.5 Flash...")
    model = GenerativeModel("gemini-2.5-flash") 

    response = model.generate_content("Explain the langchain chains.")
    
    print("\n--- Gemini Response ---")
    print(response.text)

except Exception as e:
    print(f"\nError: {e}")
    