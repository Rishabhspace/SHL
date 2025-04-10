# 🎯 SHL Assessment Recommender

A full-stack intelligent recommendation system that helps recruiters and HR professionals find the most relevant **SHL assessments** based on job descriptions or roles.

> 💡 Powered by NLP, TF-IDF, keyword extraction, and test-type relevance analysis.

---

## 🔗 Live Demo

- **Frontend (Streamlit)**: [shl-app-rishabh.streamlit.app](https://shl-app-rishabh.streamlit.app/)
- **Backend (Node.js API)**: [shl-api-y5bo.onrender.com](https://shl-api-y5bo.onrender.com/)
- **GitHub Repository**: [github.com/Rishabhspace/SHL](https://github.com/Rishabhspace/SHL)

---

## 🚀 Features

- 🔍 Query-based SHL assessment recommendations
- 📊 TF-IDF and keyword-based semantic relevance
- 🧠 Test type and skill-tag mapping
- ⚙️ Configurable API URL
- 🎨 Modern, minimalist Streamlit frontend
- 💼 Tailored for talent acquisition and L&D teams

---

## 🧠 Tech Stack

| Layer      | Tech                                                         |
| ---------- | ------------------------------------------------------------ |
| Frontend   | Streamlit (Python)                                           |
| Backend    | Express.js (Node.js), Natural NLP                            |
| Matching   | TF-IDF, Keyword Extraction, Porter Stemmer, Relevance Scores |
| Deployment | Render (API), Streamlit Cloud (Frontend)                     |

---

## 📥 How It Works

1. User enters a **job role** or **job description** in the Streamlit UI.
2. Frontend sends this query to the backend API.
3. Backend preprocesses the input, extracts key terms, and computes:
   - 🔠 TF-IDF similarity between the query and assessment content
   - ✅ Keyword match score
   - 🎯 Test type relevance based on SHL’s skill categories
4. API returns the **top 10 most relevant assessments**.
5. Frontend displays results in a styled card layout.

---

## 📁 Project Structure

```
SHL/
├── frontend/                # Streamlit app
│   └── app.py
├── backend/                 # Express server and recommendation engine
│   ├── index.js
│   ├── SHL.json             # Assessment data
├── README.md
└── ...
```

---

## ⚙️ API Endpoint

### POST `/recommend`

**Request**

```json
{
  "query": "Java developer with Spring Boot experience"
}
```

**Response**

```json
{
  "recommended_assessments": [
    {
      "url": "...",
      "description": "...",
      "test_type": ["K", "A"],
      "duration": 45,
      "adaptive_support": "Yes",
      "remote_support": "Yes"
    },
    ...
  ]
}
```

---

## 📄 License

MIT License. Feel free to fork, modify, and use it for your own HR tooling needs.

---

## 👨‍💻 Author

Built with 💚 by [Rishabh](https://github.com/Rishabhspace)
