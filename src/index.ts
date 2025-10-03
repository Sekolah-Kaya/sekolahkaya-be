import { PrismaClient } from '@prisma/client'
import { createApp, loadConfig } from './app'
import { ExtendedDIContainer } from './infrastructure/di/ExtendedDIContainer'
import Redis from 'ioredis'
import { ISessionService } from './application/services/SessionService'

export async function startServer(): Promise<void> {
    try {
        const config = loadConfig()
        const container = ExtendedDIContainer.bootstrap()
        const prisma = container.get<PrismaClient>('PrismaClient')
        await prisma.$connect()
        console.log('✅ Database connected')

        const app = createApp(container, config)

        const server = app.listen(config.port, () => {
            console.log(`
╔═════════════════════════════════════════════════════════════════════════╗
║                                                                         ║
║   🚀 LMS Platform API Server                                            ║
║                                                                         ║
║   Environment: ${config.nodeEnv.padEnd(44)}             ║
║   Port:        ${config.port.toString().padEnd(44)}             ║
║   Status:      RUNNING                                                  ║
║                                                                         ║
║   Health:      http://localhost:${config.port}/health${' '.repeat(18)}           ║
║   API Docs:    http://localhost:${config.port}/api-docs${' '.repeat(15)}            ║
║                                                                         ║
╚═════════════════════════════════════════════════════════════════════════╝
            `)
        })

        const gracefulShutdown = async (signal: string) => {
            console.log(`\n⚠️  ${signal} received. Starting graceful shutdown...`);

            server.close(async () => {
                console.log('🔌 HTTP server closed');

                try {
                    await prisma.$disconnect()
                    console.log('🔌 Database disconnected');

                    const redis = container.get<Redis>('Redis');
                    await redis.quit();
                    console.log('🔌 Redis disconnected');

                    console.log('✅ Graceful shutdown completed');
                    process.exit(0);
                } catch (error) {
                    console.error('❌ Error during shutdown:', error);
                    process.exit(1);
                }
            })

            setTimeout(() => {
                console.error('⚠️  Forcing shutdown after timeout');
                process.exit(1);
            }, 10000)
        }

        process.on("SIGINT", () => gracefulShutdown('SIGINT'))
        process.on("SIGTERM", () => gracefulShutdown('SIGTERM'));

        setInterval(async () => {
            try {
                const sessionService = container.get<ISessionService>('ISessionService')
                const cleaned = await sessionService.cleanupExpiredSessions()
                console.log(`🧹 Cleaned up ${cleaned} expired sessions`);
            } catch (error) {
                console.error('❌ Session cleanup error:', error)
            }
        }, 3600000)
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);

    }
}

startServer().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

export default { createApp, startServer };