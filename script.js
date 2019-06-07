var eventsQueue = [];

function appendToProgressBar(bar, time) {
  var barElement = document.getElementById(bar);
  var type = time < 700 ? "fast" : ((time > 700 && time < 2000) ? "slow" :
    "stopped");
  barElement.innerHTML += "<div class='" + type + "' style='width:" + Math.round(
    time * 5 / 1000) + "px'/>";
}

function appendEvent(name) {
  var logs = document.getElementById("eventLogs");
  logs.innerHTML += "Page was " + name + " at " + new Date() + "<br/>";
}

var lastInterval = Date.now();
var lastFetch = Date.now();

function periodicTimer() {
  var now = Date.now();
  appendToProgressBar("timerBar", now - lastInterval);
  lastInterval = now;
}

function load() {
  var myRequest = new Request('foo.txt');

  fetch(myRequest)
    .then(function(response) {
      return response.text()
    })
    .then(function(text) {
      var fnow = Date.now();
      appendToProgressBar("loadingBar", fnow - lastFetch);
      lastFetch = fnow;
      // wait 1s
      var begin = window.performance.now();
      while (window.performance.now() < begin + 200);
      load();
    });
}

var urlParams = new URLSearchParams(window.location.search);

if (urlParams.has("worker")) {
  // This worker sleeps and sends postMessages in a loop.
  post_message_worker = new Worker("worker_post_message.js");
}

if (urlParams.has("timer")) {
  setInterval(periodicTimer, 200);
}

if (urlParams.has("load")) {
  load();
}

if (urlParams.has("beforeunload")) {
  window.addEventListener("beforeunload", () => {
    appendEvent("beforeunload");
    return urlParams.has("beforeunload_disallow");
  });
}

if (urlParams.has("unload")) {
  window.addEventListener("unload", () => {
    appendEvent("unload");
  });
}

if (urlParams.has("pagehide")) {
  window.addEventListener("pagehide", () => {
    appendEvent("pagehide");
    return false;
  });
}

if (urlParams.has("pageshow")) {
  window.addEventListener("pageshow", () => {
    appendEvent("pageshow");
  });
}

document.onmessage = function(event) {
  appendToProgressBar(event.data, Date.now());
}

document.onvisibilitychange = function() {
  if (document.hidden)
    appendEvent("Hidden");
  else
    appendEvent("Shown");
};

document.onfreeze = function() {
  appendEvent("Frozen");
};

document.onresume = function() {
  appendEvent("Resumed");
};
