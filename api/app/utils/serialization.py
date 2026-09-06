from bson import ObjectId


def serialize_mongo_document(document):
    """
    Convert MongoDB-specific values into JSON-safe values.
    """

    if document is None:
        return None

    if isinstance(document, list):
        return [
            serialize_mongo_document(item)
            for item in document
        ]

    if isinstance(document, dict):
        return {
            key: (
                str(value)
                if isinstance(value, ObjectId)
                else serialize_mongo_document(value)
            )
            for key, value in document.items()
        }

    return document