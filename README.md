Interview Assistant

This is a simple interview assistant web app built with React, Redux Toolkit, and TypeScript.

It lets candidates upload resumes, answer timed interview questions in a chat interface, and gives recruiters a dashboard to review scores, summaries, and candidate details.


What it Does

Upload a resume (PDF/DOCX) and pull out basic info like name, email, and phone.

Chat-style interview: candidates answer questions while a timer runs.

Questions are marked as Easy (20s), Medium (60s), or Hard (120s).

At the end, the candidate gets a score + summary.

Recruiter Dashboard shows all candidates, their scores, and interview histories.


Built With

React + TypeScript → core frontend

Redux Toolkit → state management (resume, interview, candidates)

Ant Design (antd) → UI (tables, inputs, modals, etc.)

pdfjs-dist + mammoth → resume parsing (PDF/DOCX)

Recharts → skill radar visualization

Vite → build tool


Netlify → deployment


Project Structure
src/
 ├── components/    → UI parts like ChatWindow, ResumeUpload, CandidatesTable
 ├── pages/         → IntervieweePage (candidate), InterviewerPage (dashboard)
 ├── slices/        → Redux slices (resume, interview, candidates)
 ├── utils/         → Helpers (scoring, parsing)
 └── store.ts       → Redux store setup
How to Run It

Clone this repo:

git clone https://github.com/<your-username>/interview-assistant.git
cd interview-assistant

Install dependencies:

npm install

This will install:

react, react-dom, react-router-dom (core React libraries)

@reduxjs/toolkit, react-redux (state management)

antd (UI components)

pdfjs-dist, mammoth (resume parsing)

recharts (charts for skills)

vite (development/build tool)

typescript + @types/* packages (TypeScript support)

Run locally:

npm run dev

Build for production:

npm run build

Deployment

I used Netlify for deployment.

Push your project to GitHub.

Connect the repo to Netlify.

Set build command: npm run build

Set publish directory: dist/

Deploy → Done 

What it Looks Like

Resume upload → missing details filled in chat.

Chat interview → timed questions with countdown.

Candidate summary → score + feedback.

Dashboard → recruiter view of all candidates + details.
