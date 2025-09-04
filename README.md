# Mistake Tracker

A simple Obsidian plugin to track mistakes and failures directly in your status bar. Set date flags to track progress from specific points in time.

## Features

- **Status bar display**: Shows mistake count directly in Obsidian's status bar
- **Flag system**: Create date flags to track mistakes from specific points in time
- **Cumulative tracking**: View total mistakes or mistakes since any flag date
- **Flexible display**: Choose between detailed display with dates or clean number-only display

## Installation

### From Obsidian Community Plugins
1. Open Obsidian Settings
2. Go to Community Plugins
3. Browse and search for "Mistake Tracker"
4. Click Install
5. Enable the plugin

### Manual Installation
1. Download the latest release from GitHub
2. Extract files to `VaultFolder/.obsidian/plugins/mistake-tracker/`
3. Reload Obsidian
4. Enable the plugin in Settings > Community Plugins

## Usage

### Commands
Access these commands through the Command Palette (Ctrl/Cmd + P):

- **Add mistake**: Increments mistake count
- **Set new flag date**: Creates a new date flag to track mistakes from

### Settings
Open Settings > Mistake Tracker to configure:

- **Display mode**: Choose between showing dates or clean display
- **Display from index**: Select which flag to display mistakes from
- **Delete flag**: Remove unwanted date flags

### Example Workflow
1. Start tracking mistakes (plugin creates initial flag automatically)
2. Use "Add mistake" command when you make errors
3. Create new flags when you want fresh tracking periods
4. Switch between flags to see different time periods
5. Delete old flags you no longer need

## Display Options

**Since-date mode**: `Mistakes: 5 (since 2024-09-05)`  
**Clean mode**: `Mistakes: 5`

## Notes

- The first flag (index 0) represents your total mistake count
- New mistakes increment all existing flags cumulatively
- You cannot delete the default total flag
- Date flags prevent duplicates for the same day

## Support

Report issues or request features on the [GitHub repository](https://github.com/daniel-3063/mistake-tracker).
