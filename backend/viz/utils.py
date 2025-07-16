import pandas as pd
from io import BytesIO

def parse_file(filename: str, content: bytes) -> list[list[str]]:
    if filename.endswith(".csv"):
        df = pd.read_csv(BytesIO(content))
    elif filename.endswith(".xlsx"):
        df = pd.read_excel(BytesIO(content))
    else:
        raise ValueError("Unsupported file type")
    
    # Return first 5 rows as list of lists
    return [df.columns.tolist()] + df.head().values.tolist()
