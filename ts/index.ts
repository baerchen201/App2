window.addEventListener("load", () => {
  console.info("Hello, World!");
  document.body.classList.remove("updating");

  window.addEventListener("beforeunload", () => {
    console.info("Goodbye, World!");
    document.body.classList.add("updating");
    location.reload();
  });
});
