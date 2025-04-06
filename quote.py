import requests
from typing import Literal
from html import escape

r = requests.get(
    "https://thequoteshub.com/api/random-quote",
    headers={
        "Accept": "application/json",
        "User-Agent": f"Python script (App2) using requests v{requests.__version__} (https://github.com/baerchen201/App2, videocreator@outlook.de)",
    },
)
r.raise_for_status()
json: dict[
    Literal["text", "author", "tags", "id", "author_id"], str | list[str] | int
] = r.json()
print(
    f"<div style=\"font-size: 2rem\">{escape(json['text']).replace("\n", "<br />")}<br /><i> - {escape(json['author'])}</i></div>"
)
