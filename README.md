# AI Tutor -- Agentic STEM Learning Assistant

## Overview

AI Tutor is an intelligent learning assistant designed to help students
understand STEM concepts through structured explanations and
step-by-step reasoning.

The system combines **Agentic AI**, **Retrieval Augmented Generation
(RAG)**, and **context-aware dialogue** to provide reliable tutoring
instead of simple answer generation.

The goal of the project is to create an AI system that explains concepts
clearly, supports problem solving, and improves conceptual
understanding.

------------------------------------------------------------------------

## Key Features

-   Step-by-step problem solving
-   Retrieval Augmented Generation (RAG) for contextual answers
-   Persistent chat history and conversation memory
-   PDF knowledge ingestion for study material
-   User authentication and session management
-   Modern dark-themed user interface

------------------------------------------------------------------------

## System Architecture

User Interface (React) 
      ↓ 
REST API (FastAPI Backend) 
      ↓ 
RAG Pipeline
(Document Retrieval + Context Construction) 
      ↓ 
AI Model
(Transformer-based reasoning) 
      ↓ 
MongoDB Database (Users, Chats, Progress)

Workflow: 
1. User submits a question through the web interface 
2. Backend receives the request via FastAPI 
3. Relevant knowledge is retrieved using the RAG pipeline 
4. The AI model generates a structured response 
5. The answer is returned to the frontend and stored in the database

------------------------------------------------------------------------

## Tech Stack

### Backend

-   FastAPI
-   Python
-   Uvicorn
-   PyPDF2
-   HuggingFace Transformers
-   PyTorch
-   python-dotenv

### Frontend

-   ReactJS
-   Axios
-   CSS (Dark UI theme)

### Database

-   MongoDB Atlas

------------------------------------------------------------------------

## Current Implementation Progress

### Authentication System

-   User registration
-   Login functionality
-   JWT-based authentication

### Chat System

-   AI tutor chat interface
-   Persistent conversation storage
-   Context-aware responses

### Retrieval Augmented Generation (RAG)

-   PDF document ingestion
-   Knowledge extraction
-   Context retrieval for responses

### AI Response System

-   Transformer model integration
-   Structured reasoning-based responses

### Frontend Interface

-   Light and dark themed UI
-   Chat interface connected to backend APIs

------------------------------------------------------------------------

## Project Structure

project-root 
│ ├── api 
  │ └── app 
  │ ├── main.py 
  │ ├── db.py 
  │ ├──dependencies.py 
│ ├── models 
  │ └── routes 
  │ ├── rag 
  │ ├── memory 
  │ ├── retriever 
  │ └── embeddings 
│ ├── frontend 
  │ ├── src 
  │ ├── components 
  │ └── pages 
│ ├── requirements.txt 
├── .env 
└── README.md

------------------------------------------------------------------------

## Installation

### Clone the Repository

git clone https://github.com/321riyaroy123/ai-tutor.git 
cd ai-tutor
 
### Backend Setup

pip install -r requirements.txt 
uvicorn api.app.main:app --reload

Backend runs on: http://localhost:8000

### Frontend Setup

cd frontend 
npm install 
npm start

Frontend runs on: http://localhost:3000

------------------------------------------------------------------------

## API Endpoints

  Endpoint    Method   Description
  ----------- -------- ------------------------------
  /register   POST     Register a new user
  /login      POST     User authentication
  /chat       POST     Send question to AI tutor
  /history    GET      Retrieve chat history
  /progress   GET      Fetch user learning progress

------------------------------------------------------------------------

## Future Improvements

-   Improved reasoning agents
-   Multi-document retrieval for RAG
-   Mathematical expression rendering
-   Voice-based tutoring interaction
-   Adaptive difficulty based on learner progress
-   Knowledge graph integration

------------------------------------------------------------------------

## Research Focus

This project explores the integration of **Agentic AI + Retrieval
Augmented Generation for educational tutoring systems**.

The aim is to build AI tutors that prioritize reasoning, explanation,
and conceptual clarity rather than only generating answers.

------------------------------------------------------------------------

## Author

Riya Roy\
Artificial Intelligence and Machine Learning

------------------------------------------------------------------------

## License

This project is developed for academic and research purposes.
