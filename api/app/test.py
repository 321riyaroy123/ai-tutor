import sys
print("Python path:", sys.executable)

try:
    from transformers import pipeline
    print("✅ Import successful")
    
    pipe = pipeline("text2text-generation", model="google/flan-t5-small")
    print("✅ Pipeline created")
    
    result = pipe("translate English to French: Hello")
    print("✅ Pipeline works:", result)
except Exception as e:
    print("❌ Error:", e)
    import traceback
    traceback.print_exc()