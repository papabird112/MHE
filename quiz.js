// Self-check quiz engine. Each page supplies window.QUIZ = { text, questions }.
// Questions are answered one at a time and marked immediately, because the point
// is review rather than examination.

(function () {
  var data = window.QUIZ;
  var root = document.getElementById('quiz');
  if (!data || !root) return;

  var t = data.text;
  var qs = data.questions;
  var KEYS = 'ABCD';
  var picked = [];          // null = unanswered, -1 = revealed, 0..3 = chosen
  var i;
  for (i = 0; i < qs.length; i++) picked.push(null);

  root.innerHTML = '';

  var status = document.createElement('div');
  status.className = 'quiz-status';
  status.innerHTML =
    '<span>' + t.answered + ' <b id="qDone">0</b> / ' + qs.length + '</span>' +
    '<span>' + t.correctCount + ' <b id="qRight">0</b></span>' +
    '<span class="quiz-meter"><i id="qMeter"></i></span>';
  root.appendChild(status);

  var list = document.createElement('div');
  list.className = 'quiz-list';
  root.appendChild(list);

  qs.forEach(function (q, n) {
    var opts = q.opts.map(function (o, j) {
      return '<li><label class="quiz-opt" data-n="' + n + '" data-j="' + j + '">' +
             '<input type="radio" name="q' + n + '" value="' + j + '">' +
             '<span class="k">' + KEYS[j] + '.</span>' +
             '<span class="tx">' + o + '</span>' +
             '<span class="quiz-mark"></span></label></li>';
    }).join('');

    var card = document.createElement('section');
    card.className = 'quiz-item';
    card.id = 'q' + (n + 1);
    card.innerHTML =
      '<div class="quiz-head">' +
        '<span class="quiz-no">' + (n + 1) + '.</span>' +
        '<span class="quiz-q">' + q.q + '</span>' +
        '<a class="quiz-ref" href="' + q.href + '">' + t.section + ' ' + q.ref + '</a>' +
      '</div>' +
      '<ul class="quiz-opts">' + opts + '</ul>' +
      '<div class="quiz-why" hidden></div>';
    list.appendChild(card);
  });

  var actions = document.createElement('div');
  actions.className = 'quiz-actions';
  actions.innerHTML =
    '<button type="button" class="quiz-btn" id="qRevealAll">' + t.revealAll + '</button>' +
    '<button type="button" class="quiz-btn primary" id="qReset">' + t.reset + '</button>';
  root.appendChild(actions);

  var result = document.createElement('div');
  result.className = 'quiz-result';
  result.hidden = true;
  root.appendChild(result);

  var done = document.getElementById('qDone');
  var right = document.getElementById('qRight');
  var meter = document.getElementById('qMeter');

  function card(n) { return document.getElementById('q' + (n + 1)); }

  function lock(n, choice) {
    var q = qs[n];
    var el = card(n);
    var labels = el.querySelectorAll('.quiz-opt');

    el.classList.add('locked');
    el.classList.add(choice === -1 ? 'is-shown' : (choice === q.a ? 'is-correct' : 'is-wrong'));

    labels[q.a].classList.add('correct');
    labels[q.a].querySelector('.quiz-mark').textContent = t.markCorrect;
    if (choice > -1 && choice !== q.a) {
      labels[choice].classList.add('wrong');
      labels[choice].querySelector('.quiz-mark').textContent = t.markYours;
    }
    el.querySelectorAll('input').forEach(function (inp) { inp.disabled = true; });
    if (choice > -1) labels[choice].querySelector('input').checked = true;

    var why = el.querySelector('.quiz-why');
    why.innerHTML = '<span class="lab">' + t.whyLabel + '</span>' + q.why +
      ' <a href="' + q.href + '">' + t.readMore.replace('{ref}', q.ref) + '</a>';
    why.hidden = false;
  }

  function update() {
    var nDone = 0, nRight = 0, weak = {};
    picked.forEach(function (p, n) {
      if (p === null) return;
      nDone++;
      if (p === qs[n].a) nRight++;
      else weak[qs[n].ref] = qs[n].href;
    });
    done.textContent = nDone;
    right.textContent = nRight;
    meter.style.width = Math.round((nDone / qs.length) * 100) + '%';

    if (nDone < qs.length) { result.hidden = true; return; }

    var pct = Math.round((nRight / qs.length) * 100);
    var band = pct >= 90 ? t.band90 : pct >= 70 ? t.band70 : pct >= 50 ? t.band50 : t.band0;
    var refs = Object.keys(weak).sort(function (a, b) {
      return parseFloat(a.replace(/[^0-9.]/g, '')) - parseFloat(b.replace(/[^0-9.]/g, ''));
    });
    var links = refs.map(function (r) {
      return '<a href="' + weak[r] + '">' + t.section + ' ' + r + '</a>';
    }).join('');

    result.innerHTML =
      '<h3>' + t.resultTitle + '</h3>' +
      '<p class="quiz-score">' + nRight + ' / ' + qs.length +
        ' <small>(' + pct + '%)</small></p>' +
      '<p>' + band + '</p>' +
      (refs.length ? '<div class="quiz-weak"><b>' + t.revise + '</b><br>' + links + '</div>' : '');
    result.hidden = false;
  }

  list.addEventListener('change', function (e) {
    var inp = e.target;
    if (!inp || inp.type !== 'radio') return;
    var label = inp.parentNode;
    var n = +label.getAttribute('data-n');
    if (picked[n] !== null) return;
    picked[n] = +label.getAttribute('data-j');
    lock(n, picked[n]);
    update();
  });

  document.getElementById('qRevealAll').addEventListener('click', function () {
    picked.forEach(function (p, n) {
      if (p !== null) return;
      picked[n] = -1;
      lock(n, -1);
    });
    update();
  });

  document.getElementById('qReset').addEventListener('click', function () {
    picked = picked.map(function () { return null; });
    list.querySelectorAll('.quiz-item').forEach(function (el) {
      el.className = 'quiz-item';
      el.querySelectorAll('.quiz-opt').forEach(function (l) {
        l.classList.remove('correct', 'wrong');
        l.querySelector('.quiz-mark').textContent = '';
        var inp = l.querySelector('input');
        inp.checked = false;
        inp.disabled = false;
      });
      var why = el.querySelector('.quiz-why');
      why.hidden = true;
      why.innerHTML = '';
    });
    update();
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  update();
})();
