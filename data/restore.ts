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
    // Get backup directory from command line argument
    const backupDir = process.argv[2]
    if (!backupDir) {
      console.log('Usage: npx tsx data/restore.ts <backup-directory>')
      process.exit(1)
    }

    const fullBackupPath = path.resolve(__dirname, 'backups', backupDir)
    
    // Check if backup directory exists
    try {
      await fs.access(fullBackupPath)
    } catch {
      console.error(`Backup directory not found: ${fullBackupPath}`)
      process.exit(1)
    }

    // Read backup info
    const infoPath = path.join(fullBackupPath, 'backup-info.json')
    const info = JSON.parse(await fs.readFile(infoPath, 'utf8'))
    console.log('Restoring backup from:', info.timestamp)

    // Get database URL from environment
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set')
    }

    // Parse database URL
    const url = new URL(databaseUrl)
    const dbName = url.pathname.slice(1)
    const host = url.hostname
    const port = url.port
    const username = url.username
    const password = url.password

    // Restore schema first
    console.log('Restoring schema...')
    const schemaPath = path.join(fullBackupPath, 'schema.prisma')
    const targetSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma')
    await fs.copyFile(schemaPath, targetSchemaPath)

    // Restore database
    console.log('Restoring database...')
    const dumpFile = path.join(fullBackupPath, 'database.sql')
    const psqlCmd = `PGPASSWORD=${password} psql -h ${host} -p ${port} -U ${username} -d ${dbName} -f ${dumpFile}`
    await execCommand(psqlCmd)

    console.log('Restore completed successfully')
    console.log('Running prisma generate to update client...')
    await execCommand('npx prisma generate')
    
    console.log('All done! Database and schema have been restored.')
  } catch (error) {
    console.error('Restore failed:', error)
    process.exit(1)
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  }) 