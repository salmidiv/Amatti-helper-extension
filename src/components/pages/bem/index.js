// https://cdn.jsdelivr.net/npm/apexcharts

var preloader = document.querySelector("#preloader");
var overflow = document.querySelector(".overflow");
preloader.classList.add("e");
window.addEventListener("load", function () {
  setTimeout(function () {
    $con.classList.remove("d-none");
    preloader.classList.add("h");
  }, 1500);
});

function counter(elm, id, start, end, duration) {
  //let obj = elm.getElementsByClassName(id),
  let current = start,
    range = end - start,
    increment = end > start ? 1 : -1,
    step = Math.abs(Math.floor(duration / range)),
    timer = setInterval(() => {
      current += increment;
      elm.textContent = current;
      if (current == end) {
        clearInterval(timer);
      }
    }, step);
}
var elems = document.getElementsByClassName("count-number");
[].forEach.call(elems, function (el, i) {
  const n = Number(el.innerHTML);
  console.log(elems.item(i));
  counter(elems.item(i), "count-number", 0, n, 3000);
});
function myFunction(e) {
  var elems = document.querySelectorAll(".active");
  [].forEach.call(elems, function (el) {
    el.closest("a").classList.remove("active");
  });
  e.target.closest("a").classList.add("active");
}
function loader_active() {
  overflow.classList.add("d-none");
  preloader.classList.remove("h");
}
function loader_inactive() {
  overflow.classList.remove("d-none");
  preloader.classList.add("h");
}
$nivs.addEventListener("change", () => {
  if ($nivs.value == 1) {
    loader_active();
    setTimeout(function () {
      loader_inactive();
    }, 2500);
  }
});
