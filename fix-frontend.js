// Serve frontend static files
app.use(express.static(path.join(__dirname, "../dist/spa")));

// Serve frontend for all non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/spa/index.html"));
});
