function measureTime() {
    // WebKit doesn't have timeOrigin and workers have a different time base,
    // so we need to fall back on Date.now() to get timestamps we can compare.
    return "timeOrigin" in performance ?
        performance.timeOrigin + performance.now() :
        Date.now();
}
