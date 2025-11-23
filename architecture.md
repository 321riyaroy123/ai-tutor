flowchart LR
    %% User & Frontend
    user([👩‍🎓 User]) --> ui[Streamlit UI]
    ui --> api[FastAPI Backend]
    api --> rag[RAG Retriever & Vector Store]
    rag --> granite[Granite LLM (IBM Granite)]
    granite --> sympy[SymPy Math Solver]
    sympy --> api
    api --> ui
    ui --> user

    %% Storage & Knowledge
    subgraph STORAGE[📦 Storage Layer]
        data[📚 OpenStax PDFs]
        vectordb[(🧠 Vector DB: Chroma/FAISS)]
        gdrive[(☁️ Google Drive Assets)]
    end
    rag --> vectordb
    data --> vectordb
    gdrive --> data

    %% DevOps / Infrastructure
    subgraph DEVOPS[⚙️ DevOps & Deployment]
        docker[(🐳 Docker Containers)]
        cicd[(🔁 GitHub Actions CI/CD Pipeline)]
        aws[(☁️ AWS Deployment — EC2 / ECS / S3)]
    end

    %% Flows
    ui -.-> docker
    api -.-> docker
    docker --> cicd
    cicd --> aws
    aws --> user

    %% Styling
    classDef ui fill:#dae8fc,stroke:#6c8ebf,stroke-width:2px,color:#000;
    classDef api fill:#d5e8d4,stroke:#82b366,stroke-width:2px,color:#000;
    classDef ai fill:#fff2cc,stroke:#d6b656,stroke-width:2px,color:#000;
    classDef storage fill:#f5f5f5,stroke:#999999,stroke-width:1px,color:#000;
    classDef devops fill:#f8cecc,stroke:#b85450,stroke-width:2px,color:#000;

    class ui ui;
    class api api;
    class rag,granite,sympy ai;
    class data,vectordb,gdrive storage;
    class docker,cicd,aws devops;
