import { createApp } from './config/app'
import { env } from './config/env'
import { prisma } from './infrastructure/database/prisma'

const app = createApp()
const PORT = env.PORT || 5000

app.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📖 Swagger docs available at http://localhost:${PORT}/api-docs`);
})

process.on("SIGINT", async () => {
    console.log("🛑 Shutting down...");
    await prisma.$disconnect();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    console.log("🛑 Shutting down...");
    await prisma.$disconnect();
    process.exit(0);
});
