const SHOW_ALL = new URLSearchParams(location.search).has("all"),
  USE_EXAMPLE_DATA = new URLSearchParams(location.search).has("example");

console.log("Hello, World!");

class data {
  stunde: string;
  klasse: string | string[];
  fach: string;
  raum: string;
  lehrkraft: string;
  id: number[];
  ausfall: boolean;
  classes: string[];

  constructor(
    stunde: string,
    klasse: string | string[],
    fach: string,
    raum: string,
    lehrkraft: string,
    id: number[],
    ausfall: boolean = false,
    classes: string[] = []
  ) {
    this.stunde = stunde;
    this.klasse = klasse;
    this.fach = fach;
    this.raum = raum;
    this.lehrkraft = lehrkraft;
    this.id = id;
    this.ausfall = ausfall;
    this.classes = classes;
  }
}

interface Iinfo {
  type: "INFO";
  status: "REGULAR";
  shortName: string;
  longName: string;
  displayName: string;
}

function random(max: number, offset: number = 0) {
  return Math.floor(Math.random() * max) + offset;
}

function stunde(e: { start: string; end: string }) {
  let start, end;
  start = ((i: string) => {
    switch (i.split("T")[1]) {
      case "07:40":
        return 1;
      case "08:25":
        return 2;
      case "09:35":
        return 3;
      case "10:20":
        return 4;
      case "11:30":
        return 5;
      case "12:15":
        return 6;
      case "13:00":
        return 7;
      case "14:00":
        return 8;
      case "14:45":
        return 9;
      case "15:30":
        return 10;
      case "16:15":
        return 11;
      case "17:00":
        return 12;
      default:
        return null;
    }
  })(e["start"]);
  end = ((i: string) => {
    switch (i.split("T")[1]) {
      case "08:25":
        return 1;
      case "09:10":
        return 2;
      case "10:20":
        return 3;
      case "11:05":
        return 4;
      case "12:15":
        return 5;
      case "13:00":
        return 6;
      case "14:00":
        return 7;
      case "14:45":
        return 8;
      case "15:30":
        return 9;
      case "16:15":
        return 10;
      case "17:00":
        return 11;
      case "17:45":
        return 12;
      default:
        return null;
    }
  })(e["end"]);
  if (!start || !end)
    return `${e["start"].split("T")[1]} - ${e["end"].split("T")[1]}`;
  if (start == end) return start.toString();
  return `${start} - ${end}`;
}

function dayOffset(day: number): Date {
  return ((d: Date) => {
    let weekday = d.getDay() == 0 ? 6 : d.getDay() - 1;
    return new Date(
      d.valueOf() +
        (() =>
          day + 2 * Math.floor(day / 5) + (weekday + (day % 5) < 5 ? 0 : 2))() *
          86400000
    );
  })(
    ((d) => new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())))(
      new Date()
    )
  );
}

async function getDataForDay(day: number): Promise<data[]> {
  console.log(
    `Requested data for day ${dayOffset(
      day
    ).toDateString()} (offset of ${day})` +
      (USE_EXAMPLE_DATA ? " [EXAMPLE]" : "")
  );
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open(
      "GET",
      (!USE_EXAMPLE_DATA ? "day.php" : "example.php") + `?day=${day}`
    );
    xhr.addEventListener("readystatechange", (e: Event) => {
      if (xhr.readyState != XMLHttpRequest.DONE) return;
      if (xhr.status != 200)
        reject({ request: xhr, response: xhr.responseText });
      try {
        let json: { days: { [id: string]: any }[]; errors: any[] } = JSON.parse(
          xhr.responseText
        );
        let a: data[] = [];
        json["days"].forEach((day) => {
          day["gridEntries"].forEach((i: any) => {
            if (SHOW_ALL || i["status"] != "REGULAR")
              a.push(
                (() => {
                  let rooms: { added: string[]; removed: string[] } = {
                      added: [],
                      removed: [],
                    },
                    teachers: { added: string[]; removed: string[] } = {
                      added: [],
                      removed: [],
                    },
                    classes: { added: string[]; removed: string[] } = {
                      added: [day["resource"]["shortName"]],
                      removed: [],
                    },
                    info: Iinfo[] = [],
                    subject: string[] = [];
                  for (let _i = 1; _i <= 5; _i++) {
                    let pos = i[`position${_i}`];
                    if (pos)
                      pos.forEach((item: any) => {
                        ["current", "removed"].forEach((_) => {
                          if (item[_])
                            switch (item[_]["type"]) {
                              case "TEACHER":
                                switch (item[_]["status"]) {
                                  case "REMOVED":
                                    teachers["removed"].push(
                                      item[_]["shortName"]
                                    );
                                    break;

                                  default:
                                    teachers["added"].push(
                                      item[_]["shortName"]
                                    );
                                    break;
                                }
                                break;

                              case "ROOM":
                                switch (item[_]["status"]) {
                                  case "REMOVED":
                                    rooms["removed"].push(item[_]["shortName"]);
                                    break;

                                  default:
                                    rooms["added"].push(item[_]["shortName"]);
                                    break;
                                }
                                break;

                              case "CLASS":
                                switch (item[_]["status"]) {
                                  case "REMOVED":
                                    classes["removed"].push(
                                      item[_]["shortName"]
                                    );
                                    break;

                                  default:
                                    classes["added"].push(item[_]["shortName"]);
                                    break;
                                }
                                break;

                              case "SUBJECT":
                                if (item[_]["status"] == "REGULAR")
                                  subject.push(item[_]["shortName"]);
                                break;

                              case "INFO":
                                if (item[_]["status"] == "REGULAR")
                                  info.push(item[_]);
                                break;
                            }
                        });
                      });
                  }

                  return new data(
                    stunde(i["moved"] ?? i["duration"]),
                    classes["added"],
                    subject.length
                      ? subject.join(", ")
                      : info
                          .map((e: Iinfo) => {
                            return e["displayName"].length < 15
                              ? e["displayName"]
                              : e["shortName"];
                          })
                          .filter((e: string) => {
                            return e.length < 15;
                          })
                          .join(", "),
                    `${rooms["added"].join(", ")}` +
                      (rooms["removed"].length
                        ? ` (${rooms["removed"].join(", ")})`
                        : ""),
                    `${teachers["added"].join(", ")}` +
                      (teachers["removed"].length
                        ? ` (${teachers["removed"].join(", ")})`
                        : ""),
                    i["ids"] ?? [],
                    i["status"] == "CANCELLED",
                    [i["status"], i["statusDetail"]]
                  );
                })()
              );
          });
        });
        resolve(a);
      } catch (error) {
        reject(error);
      }
    });
    xhr.send();
  });
}

window.addEventListener("load", async () => {
  let args = new URLSearchParams(location.search);
  let day = 0;
  if (args.has("day")) day = Number(args.get("day"));

  let date = dayOffset(day);

  document.querySelector("h2")!.innerText += date.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  document.querySelector("h4")!.innerText += new Date()
    .toLocaleString("de-DE")
    .replace(",", "");

  const main = document.querySelector("div") as HTMLDivElement;
  main.classList.add("d" + day.toString());

  const AgtB = 1,
    AeqB = 0,
    AltB = -1;

  let klassen: { [id: string]: (HTMLElement | string[])[][] } = {};
  getDataForDay(day)
    .then(async (__data: data[]) => {
      try {
        let processed: number[] = [];
        __data
          .sort((a: data, b: data) => {
            let r = /-?\d+/;
            let sA = a.stunde.match(r),
              sB = b.stunde.match(r);
            if (sA && sB) {
              if (Number(sA[0]) > Number(sB[0])) return AgtB;
              else if (Number(sA[0]) == Number(sB[0])) return AeqB;
              else return AltB;
            } else if (sA) return AltB;
            return AgtB;
          })
          .forEach((i: data, index: number, array: data[]) => {
            console.log("Processing", i);

            if (
              !i.id.every((e: number) => {
                if (processed.includes(e)) return false;
                return true;
              })
            )
              return;

            i.id.forEach((id: number) => processed.push(id));

            // @ts-ignore
            let _: string[] = i.klasse;
            if (typeof i.klasse == "string") _ = [i.klasse];

            _.forEach((k: string) => {
              if (!Object.keys(klassen).includes(k)) klassen[k] = [];
              let a: (HTMLElement | string[])[] = [i.classes];

              let stunde = document.createElement("span");
              stunde.innerText = i.stunde;
              stunde.classList.add("stunde", ...i.classes);
              a.push(stunde);

              let klasse = document.createElement(i.ausfall ? "s" : "span");
              klasse.innerText =
                typeof i.klasse == "string" ? i.klasse : i.klasse.join(", ");
              klasse.classList.add("klasse", ...i.classes);
              a.push(klasse);

              let fach = document.createElement(i.ausfall ? "s" : "span");
              fach.innerText = i.fach;
              fach.classList.add("fach", ...i.classes);
              a.push(fach);

              let raum = document.createElement(i.ausfall ? "s" : "span");
              raum.innerText = i.raum;
              raum.classList.add("raum", ...i.classes);
              a.push(raum);

              let lehrkraft = document.createElement(i.ausfall ? "s" : "span");
              lehrkraft.innerText = i.lehrkraft;
              lehrkraft.classList.add("lehrkraft", ...i.classes);
              a.push(lehrkraft);

              klassen[k].push(a);
            });
          });

        if (Object.keys(klassen).length == 0) {
          document.querySelector("span")!.innerText = "Keine Änderungen";
          document.body.classList.add("none");
          window.parent.postMessage(true);
          document.body.classList.remove("updating");
          return;
        }

        let c = false,
          d = false;
        Object.keys(klassen)
          .sort((a: string, b: string) => {
            let r = /-?\d+\w*/;
            let kA = a.match(r),
              kB = b.match(r);
            if (kA && kB) {
              if (parseInt(kA[0], 36) > parseInt(kB[0], 36)) return AgtB;
              else if (parseInt(kA[0], 36) == parseInt(kB[0], 36)) return AeqB;
              else return AltB;
            } else if (kA) return AltB;
            return AgtB;
          })
          .sort((a: string, b: string) => {
            let r = /-?\d+(?:\.\d+)?/;
            let kA = a.match(r),
              kB = b.match(r);
            if (kA && kB) {
              if (Number(kA[0]) > Number(kB[0])) return AgtB;
              else if (Number(kA[0]) == Number(kB[0])) return AeqB;
              else return AltB;
            } else if (kA) return AltB;
            return AgtB;
          })
          .forEach((k: string) => {
            klassen[k].forEach((a: (HTMLElement | string[])[]) => {
              let klasse1 = document.createElement("span");
              klasse1.innerText = k;
              klasse1.classList.add(
                "klasse1",
                c ? "c1" : "c0",
                ...(a.shift() as string[])
              );
              main.appendChild(klasse1);

              (a as HTMLElement[]).forEach((e: HTMLElement) => {
                e.classList.add(d ? "d1" : "d0");
                main.appendChild(e);
              });

              d = !d;
            });

            let e = document.createElement("div");
            e.classList.add("p");
            main.appendChild(e);

            c = !c;
          });

        window.addEventListener("resize", () => {
          main.getAnimations().forEach((a) => a.cancel());
          for (let i = 0; i < 5; i++) {
            const e = document.querySelector("span")!.children[
              i
            ] as HTMLElement;
            e.style.top = `calc(${
              main.getBoundingClientRect().y
            }px - 1em - 4px)`;
            e.style.left = `${
              (main.children[i + 1] as HTMLElement).getBoundingClientRect().x
            }px`;
          }
        });
        window.dispatchEvent(new Event("resize"));

        window.parent.postMessage(true);
        document.body.classList.remove("updating");

        let direction = true;
        while (true) {
          if (main.clientHeight - window.innerHeight > 0) {
            await new Promise((resolve, reject) => {
              let a = main.animate(
                [
                  { transform: "none" },
                  {
                    transform: `translateY(${-(
                      main.clientHeight - window.innerHeight
                    )}px)`,
                  },
                ],
                {
                  duration: (main.clientHeight - window.innerHeight) * 30,
                  direction: direction ? "normal" : "reverse",
                  fill: "forwards",
                  delay: 1000,
                }
              );
              a.addEventListener("finish", resolve);
              a.addEventListener("cancel", resolve);
            });
            direction = !direction;
          } else
            await new Promise((resolve, reject) => setTimeout(resolve, 10000));
        }
      } catch (e: any) {
        error(
          "An error occurred while generating web content:",
          `${e.name}: ${e.message}`
        );
        console.error(e);
      }
    })
    .catch((reason: { request: XMLHttpRequest; response: string } | Error) => {
      console.error("getDataForDay rejected:", reason);

      if (reason instanceof Error) {
        error(
          "An error occurred while obtaining WebUntis data:",
          `${reason.name}: ${reason.message}`
        );
        console.error(reason);
      } else
        error(
          `${reason["request"].status} ${reason["request"].statusText}`,
          reason["response"],
          !reason["request"]
            .getResponseHeader("Content-Type")
            ?.startsWith("text/html")
        );
    });
});

function error(title: string, text: string, innerText: boolean = true) {
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
  document.body.classList.add("error");
  document.body.appendChild(container);
}
