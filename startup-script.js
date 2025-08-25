// Main execution
if (require.main === module) {
  const startServer = async () => {
    try {
      await initializeDatabase();
      const app = await createServer();
      const port = process.env.PORT || 8080;
      const host = process.env.HOST || "0.0.0.0";
      
      app.listen(port, host, () => {
        console.log("🚀 TeleCheck Healthcare Platform running on port " + port);
        console.log("📱 Frontend: http://" + host + ":" + port);
        console.log("🔧 API: http://" + host + ":" + port + "/api");
        console.log("🏥 Health Check: http://" + host + ":" + port + "/api/health");
      });
      
      // Graceful shutdown
      process.on("SIGTERM", () => {
        console.log("🛑 Received SIGTERM, shutting down gracefully");
        process.exit(0);
      });
      
      process.on("SIGINT", () => {
        console.log("🛑 Received SIGINT, shutting down gracefully");
        process.exit(0);
      });
      
    } catch (error) {
      console.error("❌ Failed to start server:", error);
      process.exit(1);
    }
  };
  
  startServer();
}
