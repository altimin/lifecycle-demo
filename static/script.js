var features = [
  { name: "unload", default: false, handler: registerUnload },
  { name: "beforeunload", default: false, handler: registerBeforeUnload },
  { name: "pagehide", default: true, handler: registerPageHide },
  { name: "pageshow", default: true, handler: registerPageShow },
  { name: "visibilitychange", default: true, handler: registerVisibilityChange },
  { name: "freeze", default: true, handler: registerFreeze },
  { name: "resume", default: true, handler: registerResume },
  { name: "short_timer", default: false, handler: startShortTimer },
  { name: "long_timer", default: false, handler: startLongTimer },
  { name: "short_fetch", default: false, handler: startPeriodicShortFetch },
  { name: "long_fetch", default: false, handler: startPeriodicLongFetch },
  { name: "dedicated_worker", default: false, handler: startDedicatedWorker },
  { name: "service_worker", default: false },
  { name: "post_message_to_self", default: false },
  { name: "post_message_from_dedicated_worker", default: false }, 
  { name: "post_message_from_service_worker", default: false }, 
  { name: "broadcast_channel", default: false },
  { name: "meta_cache_control_no_store", default: false },
  { name: "cache_control_no_store_image", default: false, handler: addCacheControlNoStoreImage },
  { name: "cache_control_no_cache_image", default: false, handler: addCacheControlNoCacheImage },
  { name: "cache_control_no_store_subframe", default: false, handler: addCacheControlNoStoreSubframe },
  { name: "cache_control_no_cache_subframe", default: false, handler: addCacheControlNoCacheSubframe },
  { name: "persistent_logs", default: false, handler: enablePersistentLogs },
]

var eventsQueue = [];

var urlParams = new URLSearchParams(window.location.search);
var persistentLogs = false;

function isFeatureInDefaultState(feature) {
  return !urlParams.has(feature.name);
}

function featureEnabled(feature) {
  if (urlParams.has(feature.name))
    return urlParams.get(feature.name) == true
  return feature.default;
}

function featureState(feature) {
  if (feature.handler === undefined)
    return "not implemented";
  if (!isFeatureInDefaultState(feature)) {
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

function getLinkToSetFeatureState(feature, state) {
  url = new URL(window.location);
  params = new URLSearchParams(url.search);
  if (state == undefined) {
    params.delete(feature.name);
  } else {
    params.set(feature.name, state);
  }
  url.search = params;
  return url;
}

// Initialise the feature list.
for (feature of features) {
  featureListElement = document.getElementById(isFeatureInDefaultState(feature) ? "default_feature_list" : "manually_set_feature_list");
  var node = document.createElement("li");
  html = feature["name"] + ": <b>" + featureState(feature) + "</b>";
  if (!featureEnabled(feature) || isFeatureInDefaultState(feature))
    html += " [<a href='" + getLinkToSetFeatureState(feature, 1) + "'>enable</a>]";
  if (featureEnabled(feature) || isFeatureInDefaultState(feature))
    html += " [<a href='" + getLinkToSetFeatureState(feature, 0) + "'>disable</a>]";
  if (!isFeatureInDefaultState(feature))
    html += " [<a href='" + getLinkToSetFeatureState(feature, undefined) + "'>clear</a>]";
  node.innerHTML = html; 
  featureListElement.append(node);
}

// Run handlers for enabled features.
for (feature of features) {
  if (featureEnabled(feature)) {
    feature.handler();
  }
}

function appendToProgressBar(bar, time) {
  console.log(bar, time);
  var barElement = document.getElementById(bar);
  var type = time < 700 ? "fast" : ((time > 700 && time < 2000) ? "slow" :
    "stopped");
  barElement.innerHTML += "<div class='" + type + "' style='width:" + Math.round(
    time * 5 / 1000) + "px'/>";
}

function appendEvent(name) {
  var logs = document.getElementById("eventLogs");
  var message = "event: " + name + " at " + new Date();
  logs.innerHTML += message + "<br/>";
  console.log(message);
  if (persistentLogs) {
    var log = JSON.parse(localStorage.getItem("logs")) || [];
    log.push(message);
    window.localStorage.setItem("logs", JSON.stringify(log)); 
  }
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

function addCacheControlNoStoreMetaTag() {
}

function addCacheControlNoStoreImage() {
  var image = document.createElement("img");
  image.src = "image-no-store.png";
  image.width = "100";
  image.height = "100";
  var src = document.getElementById("subresources");
  src.appendChild(image);
}

function addCacheControlNoCacheImage() {
  var image = document.createElement("img");
  image.src = "image-no-cache.png";
  image.width = "100";
  image.height = "100";
  var src = document.getElementById("subresources");
  src.appendChild(image);
}

function addCacheControlNoStoreSubframe() {
}

function addCacheControlNoCacheSubframe() {
}

var lastShortTimer = Date.now();
function startShortTimer() {
  document.getElementById("timerBarBox").style.display = "block";
  setInterval(() => {
    var now = Date.now();
    appendToProgressBar("timerBar", now - lastShortTimer);
    lastShortTimer = now;
  }, 200);
}

var lastLongTimer = Date.now();
function startLongTimer() {
  setInterval(() => {
    var now = Date.now();
    appendEvent("periodic timer with 15 second interval fired, time since previous: " + (now - lastLongTimer));
    lastLongTimer = now;
  }, 15 * 1000);
}

function refreshPersistentLogs() {
  var messages = JSON.parse(localStorage.getItem("logs")) || [];
  var logs = document.getElementById("eventLogs");
  logs.innerHTML = "";
  for (message of messages) {
    logs.innerHTML += "Archived " + message + "<br/>";
  }
}

function enablePersistentLogs() {
  document.getElementById("refreshLogsButton").style.display = "block";
  persistentLogs = true;
  refreshPersistentLogs();
}

function clearLogs() {
  document.getElementById("eventLogs").innerHTML = "";
  localStorage.setItem("logs", "[]");
}

var lastShortFetch = Date.now();
function startPeriodicShortFetch() {
  document.getElementById("loadingFetchBarBox").style.display = "block";
  function doFetch() {
    var request = new Request('/delay=200/foo.txt');

    fetch(request, {
      "cache": "no-cache",
    }).then(response => {
      var now = Date.now();
      appendToProgressBar("loadingFetchBar", now - lastShortFetch);
      lastShortFetch = now;
      doFetch();
    }).catch(error => { 
      appendEvent("Short fetch failed");
    });
  }

  doFetch();
}

var lastLongFetch = Date.now();
function startPeriodicLongFetch() {
  function doFetch() {
    var request = new Request('/delay=15000/foo.txt');

    fetch(request, {
      "cache": "no-cache",
    }).then(response => {
      var now = Date.now();
      appendEvent("periodic fetch with 15 second interval fired, time since previous: " + (now - lastLongFetch));
      lastLongFetch = now;
      doFetch();
    }).catch(error => { 
      appendEvent("Long fetch failed");
    });
  }

  doFetch();
}

function startDedicatedWorker() {
  worker = new Worker("worker.js");
}
