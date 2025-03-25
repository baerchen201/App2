window.addEventListener("load", () => {
  console.info("Hello, World!");
  window.addEventListener("beforeunload", () => {
    console.info("Goodbye, World!");
    document.body.classList.add("updating");
    location.reload();
  });
});
