while (true) {
    start = new Date();
    do {
      now = new Date();
    } while (now - start < 200);

    postMessage("postMessageWorkerBar");

}
