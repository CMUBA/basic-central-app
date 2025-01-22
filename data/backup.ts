import { PrismaClient } from '@prisma/client'
import { exec } from 'node:child_process'
import { promises as fs } from 'node:fs'
import path from 'node:path'

const prisma = new PrismaClient()

async function execCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error)
        return
      }
      resolve(stdout)
    })
  })
}

async function main() {
  try {
    // Create backup directory with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupDir = path.join(__dirname, 'backups', timestamp)
    await fs.mkdir(backupDir, { recursive: true })
    
    // Backup schema
    const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma')
    const schemaBackupPath = path.join(backupDir, 'schema.prisma')
    await fs.copyFile(schemaPath, schemaBackupPath)
    
    // Get database URL from environment
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    
    // Parse database URL to get credentials
    const url = new URL(databaseUrl)
    const dbName = url.pathname.slice(1)
    const host = url.hostname
    const port = url.port
    const username = url.username
    const password = url.password
    
    // Create pg_dump command
    const dumpFile = path.join(backupDir, 'database.sql')
    const pgDumpCmd = `PGPASSWORD=${password} pg_dump -h ${host} -p ${port} -U ${username} -F p -f ${dumpFile} ${dbName}`
    
    // Execute backup
    console.log('Starting database backup...')
    await execCommand(pgDumpCmd)
    console.log('Database backup completed')
    
    // Create backup info file
    const info = {
      timestamp,
      databaseUrl: databaseUrl.replace(/:\/\/[^@]+@/, '://****:****@'), // Hide credentials
      schemaVersion: '1.0', // You can update this based on your versioning
    }
    await fs.writeFile(
      path.join(backupDir, 'backup-info.json'),
      JSON.stringify(info, null, 2)
    )
    
    console.log(`Backup completed successfully in directory: ${backupDir}`)
  } catch (error) {
    console.error('Backup failed:', error)
    process.exit(1)
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  }) 