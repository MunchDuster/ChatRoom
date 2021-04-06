window.onerror = function (message, source, lineno, colno, error) {
  alert(
    "Error: " +
      error +
      " :: " +
      message +
      ". at " +
      source +
      ", line " +
      lineno +
      ", col " +
      colno
  );
};
