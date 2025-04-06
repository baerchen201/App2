import requests
from typing import Literal
from html import escape
from time import sleep

while True:
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
    if len(json["text"]) < 200:
        break
    sleep(1)
print(
    f"<div style=\"font-size: 2rem\">{escape(json['text']).replace("\n", "<br />")}<br /><i> - {escape(json['author'])}</i></div>"
)
