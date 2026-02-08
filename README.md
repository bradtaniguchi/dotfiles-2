# dotfiles-2

New repo to create new standardized development, based around modernized tooling and AI development.

- native TS note CLI setup and installer scripts
- helix instead of neovim
- simplified and new theme of tmux
- zoxide alias support
- fzf alias support

Targets exclusively bash for simplicity

## Main goals

This purpose of this "new" version is mainly to simplify and improve my terminal workflow around some more modern tooling, specifically helix, which I've found to be **vastly** more user friendly and just as capable as neovim

## Environment pre-reqs

Use the following to verify the environment:
```bash
dotfiles verify        # Verify all tools
```

## Backing up

Before installing or syncing, you can backup your current configuration files:

```bash
dotfiles backup         # Backup all configurations
```

Note: `.git` directories are automatically excluded from backups.

## Syncing

Sync configuration files from your system to the repo:

```bash
dotfiles sync              # Sync all configurations
# Dry run mode - see what would be synced without making changes
dotfiles sync --dryrun     # Preview all sync operations
dotfiles sync bashrc -d    # Preview bashrc sync only
```

## Installing

Install configuration files from your repo to the system:

```bash
dotfiles install              # Install all configurations (with verification)
# Dry run mode - see what would be installed without making changes
dotfiles install --dryrun     # Preview all install operations
dotfiles install --force      # Force overwrite existing files
dotfiles install --no-verify  # Skip verification after installation
dotfiles install bashrc -d    # Preview bashrc install only
```

