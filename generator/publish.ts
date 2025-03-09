import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import glob from 'glob';
import pino from 'pino';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const execPromise = promisify(exec);
const globPromise = promisify(glob);

// Initialize pino logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
});

interface PublishOptions {
  platform: string | string[];
  extension?: string | string[];
  dryRun: boolean;
  vscePath: string;
  accessToken?: string;
}

async function publishExtension(extensionPath: string, options: PublishOptions): Promise<void> {
  try {
    const packageJsonPath = path.join(extensionPath, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      logger.warn({ path: extensionPath }, 'No package.json found, skipping');
      return;
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const { name, version } = packageJson;
    
    logger.info({ extension: name, version, path: extensionPath }, 'Publishing extension');
    
    // Build the command
    let command = `${options.vscePath} publish`;
    
    if (options.dryRun) {
      command += ' --dry-run';
    }
    
    if (options.accessToken) {
      command += ` --pat ${options.accessToken}`;
    }
    
    // Execute in the extension directory
    if (options.dryRun) {
      logger.info({ command, cwd: extensionPath }, 'Would execute (dry run)');
    } else {
      const { stdout, stderr } = await execPromise(command, { cwd: extensionPath });
      
      if (stderr) {
        logger.warn({ stderr }, 'Warnings during publish');
      }
      
      logger.info({ stdout }, 'Publish output');
    }
    
    logger.info({ extension: name }, 'Extension published successfully');
  } catch (error) {
    logger.error({ error, path: extensionPath }, 'Failed to publish extension');
    throw error;
  }
}

async function findExtensionPaths(platform: string, extensionFilter?: string | string[]): Promise<string[]> {
  const basePath = path.join(__dirname, '..', '..', `${platform}-extensions`);
  
  if (!fs.existsSync(basePath)) {
    throw new Error(`Platform directory not found: ${basePath}`);
  }
  
  if (extensionFilter) {
    const filters = Array.isArray(extensionFilter) ? extensionFilter : [extensionFilter];
    const extensionPaths: string[] = [];
    
    for (const filter of filters) {
      const pattern = `itmcdev-${filter}*`;
      const matches = await globPromise(path.join(basePath, pattern));
      extensionPaths.push(...matches);
    }
    
    return extensionPaths;
  } else {
    // Get all extension directories
    return await globPromise(path.join(basePath, 'itmcdev-*'));
  }
}

async function main(): Promise<void> {
  const argv = await yargs(hideBin(process.argv))
    .option('platform', {
      alias: 'p',
      description: 'Platform to publish extensions for (vscode or vscodium)',
      type: 'array',
      default: ['vscode']
    })
    .option('extension', {
      alias: 'e',
      description: 'Specific extension(s) to publish (without itmcdev- prefix)',
      type: 'array'
    })
    .option('dry-run', {
      alias: 'd',
      description: 'Perform a dry-run without actually publishing',
      type: 'boolean',
      default: false
    })
    .option('vsce-path', {
      description: 'Path to the vsce executable',
      type: 'string',
      default: 'vsce'
    })
    .option('access-token', {
      alias: 't',
      description: 'Personal access token for publishing',
      type: 'string'
    })
    .help()
    .argv;
  
  const options: PublishOptions = {
    platform: argv.platform,
    extension: argv.extension,
    dryRun: argv.dryRun,
    vscePath: argv.vscePath,
    accessToken: argv.accessToken
  };
  
  logger.info({ options: { ...options, accessToken: options.accessToken ? '***' : undefined } }, 'Starting publish process');
  
  const platforms = Array.isArray(options.platform) ? options.platform : [options.platform];
  
  // Process each platform
  for (const platform of platforms) {
    try {
      logger.info({ platform }, `Publishing extensions for ${platform}`);
      
      // Find extension paths based on filters
      const extensionPaths = await findExtensionPaths(platform, options.extension);
      
      if (extensionPaths.length === 0) {
        logger.warn({ platform, extensionFilter: options.extension }, 'No matching extensions found');
        continue;
      }
      
      logger.info({ count: extensionPaths.length }, `Found ${extensionPaths.length} extensions to publish`);
      
      // Publish each extension
      for (const extensionPath of extensionPaths) {
        try {
          await publishExtension(extensionPath, options);
        } catch (error) {
          // Continue with other extensions even if one fails
          logger.error({ error, path: extensionPath }, 'Failed to publish extension, continuing with others');
        }
      }
      
      logger.info({ platform }, `Completed publishing for ${platform}`);
    } catch (error) {
      logger.error({ error, platform }, `Error processing platform ${platform}`);
    }
  }
  
  logger.info('Publish process completed');
}

// Execute main function
main().catch(error => {
  logger.fatal({ error }, 'Fatal error during publish process');
  process.exit(1);
});
