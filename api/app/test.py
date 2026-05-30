import sys
import traceback


def main() -> None:
    print("Python path:", sys.executable)

    try:
        from transformers import pipeline

        print("Import successful")
        pipe = pipeline("text2text-generation", model="google/flan-t5-small")
        print("Pipeline created")

        result = pipe("translate English to French: Hello")
        print("Pipeline works:", result)
    except Exception as error:
        print("Error:", error)
        traceback.print_exc()


if __name__ == "__main__":
    main()
