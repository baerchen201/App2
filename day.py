#!venv/bin/python
from typing import Literal, Any
import sys
import json
from requests import get, post
from urllib.parse import quote
from datetime import date, timedelta

UA = "Mozilla/5.0 (X11; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0"


def err(
    *values: object, sep: str | None = " ", end: str | None = "\n", exit: int | None = 1
):
    print(*values, file=sys.stderr, sep=sep, end=end)
    raise SystemExit(exit)


config: dict[Literal["username", "password", "server", "school"], str]
try:
    with open("config.json", "r") as f:
        config: dict[Literal["username", "password", "server", "school"], str] = (
            json.load(f)
        )
        for k in ["username", "password", "server", "school"]:
            if not config[k]:
                raise ValueError(f"Value empty: {k}")
        config["server"] = config["server"].removesuffix("/")
except (
    json.decoder.JSONDecodeError,
    FileNotFoundError,
    IsADirectoryError,
    PermissionError,
    KeyError,
    ValueError,
) as e:
    err(f"An error occurred while loading config.json:\n{type(e).__name__} - {e}")


auth = post(
    f"{config["server"]}/j_spring_security_check",
    data=f"school={quote(config["school"])}&j_username={quote(config["username"])}&j_password={quote(config["password"])}&token=",
    headers={
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": config.get("useragent", UA),
        "Accept": "application/json",
    },
)
try:
    if auth.status_code != 200:
        raise ValueError("Non-200 response")
    state = auth.json().get("state", None)
    match state:
        case "TOKEN_REQUIRED":
            raise PermissionError("2-Factor Authentication enabled")
        case "SUCCESS":
            pass
        case _:
            print(auth.json())
            raise ValueError(f"Non-SUCCESS response: {state}")
except (json.decoder.JSONDecodeError, PermissionError, ValueError) as e:
    err(f"An error occurred while requesting authentication:\n{type(e).__name__} - {e}")

auth_new = get(f"{config["server"]}/api/token/new", cookies=auth.cookies)
try:
    if auth_new.status_code != 200:
        raise ValueError("Non-200 response")
    token = "Bearer " + auth_new.text
except ValueError as e:
    err(f"An error occurred while requesting token:\n{type(e).__name__} - {e}")

offset = 0
try:
    offset = int(sys.argv[-1])
except (ValueError, TypeError):
    pass

day = (
    lambda d, x: d
    + timedelta(days=x + 2 * (x // 5) + (0 if (d.weekday() + x % 5) < 5 else 2))
)(date.today(), offset).strftime(r"%Y-%m-%d")

classes = get(
    f"{config["server"]}/api/rest/view/v1/timetable/filter?resourceType=CLASS&timetableType=STANDARD",
    cookies=auth.cookies,
    headers={"Authorization": token},
)

class_list: list[int] = []
try:
    for i in classes.json()["classes"]:
        class_list.append(i["class"]["id"])
except (json.decoder.JSONDecodeError, KeyError) as e:
    err(f"An error occurred while requesting class list:\n{type(e).__name__} - {e}")

entries = get(
    f"{config["server"]}/api/rest/view/v1/timetable/entries?start={day}&end={day}&format=1&resourceType=CLASS&resources={",".join([str(i) for i in class_list])}&timetableType=STANDARD",
    cookies=auth.cookies,
    headers={"Authorization": token},
)
try:
    print(json.dumps(entries.json()))
    if entries.status_code != 200:
        raise ValueError("Non-200 response")
except ValueError as e:
    err(f"An error occurred while requesting timetable:\n{type(e).__name__} - {e}")

try:
    get(f"{config["server"]}/saml/logout", cookies=auth.cookies)
except Exception as e:
    pass
