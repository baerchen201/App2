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
      new data("5", "9.2", "G", "1.02", "Bc", true),
      new data("12", "200.1", "E", "2.46", "De", true),
      new data("2", ["a6", "5d"], "D", "7.11 (2.44)", "De"),
    ],
    [],
  ];
  let _ = [..."abcdefghijklmnopqrstuvwxyz"];
  let l = 20;
  for (let i = 0; i < l; i++) {
    EXAMPLE_DATA[1].push(
      new data(
        random(20, 4).toString(16),
        random(6) == 1
          ? Math.floor((l + 1 - i) / 2).toString() + (i % 2 == 0 ? "a" : "b")
          : [
              Math.floor((l + 1 - i) / 2).toString() + (i % 2 == 0 ? "a" : "b"),
              Math.floor((l + 1 - i) / 2).toString() + (i % 2 != 0 ? "a" : "b"),
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

  if (date.getDay() > 5) {
    date = new Date(date.valueOf() + 86400000 * (date.getDay() - 5));
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

  let c = false,
    d = false;

  let result: HTMLElement[][] = [];

  let klassen = {};
  getDataForDay(date)
    /* .sort((a: data, b: data) => {
      let r = /-?\d+/;
      let sA = a.stunde.match(r),
        sB = b.stunde.match(r);
      if (sA && sB) {
        if (Number(sA[0]) > Number(sB[0])) return AgtB;
        else if (Number(sA[0]) == Number(sB[0])) return AeqB;
        else return AltB;
      } else if (sA) return AltB;
      return AgtB;
    }) */

    .forEach((i: data, index: number, array: data[]) => {
      console.log("Processing", i);
      let r = [];

      // @ts-ignore
      let _: string[] = i.klasse;
      if (typeof i.klasse == "string") _ = [i.klasse];

      _.forEach((k: string) => {
        let klasse1 = document.createElement("span");
        klasse1.innerText = k;
        klasse1.classList.add("klasse1", c ? "c1" : "c0");
        r.push(klasse1);

        let stunde = document.createElement("span");
        stunde.innerText = i.stunde;
        stunde.classList.add("stunde", d ? "d1" : "d0");
        r.push(stunde);

        let klasse = document.createElement(i.ausfall ? "s" : "span");
        klasse.innerText =
          typeof i.klasse == "string" ? i.klasse : i.klasse.join(", ");
        klasse.classList.add("klasse", d ? "d1" : "d0");
        r.push(klasse);

        let fach = document.createElement(i.ausfall ? "s" : "span");
        fach.innerText = i.fach;
        fach.classList.add("fach", d ? "d1" : "d0");
        r.push(fach);

        let raum = document.createElement(i.ausfall ? "s" : "span");
        raum.innerText = i.raum;
        raum.classList.add("raum", d ? "d1" : "d0");
        r.push(raum);

        let lehrkraft = document.createElement(i.ausfall ? "s" : "span");
        lehrkraft.innerText = i.lehrkraft;
        lehrkraft.classList.add("lehrkraft", d ? "d1" : "d0");
        r.push(lehrkraft);

        d = !d;
      });

      if (index != array.length - 1) {
        let e = document.createElement("div");
        e.classList.add("p");
        r.push(e);
      }

      c = !c;
      result.push(r);
    });
  result
    /* .sort((a: HTMLElement[], b: HTMLElement[]) => {
      let r = /-?\d+(\w+)?/;
      let kA = a[0].innerText.match(r),
        kB = b[0].innerText.match(r);
      console.log(kA, kB);
      if (kA && kB) {
        if (parseInt(kA[0], 36) > parseInt(kB[0], 36)) return AgtB;
        else if (parseInt(kA[0], 36) == parseInt(kB[0], 36)) return AeqB;
        else return AltB;
      } else if (kA) return AltB;
      return AgtB;
    }) */
    .forEach((e: HTMLElement[]) => {
      e.forEach((e) => main.appendChild(e));
    });

  for (let i = 0; i < 5; i++) {
    const e = document.querySelector("span")!.children[i] as HTMLElement;
    e.style.top = `calc(${main.getBoundingClientRect().y}px - 1em - 4px)`;
    e.style.left = `${
      (main.children[i + 1] as HTMLElement).getBoundingClientRect().x
    }px`;
  }

  let direction = true;
  while (true) {
    if (main.clientHeight - window.innerHeight > 0) {
      await new Promise((resolve, reject) =>
        main
          .animate(
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
          )
          .addEventListener("finish", resolve)
      );
      direction = !direction;
    } else await new Promise((resolve, reject) => setTimeout(resolve, 10000));
  }
});
