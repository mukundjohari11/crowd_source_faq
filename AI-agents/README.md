# AI Microservice

A standalone REST API microservice for intelligent FAQ and document retrieval, powered by **LangGraph** agent orchestration, **Gemini** embeddings, **Groq** LLM, **ChromaDB** vector store, and **MongoDB**.

## Architecture

```
User Query → Router Agent → FAQ/Document/Both Retrieval → Response Generation → Suggestion Agent → Answer
```

Five LangGraph-orchestrated agents handle the full pipeline:

| Agent | Purpose |
|---|---|
| **Router** | Classifies query into `FAQ`, `DOCUMENT`, or `BOTH` |
| **FAQ Retrieval** | Searches ChromaDB FAQ collection via Gemini embeddings |
| **Document Retrieval** | Searches ChromaDB document collection via Gemini embeddings |
| **Response Generation** | Combines context → generates answer via Groq with confidence score |
| **FAQ Suggestion** | Detects low-confidence answers → saves suggested FAQs to MongoDB |

## Quick Start

### Prerequisites
- Python 3.11+
- MongoDB running locally (or a remote URI)
- [Gemini API Key](https://aistudio.google.com/apikey)
- [Groq API Key](https://console.groq.com/keys)

### Setup

```bash
# 1. Clone and enter the project
cd ai-agents

# 2. Create virtual environment
python -m venv .venv
.venv\Scripts\activate    # Windows
# source .venv/bin/activate  # macOS/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
copy .env.example .env
# Edit .env with your API keys

# 5. Run the server
python main.py
```

The server starts at `http://localhost:8000`. API docs at `http://localhost:8000/docs`.

## API Endpoints

### `POST /chat`
Process a query through the full LangGraph workflow.

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "What is your return policy?"}'
```

**Response:**
```json
{
  "query": "What is your return policy?",
  "answer": "We offer a 30-day return policy for all unused items...",
  "confidence": 0.92,
  "route": "FAQ",
  "sources": [{"source_type": "faq", "content": "...", "metadata": {}}],
  "is_unanswered": false
}
```

### `POST /upload-faq`
Upload a CSV file with `question` and `answer` columns.

```bash
curl -X POST http://localhost:8000/upload-faq -F "file=@sample_faqs.csv"
```

### `POST /upload-pdf`
Upload a PDF document for chunking and embedding.

```bash
curl -X POST http://localhost:8000/upload-pdf -F "file=@document.pdf"
```

### `GET /unanswered-questions`
Retrieve questions the system couldn't answer confidently.

```bash
curl http://localhost:8000/unanswered-questions?limit=20&skip=0
```

## Project Structure

```
ai-agents/
├── main.py              # FastAPI entry point
├── config.py            # Settings (env vars)
├── agents/              # LangGraph agent nodes
├── graph/               # State + workflow definition
├── ingestion/           # CSV/PDF loading + chunking
├── vectorstore/         # ChromaDB wrapper
├── database/            # MongoDB async client
├── services/            # Gemini embeddings + Groq LLM
└── models/              # Pydantic schemas
```

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | ✅ | — | Google AI Studio API key |
| `GROQ_API_KEY` | ✅ | — | Groq API key |
| `MONGODB_URI` | ❌ | `mongodb://localhost:27017` | MongoDB connection string |
| `MONGODB_DB_NAME` | ❌ | `ai_microservice` | Database name |
| `CHROMA_PERSIST_DIR` | ❌ | `./chroma_data` | ChromaDB storage path |
| `CHUNK_SIZE` | ❌ | `1000` | Max characters per chunk |
| `CHUNK_OVERLAP` | ❌ | `200` | Overlap between chunks |
| `TOP_K_RESULTS` | ❌ | `5` | Number of retrieval results |
| `CONFIDENCE_THRESHOLD` | ❌ | `0.6` | Below this → "unanswered" |
| `GROQ_MODEL` | ❌ | `llama-3.3-70b-versatile` | Groq model name |
| `LOG_LEVEL` | ❌ | `INFO` | Logging level |

## Tech Stack

- **FastAPI** — REST API framework
- **LangGraph** — Agent orchestration (StateGraph)
- **Gemini** — Embedding generation (embedding-001)
- **Groq** — LLM inference (Llama 3.3 70B)
- **ChromaDB** — Vector store (persistent, cosine similarity)
- **MongoDB** — Unanswered questions storage (motor async driver)
- **PyMuPDF** — PDF text extraction
