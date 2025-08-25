// Serve frontend static files
app.use(express.static(path.join(__dirname, "../dist/spa")));
