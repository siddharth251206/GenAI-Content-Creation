# 🚀 ContentFlow Studio
### The Ultimate AI-Powered Content Creation Suite

[![Live Demo](https://img.shields.io/badge/Demo-Live%20App-brightgreen?style=for-the-badge&logo=vercel)](https://contentflow-genai.vercel.app)
![Project Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20FastAPI%20%7C%20Gemini-blueviolet?style=for-the-badge)

**ContentFlow Studio** is a next-generation content generation platform that blends the power of **Google Gemini 2.5**, **RAG (Retrieval-Augmented Generation)**, and **Advanced Analytics** to help creators write blogs, social media posts, and emails in seconds—not hours.

Unlike generic AI tools, ContentFlow offers **Custom Brand Voice mimicking**, real-time **SEO/Readability scoring**, and a fully integrated **Rich Text Editor** with stock image support.

---

## ✨ Key Features

### 🧠 **Intelligent Generation**
* **Powered by Gemini 2.5 Flash:** Blazing fast and highly accurate content generation.
* **RAG Context Awareness:** Uses Vector Search (**Pinecone**) to ground content in factual data, reducing hallucinations.
* **Custom Brand Voice:** Don't just select a tone—**clone it**. Paste a sample of your writing (or a persona like a "Pirate") and the AI mimics the vocabulary, sentence structure, and personality exactly.

### 📊 **Smart Analytics Dashboard**
Get real-time feedback on your content quality directly in the dashboard:
* **Readability Score:** Flesch Reading Ease analysis to target specific education levels.
* **Sentiment Analysis:** Detect if your content is Positive, Negative, or Neutral using **TextBlob**.
* **SEO Metrics:** Automated word count and estimated reading time calculations.

### ✍️ **Pro-Level Editing Suite**
* **Rich Text Editor:** Integrated **CKEditor 5** for formatting, lists, headings, and more.
* **Smart Regeneration:** Highlight any text to **Rewrite**, **Expand**, or **Make Funnier** instantly using AI instructions.
* **Stock Image Sidebar:** Search and insert relevant images directly into your article with one click (Powered by Pexels/Unsplash).

### 💾 **History & Export**
* **Auto-Save History:** Never lose a draft. View past generations complete with their original analytics data stored in **Firebase Firestore**.
* **Multi-Format Export:** Download your work as **PDF**, **DOCX (Word)**, or **HTML**.

---

## ⚙️ How It Works: The Intelligence Engine

ContentFlow Studio isn't just a wrapper around an API. It uses a sophisticated **Retrieval-Augmented Generation (RAG)** pipeline to ensure quality and relevance.

### 1. **Context Retrieval (The Knowledge Layer)**
* When you enter a topic, the backend initiates a **Vector Search** using **Pinecone**.
* It retrieves semantically relevant documents and facts related to your topic to ground the AI, minimizing hallucinations.

### 2. **Advanced Prompt Engineering (LangChain)**
* Your inputs (Topic, Tone, Audience) + The Retrieved Context are fused into a highly structured **System Prompt**.
* If you provided a **Custom Brand Voice**, the system analyzes your sample and injects specific instruction sets to mimic your vocabulary and sentence structure.

### 3. **The Generation (Gemini 2.5)**
* This enriched prompt is sent to **Google Gemini 2.5 Flash** via **LangChain**.
* Gemini generates the content, adhering strictly to your formatting rules (Markdown, HTML, etc.).

### 4. **Real-Time Analytics Engine**
* Before the text reaches you, it passes through our Python-based analytics layer:
    * **TextStat** calculates the *Flesch Reading Ease* score.
    * **TextBlob** analyzes the sentiment (Positive/Neutral/Negative).
    * **Algorithmic Logic** computes word count and estimated reading time.

### 5. **Delivery & Storage**
* The final content + analytics metadata are bundled and sent to the Frontend.
* Simultaneously, a copy is secured in **Firebase Firestore** for your history.

---

## 🛠️ Tech Stack

### **Frontend**
* **Framework:** Next.js 14 (App Router)
* **Styling:** Tailwind CSS + Lucide React Icons
* **Editor:** CKEditor 5
* **Auth:** Firebase Authentication (Client SDK)

### **Backend**
* **Framework:** FastAPI (Python)
* **AI Orchestration:** LangChain + Google GenAI SDK
* **Vector DB:** Pinecone
* **Database:** Firebase Firestore (Admin SDK)
* **Analytics:** TextBlob (Sentiment) + TextStat (Readability)

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
* Node.js (v18+)
* Python (v3.10+)
* Firebase Project (for Auth & Firestore)
* Google Cloud Project (for Vertex AI/Gemini)
* Pinecone Account (for RAG)

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up Environment Variables
# Create a .env file in /backend and add:
GOOGLE_API_KEY=your_google_gemini_key
GOOGLE_APPLICATION_CREDENTIALS=path/to/firebase_service_account.json
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=your_index_name
GOOGLE_CLOUD_PROJECT=your_google_cloud_project_id

# Run the Server
python main.py
```
The backend runs on http://localhost:8000
### 1. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Set up Environment Variables
# Create a .env.local file in /frontend and add:
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Run the Client
npm run dev
```
The frontend runs on http://localhost:3000

 ### 📂 Project Structure
```bash
GenAI-Content-Creation/
├── backend/
│   ├── models/          # Pydantic Schemas (Request/Response models)
│   ├── routes/          # API Endpoints (Generate, History, Images)
│   ├── services/        # Logic for Vector Search & Image Fetching
│   ├── main.py          # FastAPI Entry Point
│   ├── rag_app.py       # RAG Ingestion Script
│   └── requirements.txt # Python Dependencies
│
└── frontend/
    ├── app/             # Next.js App Router Pages
    ├── components/      # React Components (InputForm, ResultSection, HistoryList)
    ├── context/         # Auth Context Provider
    └── lib/             # Firebase & Utility functions
```

## 📸 Project Gallery

Explore the interface of ContentFlow Studio.

| **Dashboard & Content Generation** | **Rich Text Editor & Analytics** |
|:---:|:---:|
| <img src="https://github.com/user-attachments/assets/36e46868-50c5-498a-8322-bfc5a5e3ad3c" width="100%" alt="Dashboard View" /> | <img src="https://github.com/user-attachments/assets/b63fb54d-f725-4548-acd4-ac1c0a957fe0" width="100%" alt="Editor Interface" /> |
| **Real-time Generation Logic** | **Smart Analytics Dashboard** |
| <img src="https://github.com/user-attachments/assets/02da8120-a761-4329-8386-221257990ca7" width="100%" alt="Generation Process" /> | <img src="https://github.com/user-attachments/assets/8674a50b-ea9e-4f57-ba75-63353401e1e7" width="100%" alt="Analytics Scores" /> |
| **History & Archives** | **Smart AI Editing** |
| <img src="https://github.com/user-attachments/assets/29e1bb14-138c-4bd4-b755-28890a37a85c" width="100%" alt="History Page" /> | <img src="https://github.com/user-attachments/assets/e6b67e9a-e4f8-45e8-9ea8-417b3923a672" width="100%" alt="Selected Content Expansion" /> |

<div align="center">
  <img src="https://github.com/user-attachments/assets/ff90aa35-bab2-484e-96f4-a414c6879fb5" width="80%" alt="History Details Card" />
  <p><i>History Details Card</i></p>
</div>

---

## 🤝 Contributing

Contributions make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. **Fork the Project**
2. Create your Feature Branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your Changes
  ```bash
  git commit -m 'Add some AmazingFeature'
  ```
4. Push to the Branch
 ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request
## 📄 License
Distributed under the MIT License. See LICENSE for more information.

<div align="center"> <p><b>Built with ❤️ using Generative AI</b></p> </div>


