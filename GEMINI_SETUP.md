# Gemini AI Job Recommendations - Setup Guide

## Quick Start

The AI-powered job recommendations system has been successfully integrated into your MERN Job Posting Platform. Follow these steps to activate it.

---

## Step 1: Get Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikeys)
2. Click **"Create API key"** button
3. Copy your API key
4. Paste it in your backend `.env` file:

```
GEMINI_API_KEY=your_actual_key_here
```

Get your free API key here: https://makersuite.google.com/app/apikeys

---

## Step 2: Start the Servers

### Backend
```bash
cd backend
npm run dev
```
The backend will run on port 8005 with Gemini integration ready.

### Frontend  
```bash
cd frontend
npm run dev
```
The frontend will run on port 5173.

---

## Step 3: Features Now Available

### For Users 👤

**1. AI Recommendations Page** (`/recommendations`)
   - Upload your resume (PDF or DOCX)
   - Get instant AI analysis:
     - Extracted skills and expertise
     - Experience level assessment
     - Professional strengths and gaps
     - Top recommendations of 20 jobs ranked by match score
   - View detailed job matches with:
     - Match percentage (0-100%)
     - Why you're a good fit
     - Skills you have/lack for each job
     - One-click apply to recommended jobs

**2. Getting Job Recommendations**
   - Go to **"AI Recommendations"** link in navbar
   - Click "Drag & Drop Resume" or select PDF/DOCX file
   - Wait for Gemini analysis (~10-15 seconds)
   - Browse recommended jobs sorted by match score
   - Green (80%+), Yellow (60-80%), Orange (<60%)

**3. Re-analyze & Refresh**
   - Button to re-analyze resume
   - System caches results for 24 hours to save API calls
   - Delete resume option if needed

---

### For Admins 👨‍💼

**1. AI-Ranked Candidates**
   - View applications for any job
   - Click **"Sort by AI Match"** button
   - See candidates ranked by match score
   - Each candidate shows:
     - AI match percentage
     - Technical fit (0-10)
     - Culture fit (0-10)
     - Experience fit (0-10)
     - Recommended badge (if hireable)
     - Interview focus areas
     - Red flags if any

**2. Smart Hiring**
   - Immediately see best candidates ranked
   - Detailed breakdown of why they match
   - Skills matched vs. lacking
   - Next steps for each candidate

---

## API Endpoints

### For Users
```
POST   /api/recommendations/upload-resume       - Upload & analyze resume
GET    /api/recommendations                     - Get job recommendations
GET    /api/recommendations/resume-analysis     - Get stored analysis
POST   /api/recommendations/analyze             - Re-analyze resume
DELETE /api/recommendations/resume              - Delete uploaded resume
```

### For Admins
```
GET    /api/recommendations/candidates/:jobId   - Get AI-ranked candidates for a job
```

---

## File Structure

New files created:

```
backend/
├── src/
│   ├── services/
│   │   ├── geminiService.js          - Gemini API integration
│   │   └── fileService.js            - PDF/DOCX text extraction
│   ├── controllers/
│   │   └── recommendationController.js - Recommendation logic
│   ├── models/
│   │   └── RecommendationAnalysis.js  - Cache for AI results
│   └── routes/
│       └── recommendations.js         - API routes
├── uploads/
│   └── resumes/                       - Uploaded resume storage
└── .env                               - Updated with GEMINI_API_KEY

frontend/
├── src/
│   ├── pages/
│   │   └── RecommendationsPage.jsx    - Main recommendations UI
│   ├── components/
│   │   └── ResumeUploadComponent.jsx   - Drag-drop upload
│   └── services/
│       └── api.js                      - Updated with recommendation endpoints
```

---

## How It Works

### User Flow
1. User uploads resume (PDF/DOCX)
2. Backend extracts text using pdf-parse/mammoth
3. Gemini AI analyzes:
   - Skills and expertise
   - Experience level (entry/junior/mid/senior/expert)
   - Strengths and gaps
4. Results cached in database
5. All jobs ranked by match score using Gemini
6. Top 20 displayed with detailed insights

### Admin Flow
1. Admin views job applications
2. Click "Sort by AI Match" button
3. Candidates ranked by match score
4. Can see detailed fit analysis for each candidate
5. Make informed hiring decisions

---

## Customization

### Modify Analysis Prompts
Edit `backend/src/services/geminiService.js` to customize:
- What skills to extract
- How to score matches
- Custom recommendation criteria

### Change Cache Duration
Edit `backend/src/models/RecommendationAnalysis.js`:
```javascript
// Change from 30 days to custom duration
expireAfterSeconds: 2592000  // 2592000 seconds = 30 days
```

### Adjust File Upload Limits
Edit `backend/src/routes/recommendations.js`:
```javascript
fileSize: 5 * 1024 * 1024  // 5MB - change this value
```

---

## Troubleshooting

### "No recommendations generated"
- Check GEMINI_API_KEY is set correctly in .env
- Verify Gemini API is active in your Google account
- Check backend logs for API errors

### "Resume upload failed"
- Ensure file is PDF or DOCX format
- File size must be under 5MB
- Check `/backend/uploads/resumes/` directory exists

### "AI Analysis taking too long"
- First analysis takes 10-15 seconds (normal)
- Subsequent requests use cache (faster)
- Each job takes ~1-2 seconds to score

### "Candidates not showing AI rank"
- Ensure candidates have uploaded resumes
- Admin viewing must have admin role
- Try refreshing or re-analyzing

---

## Rate Limiting

- **Per User:** 3 resume analyses per day (configurable)
- **API:** Follows Google's Gemini Pro rate limits (~60 req/min)
- **Caching:** Results cached for 24 hours to optimize costs

---

## Cost Optimization

✅ **Low Cost** because:
- Caching prevents repeated analyses
- Resume text limited to 50KB
- Gemini Pro is free tier friendly (~$0.005 per 1K tokens)
- Typical cost per analysis: ~$0.01-0.05

---

## Next Steps

1. ✅ Set GEMINI_API_KEY in .env
2. ✅ Start both servers
3. ✅ Test upload resume as user
4. ✅ Check admin candidate ranking
5. ✅ Deploy to production

---

## Support

For issues or questions:
1. Check backend logs: `npm run dev` output
2. Verify Gemini API key is valid
3. Check network tab in browser DevTools
4. Review error messages in .env file

Enjoy AI-powered hiring! 🚀
