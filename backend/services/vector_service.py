import os
import json
import time
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec
from google.oauth2 import service_account 
from dotenv import load_dotenv

load_dotenv()

class VectorService:
    def __init__(self):
        self.api_key = os.getenv("PINECONE_API_KEY")
        self.index_name = os.getenv("PINECONE_INDEX_NAME", "genai-content-index")
        self.project_id = os.getenv("GOOGLE_CLOUD_PROJECT") 
        
        if not self.api_key:
            raise ValueError("PINECONE_API_KEY is not set")

        google_creds_json = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
        if not google_creds_json:
            raise ValueError("GOOGLE_APPLICATION_CREDENTIALS not found")
            
        creds_dict = json.loads(google_creds_json)
        
        self.creds = service_account.Credentials.from_service_account_info(
            creds_dict,
            scopes=["https://www.googleapis.com/auth/cloud-platform"]
        )

        self.pc = Pinecone(api_key=self.api_key)

        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004", 
            project=self.project_id,
            location="us-central1",
            credentials=self.creds 
        )

        self._ensure_index_exists()

        self.vector_store = PineconeVectorStore(
            index_name=self.index_name,
            embedding=self.embeddings
        )

    def _ensure_index_exists(self):
        existing_indexes = [i.name for i in self.pc.list_indexes()]
        
        if self.index_name not in existing_indexes:
            print(f"Creating Pinecone index: {self.index_name}...")
            try:
                self.pc.create_index(
                    name=self.index_name,
                    dimension=768, 
                    metric="cosine",
                    spec=ServerlessSpec(cloud="aws", region="us-east-1")
                )
                while not self.pc.describe_index(self.index_name).status['ready']:
                    time.sleep(1)
                print("Index created successfully!")
            except Exception as e:
                print(f"Error creating index: {e}")

    def add_texts(self, texts: list[str], namespace: str):
        """Adds text chunks to a specific user's namespace."""
        print(f"Adding {len(texts)} documents to namespace: {namespace}...")
        self.vector_store.add_texts(texts, namespace=namespace)
        print("Done!")

    def get_retriever(self, namespace: str, k=3):
        """Returns a retriever scoped to a specific user's namespace."""
        return self.vector_store.as_retriever(
            search_kwargs={"k": k, "namespace": namespace}
        )