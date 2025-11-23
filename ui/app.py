# ui/app.py
import streamlit as st
import requests
API_URL = st.secrets.get("API_URL", "http://localhost:8000")

st.title("AI Tutor — Week 1 Demo")
user_id = st.text_input("User ID", "student_1")
query = st.text_area("Ask a question (math or physics)")

if st.button("Ask"):
    with st.spinner("Thinking..."):
        r = requests.post(f"{API_URL}/chat", json={"user_id": user_id, "question": query})
        if r.ok:
            st.markdown("**Answer:**")
            st.write(r.json()["answer"])
        else:
            st.error(f"API Error: {r.text}")
