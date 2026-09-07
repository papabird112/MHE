// Carry the current section anchor across the EN / TH switch, so a reader deep in a
// long chapter lands on the same section in the other language.
document.querySelectorAll('.lang-switch a').forEach(function (link) {
  var base = link.getAttribute('href');
  link.addEventListener('click', function () {
    link.setAttribute('href', base + location.hash);
  });
});
