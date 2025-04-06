console.log("Hello, World!");

class displayData {
  type: "t" | "i" | "h" | string | null;
  data: string;

  constructor(response: string) {
    if (response.length < 2) {
      this.type = null;
      this.data = "";
      return;
    }
    this.type = response.substring(0, 1);
    this.data = response.substring(1);
  }

  createElement(): HTMLElement {
    let e;
    switch (this.type) {
      case null:
        e = document.createElement("div");
        break;
      case "i":
        e = document.createElement("img");
        e.src = this.data;
        break;
      case "h":
        e = document.createElement("div");
        e.innerHTML = this.data;
        break;
      default:
        e = document.createElement("div");
        e.innerText = this.data;
        break;
    }
    e.classList.add((this.type ?? "null").toString());
    return e;
  }
}

async function getDisplayData(): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "side.php");
    xhr.addEventListener("readystatechange", (e: Event) => {
      if (xhr.readyState != XMLHttpRequest.DONE) return;
      if (xhr.status != 200)
        reject({ request: xhr, response: xhr.responseText });
      try {
        resolve(new displayData(xhr.response).createElement());
      } catch (error) {
        reject(error);
      }
    });
    xhr.send();
  });
}

window.addEventListener("load", async () => {
  getDisplayData()
    .then((e: HTMLElement) => {
      document.getElementById("info")?.appendChild(e);
      document.body.classList.remove("updating");
    })
    .catch((reason: { request: XMLHttpRequest; response: string }) => {
      console.error("getDisplayData rejected:", reason);

      if (reason instanceof Error) {
        _error(
          "An error occurred while obtaining information:",
          `${reason.name}: ${reason.message}`
        );
        console.error(reason);
      } else
        _error(
          `${reason["request"].status} ${reason["request"].statusText}`,
          reason["response"],
          !reason["request"]
            .getResponseHeader("Content-Type")
            ?.startsWith("text/html")
        );
    });
});

function _error(title: string, text: string, innerText: boolean = true) {
  document.body.classList.remove("updating");

  let title_element = document.createElement("h1");
  title_element.innerText = title;
  title_element.classList.add("title");

  let text_element = document.createElement("span");
  if (innerText) text_element.innerText = text;
  else text_element.innerHTML = text;
  text_element.classList.add("text");

  let container = document.createElement("div");
  container.appendChild(title_element);
  container.appendChild(text_element);
  container.classList.add("error");

  let c = document.getElementById("info")!;
  c.classList.add("errorc");
  c.appendChild(container);

  document.body.classList.add("errorb");
}
