import dotenv from 'dotenv'

dotenv.config()

export const env = {
    BASE_URL: process.env.BACKEND_URL,
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 5000,
    DATABASE_URL: process.env.DATABASE_URL as string,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_ENCRYPTION: process.env.SMTP_ENCRYPTION,
    SMTP_FROM_ADDRESS: process.env.SMTP_FROM_ADDRESS,
    SMTP_FROM_NAME: process.env.SMTP_FROM_NAME,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
}