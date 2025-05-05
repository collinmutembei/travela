# Travela

> AI-powered travel assistant built with FastAPI, Next.js, and Google Gemini.

## ✈️ Use Case

Ask: **"What documents do I need to travel from Kenya to Turks and Caicos?"**  
Get a complete AI-generated list of requirements, documents, advisories, and more.

## 🧱 Stack

- **Frontend**: Next.js + TailwindCSS
- **Backend**: FastAPI
- **LLM**: Google Gemini via Google's ADK
- **Infra**: Vercel (frontend), Render (backend)

## 🛠️ Local Setup

```bash
gh repo clone collinmutembei/travela
cd travela
# Start backend dev server
cd backend && fastapi dev
# Start frontend server (on separate terminal)
cd frontend && npm run dev
```

