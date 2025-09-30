import express, { Application } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import swaggerUi from 'swagger-ui-express'
import { env } from './env'
import swaggerSpec from './swagger'

export function createApp(): Application {
    const app = express()

    app.use(helmet())
    app.use(cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }))

    app.use(morgan("dev"))

    app.use(
        rateLimit({
            windowMs: 15 * 60 * 1000, // 15 menit
            max: 100, // max request per IP
            standardHeaders: true,
            legacyHeaders: false,
        })
    )

    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

    app.get("/health", (_req, res) => {
        res.json({ status: "ok", env: env.NODE_ENV })
    })

    return app
}