import os
from dotenv import load_dotenv

# --- FIX 1: New Imports (Removes Deprecation Warnings) ---
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

from services.vector_service import VectorService

load_dotenv()

def main():
    # --- FIX 2: Use the new ChatGoogleGenerativeAI class ---
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        project=os.getenv("GOOGLE_CLOUD_PROJECT"),
        # No location needed here usually, but if it complains, add location="us-central1"
    )

    vs = VectorService()
    
    # --- FIX 3: Increase 'k' to 3 (or 4) ---
    # This ensures we get [Siddharth link] AND [Pinecone link]
    retriever = vs.vector_store.as_retriever(search_kwargs={"k": 3})

    template = """You are a helpful assistant. Answer the question based ONLY on the following context:

    {context}

    Question: {question}
    """
    prompt = ChatPromptTemplate.from_template(template)

    rag_chain = (
        {"context": retriever, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    user_question = "What database is Siddharth using?"
    
    print(f"--- Asking: {user_question} ---")
    response = rag_chain.invoke(user_question)
    
    print("\n--- Final Answer ---")
    print(response)

if __name__ == "__main__":
    main()