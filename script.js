var features = [
  { name: "unload", default: false, handler: registerUnload },
  { name: "beforeunload", default: true, handler: registerBeforeUnload },
  { name: "pagehide", default: true, handler: registerPageHide },
  { name: "pageshow", default: true, handler: registerPageShow },
  { name: "visibilitychange", default: true, handler: registerVisibilityChange },
  { name: "freeze", default: true, handler: registerFreeze },
  { name: "resume", default: true, handler: registerResume },
  { name: "setinterval", default: true, handler: startSetInterval },
  { name: "long_settimeout", default: false, handler: startLongSetTimeout },
  { name: "fetch", default: false, handler: startFetch },
  { name: "dedicated_worker", default: false, handler: startDedicatedWorker },
  { name: "service_worker", default: false, handler: startDedicatedWorker },
  { name: "post_message_to_self", default: false, handler: startPostMessageToSelf },
  { name: "post_message_from_dedicated_worker", default: false, handler: startPostMessageFromDedicatedWorker }, 
  { name: "post_message_from_service_worker", default: false, handler: startPostMessageFromDedicatedWorker }, 
  { name: "broadcast_channel", default: false, handler: connectToBroadcastChannel },
]

var eventsQueue = [];

var urlParams = new URLSearchParams(window.location.search);

function featureEnabled(feature) {
  if (urlParams.has(feature.name))
    return urlParams.get(feature.name) == true
  return feature.default;
}

function featureState(feature) {
  if (urlParams.has(feature.name)) {
    if (featureEnabled(feature)) {
      return "enabled";
    } else {
      return "disabled";
    }
  }
  if (feature.default)
    return "enabled (default)";
  return "disabled (default)";
}

// Initialise the feature list.
for (feature of features) {
  var node = document.createElement("li");
  node.appendChild(document.createTextNode(feature["name"] + ": " + featureState(feature)));
  document.getElementById("feature_list").append(node);
}

// Run handlers for enabled features.
for (feature of features) {
  if (featureEnabled(feature))
    feature.handler();
}

function appendToProgressBar(bar, time) {
  var barElement = document.getElementById(bar);
  var type = time < 700 ? "fast" : ((time > 700 && time < 2000) ? "slow" :
    "stopped");
  barElement.innerHTML += "<div class='" + type + "' style='width:" + Math.round(
    time * 5 / 1000) + "px'/>";
}

function appendEvent(name) {
  var logs = document.getElementById("eventLogs");
  var message = "event: " + name + " at " + new Date() + "<br/>";
  logs.innerHTML += message;
  console.log(message);
}

function registerUnload() {
  window.addEventListener("unload", (event) => {
    appendEvent("unload");
  });
}

function registerBeforeUnload() {
  window.addEventListener("beforeunload", (event) => {
    appendEvent("beforeunload");
  });
}

function registerPageHide() {
  window.addEventListener("pagehide", (event) => {
    appendEvent("pagehide, event.persisted="+event.persisted);
  });
}

function registerPageShow() {
  window.addEventListener("pageshow", (event) => {
    appendEvent("pageshow, event.persisted="+event.persisted);
  });
}

function registerFreeze() {
  document.addEventListener("freeze", () => {
    appendEvent("freeze");
  });
}

function registerResume() {
  document.addEventListener("resume", () => {
    appendEvent("resume");
  });
}

function registerVisibilityChange() {
  document.addEventListener("visibilitychange", () => {
    appendEvent("visibilitychange state=" + document.visibilityState);
  });
}

function startSetInterval() {
}

function startFetch() {
}

function startLongSetTimeout() {
}

function startDedicatedWorker() {
}

function startPostMessageToSelf() {
}

function startPostMessageFromDedicatedWorker() {
}

function connectToBroadcastChannel() {
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

document.onmessage = function(event) {
  appendToProgressBar(event.data, Date.now());
}
