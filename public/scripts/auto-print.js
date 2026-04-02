window.onload = function() {
  window.print();
  if (window.location.search.indexOf('auto=true') !== -1) {
    setTimeout(function() { window.close(); }, 500);
  }
};
