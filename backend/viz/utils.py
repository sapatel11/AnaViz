import pandas as pd
from io import BytesIO

def parse_file(filename: str, content: bytes) -> tuple[list[list[str]], list[list[str]]]:
    if filename.endswith(".csv"):
        df = pd.read_csv(BytesIO(content))
    elif filename.endswith(".xlsx"):
        df = pd.read_excel(BytesIO(content))
    else:
        raise ValueError("Unsupported file type")
    
    # Return both preview (first 5 rows) and full data as list of lists
    preview = [df.columns.tolist()] + df.head().values.tolist()
    full_data = [df.columns.tolist()] + df.values.tolist()
    
    return preview, full_data
