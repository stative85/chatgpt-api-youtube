#!/usr/bin/env node
import { Command } from 'commander';
import { execa } from 'execa';
import ora from 'ora';

const program = new Command();

program
  .name('neuro')
  .description('Neuro-Engine BuilderOps CLI for websim.ai experiments')
  .version('0.1.0');

program
  .command('dev')
  .description('Run all dev servers via Turborepo')
  .action(async () => {
    const spinner = ora('Launching dev servers').start();
    try {
      await execa('pnpm', ['run', 'dev'], { stdio: 'inherit' });
      spinner.succeed('Dev servers exited');
    } catch (error) {
      spinner.fail('Failed to launch dev servers');
      throw error;
    }
  });

program
  .command('test')
  .description('Execute the workspace test suite')
  .action(async () => {
    const spinner = ora('Running tests').start();
    try {
      await execa('pnpm', ['run', 'test'], { stdio: 'inherit' });
      spinner.succeed('Tests completed');
    } catch (error) {
      spinner.fail('Tests failed');
      throw error;
    }
  });

program
  .command('deploy')
  .description('Trigger the GitHub deploy workflow')
  .option('-b, --branch <branch>', 'Branch to deploy', 'main')
  .action(async ({ branch }) => {
    const spinner = ora(`Triggering deploy workflow for ${branch}`).start();
    try {
      await execa('gh', ['workflow', 'run', 'deploy.yml', '--ref', branch], { stdio: 'inherit' });
      spinner.succeed('Deploy workflow requested');
    } catch (error) {
      spinner.fail('Failed to trigger deploy workflow');
      throw error;
    }
  });

program
  .command('seed')
  .description('Seed the database with starter prompts and personas')
  .option('--dry-run', 'Print actions without executing', false)
  .action(async ({ dryRun }) => {
    const spinner = ora('Seeding database').start();
    try {
      if (dryRun) {
        console.log('Would seed database with:\n- Default personas\n- Prompt blueprints from @neuro-engine/promptforge');
      } else {
        await execa('pnpm', ['exec', 'ts-node', 'scripts/seed.ts'], { stdio: 'inherit' });
      }
      spinner.succeed('Seed routine complete');
    } catch (error) {
      spinner.fail('Seed routine failed');
      throw error;
    }
  });

program.parseAsync();
