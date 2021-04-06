window.onerror = function (message, source, lineno, colno, error) {
  alert(
    "Error: " +
      JSON.stringify(error) +
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
