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
dotfiles backup all     # Backup all configurations (explicit)
dotfiles backup helix   # Backup only Helix config (alias: hx)
dotfiles backup tmux    # Backup only tmux config
dotfiles backup bashrc  # Backup only bashrc
```

This creates a dated backup folder at `backups/YYYY-MM-DD/` containing:
- `~/.bashrc`
- `~/.config/helix/` (entire directory)
- `~/.config/tmux/tmux.conf` (config file only)

Note: `.git` directories are automatically excluded from backups.

## Syncing

Sync configuration files from your system to the repo:

```bash
dotfiles sync              # Sync all configurations
dotfiles sync all          # Sync all configurations (explicit)
dotfiles sync helix        # Sync only Helix config (alias: hx)
dotfiles sync tmux         # Sync only tmux config
dotfiles sync bashrc       # Sync only bashrc

# Dry run mode - see what would be synced without making changes
dotfiles sync --dryrun     # Preview all sync operations
dotfiles sync bashrc -d    # Preview bashrc sync only
```

This copies configuration files from your system to the `configs/` directory:
- `~/.config/helix/` → `configs/helix/` (entire directory)
- `~/.config/tmux/tmux.conf` → `configs/tmux/tmux.conf` (config file only)
- `~/.bashrc` → `configs/bashrc`

## Installing

```bash
dotfiles install
```
