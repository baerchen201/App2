console.log("Hello, World!");

class data {
  stunde: string;
  klasse: string | string[];
  fach: string;
  raum: string;
  lehrkraft: string;
  ausfall: boolean;

  constructor(
    stunde: string,
    klasse: string | string[],
    fach: string,
    raum: string,
    lehrkraft: string,
    ausfall: boolean = false
  ) {
    this.stunde = stunde;
    this.klasse = klasse;
    this.fach = fach;
    this.raum = raum;
    this.lehrkraft = lehrkraft;
    this.ausfall = ausfall;
  }
}

function random(max: number, offset: number = 0) {
  return Math.floor(Math.random() * max) + offset;
}

function getDataForDay(date: Date): data[] {
  const EXAMPLE_DATA = [
    [
      new data("4", "1a", "M", "0.10 (0.15)", "Ab"),
      new data("2", "4b", "D", "0.14", "Ab", true),
      new data("5", "3.1", "KS", "0.62", "Dd", true),
      new data("5", "9.2", "G", "1.02", "Bc", true),
      new data("12", "200.1", "E", "2.46", "De", true),
      new data("2", ["a6", "5d", "6a", "6.1", "6.0"], "D", "7.11 (2.44)", "De"),
    ],
    [],
    [],
  ];
  let _ = [..."abcdefghijklmnopqrstuvwxyz"];
  let l = 20;
  for (let _index = 1; _index <= 2; _index++) {
    for (let i = 0; i < l; i++) {
      EXAMPLE_DATA[_index].push(
        new data(
          random(20, 4).toString(_index == 1 ? 16 : 10),
          random(6) == 1
            ? Math.floor((l + 1 - i) / 2).toString() + (i % 2 == 0 ? "a" : "b")
            : [
                Math.floor((l + 1 - i) / 2).toString() +
                  (i % 2 == 0 ? "a" : "b"),
                Math.floor((l + 1 - i) / 2).toString() +
                  (i % 2 != 0 ? "a" : "b"),
              ],
          ["D", "E", "F", "M", "KS", "G"][random(6)],
          `${random(2)}.${random(18) > 9 ? 0 : random(6)}${random(9)}`,
          _[random(_.length)].toUpperCase() + _[random(_.length)].toLowerCase(),
          true
        )
      );
    }
  }
  for (let i = 0; i < l; i++) {
    EXAMPLE_DATA[2].push(
      new data(
        random(20, 4).toString(16),
        random(6) != 1
          ? Math.floor((l + 1 - i) / 2).toString() +
            "." +
            Math.floor((l + 1 - i) / 5).toString()
          : [
              Math.floor((l + random(9) - i) / 2).toString() +
                "." +
                Math.floor((l + random(9) - i) / 5).toString(),
              Math.floor((l + random(9) - i) / 2).toString() +
                "." +
                Math.floor((l + random(9) - i) / 5).toString(),
            ],
        ["D", "E", "F", "M", "KS", "G"][random(6)],
        `${random(2)}.${random(18) > 9 ? 0 : random(6)}${random(9)}`,
        _[random(_.length)].toUpperCase() + _[random(_.length)].toLowerCase(),
        true
      )
    );
  }
  let day = Math.floor(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
      ((d) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))(
        new Date()
      )) /
      86400000
  );

  console.log(
    `Requested data for day ${date.toDateString()} (offset of ${day})`
  );
  return EXAMPLE_DATA[day % EXAMPLE_DATA.length];
}

window.addEventListener("load", async () => {
  let args = new URLSearchParams(location.search);
  let day = 0;
  if (args.has("day")) day = Number(args.get("day"));

  let date = new Date(new Date().valueOf() + 86400000 * day);

  switch (date.getDay()) {
    case 6:
      date = new Date(date.valueOf() + 86400000 * 2);
      break;
    case 0:
      date = new Date(date.valueOf() + 86400000);
      break;
  }

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

  let klassen: { [id: string]: HTMLElement[][] } = {};
  getDataForDay(date)
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

      // @ts-ignore
      let _: string[] = i.klasse;
      if (typeof i.klasse == "string") _ = [i.klasse];

      _.forEach((k: string) => {
        if (!Object.keys(klassen).includes(k)) klassen[k] = [];
        let a = [];

        let stunde = document.createElement("span");
        stunde.innerText = i.stunde;
        stunde.classList.add("stunde");
        a.push(stunde);

        let klasse = document.createElement(i.ausfall ? "s" : "span");
        klasse.innerText =
          typeof i.klasse == "string" ? i.klasse : i.klasse.join(", ");
        klasse.classList.add("klasse");
        a.push(klasse);

        let fach = document.createElement(i.ausfall ? "s" : "span");
        fach.innerText = i.fach;
        fach.classList.add("fach");
        a.push(fach);

        let raum = document.createElement(i.ausfall ? "s" : "span");
        raum.innerText = i.raum;
        raum.classList.add("raum");
        a.push(raum);

        let lehrkraft = document.createElement(i.ausfall ? "s" : "span");
        lehrkraft.innerText = i.lehrkraft;
        lehrkraft.classList.add("lehrkraft");
        a.push(lehrkraft);

        klassen[k].push(a);
      });
    });

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
      klassen[k].forEach((a: HTMLElement[]) => {
        let klasse1 = document.createElement("span");
        klasse1.innerText = k;
        klasse1.classList.add("klasse1", c ? "c1" : "c0");
        main.appendChild(klasse1);

        a.forEach((e: HTMLElement) => {
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
      const e = document.querySelector("span")!.children[i] as HTMLElement;
      e.style.top = `calc(${main.getBoundingClientRect().y}px - 1em - 4px)`;
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
    } else await new Promise((resolve, reject) => setTimeout(resolve, 10000));
  }
});
