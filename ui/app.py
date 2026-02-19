import streamlit as st
import requests
import uuid

# ---------------------------------
# CONFIG
# ---------------------------------
BACKEND_URL = "http://localhost:8000/ask"

st.set_page_config(
    page_title="AI Tutor",
    page_icon="🎓",
    layout="wide"
)

# ---------------------------------
# SESSION STATE INIT
# ---------------------------------
if "messages" not in st.session_state:
    st.session_state.messages = []

if "user_id" not in st.session_state:
    st.session_state.user_id = str(uuid.uuid4())

if "student_level" not in st.session_state:
    st.session_state.student_level = "intermediate"

if "last_metadata" not in st.session_state:
    st.session_state.last_metadata = {}

# ---------------------------------
# HEADER
# ---------------------------------
st.title("🎓 AI Tutor")
st.caption("Hybrid RAG + Adaptive Difficulty STEM Tutor")

# ---------------------------------
# SIDEBAR
# ---------------------------------
with st.sidebar:
    st.header("⚙ Settings")

    st.session_state.student_level = st.selectbox(
        "Student Level",
        ["beginner", "intermediate", "advanced"],
        index=1
    )

    if st.button("🗑 Clear Chat"):
        st.session_state.messages = []
        st.session_state.last_metadata = {}
        st.experimental_rerun()

    st.markdown("---")
    st.success("Backend Connected")

# ---------------------------------
# LAYOUT COLUMNS
# ---------------------------------
col_chat, col_meta = st.columns([3, 1])

# ---------------------------------
# CHAT INPUT (⚠ MUST BE ROOT LEVEL)
# ---------------------------------
if "is_loading" not in st.session_state:
    st.session_state.is_loading = False

prompt = st.chat_input("Ask a STEM question...")

if prompt:
    st.session_state.is_loading = True
    st.session_state.messages.append({
        "role": "user",
        "content": prompt
    })
    st.session_state.current_prompt = prompt
    st.experimental_rerun()

# ---------------------------------
# HANDLE LOADING STATE
# ---------------------------------
if st.session_state.get("is_loading", False):

    with col_chat:
        with st.chat_message("user"):
            st.markdown(prompt, unsafe_allow_html=True)
        with st.chat_message("assistant"):
            st.markdown("⏳ Thinking...")

    try:
        response = requests.post(
            BACKEND_URL,
            json={
                "user_id": st.session_state.user_id,
                "question": st.session_state.current_prompt,
                "student_level": st.session_state.student_level
            },
            timeout=120
        )

        if response.status_code == 200:
            data = response.json()

            answer = data.get("answer", "No answer returned.")

            st.session_state.messages.append({
                "role": "assistant",
                "content": answer
            })

            st.session_state.last_metadata = {
                "confidence": data.get("confidence", 0),
                "model_used": data.get("model_used", "unknown"),
                "sources": data.get("sources", []),
                "pages": data.get("pages", []),
                "latency": data.get("latency_seconds", 0)
            }

        else:
            st.session_state.messages.append({
                "role": "assistant",
                "content": f"Backend error: {response.text}"
            })

    except Exception as e:
        st.session_state.messages.append({
            "role": "assistant",
            "content": f"Connection error: {e}"
        })

    st.session_state.is_loading = False
    st.experimental_rerun()

# ---------------------------------
# LEFT COLUMN — CHAT DISPLAY
# ---------------------------------
with col_chat:
    for msg in st.session_state.messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"], unsafe_allow_html=True)

# ---------------------------------
# RIGHT COLUMN — ANALYTICS
# ---------------------------------
with col_meta:
    st.markdown("### 📊 Response Analytics")

    meta = st.session_state.last_metadata

    if meta:
        confidence = meta.get("confidence", 0)
        model_used = meta.get("model_used", "unknown")
        latency = meta.get("latency", 0)
        sources = meta.get("sources", [])
        pages = meta.get("pages", [])

        st.markdown("**Confidence Score**")
        st.progress(min(max(confidence, 0), 1))

        st.markdown(f"**Model:** {model_used}")
        st.markdown(f"**Latency:** {latency} sec")

        if sources:
            st.markdown("**Sources:**")
            for s in sources:
                st.markdown(f"- {s}")

        if pages:
            st.markdown("**Pages Retrieved:**")
            st.write(pages)

    else:
        st.info("Ask a question to see analytics.")

