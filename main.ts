import {App, Notice, Plugin, PluginSettingTab, Setting} from 'obsidian';
import { moment } from 'obsidian';


interface MistakeEntry {
	count:number; // number of mistakes for this given entry
	startDate:string; // start for given period
}


interface MistakeTrackerData {
	// Settings data
	displayMode: "since-date" | "clean";
	displayFromIndex: number;

	// Mistake data
	mistakeHistory: MistakeEntry[];
}

const DEFAULT_DATA: MistakeTrackerData = {
	displayMode: 'since-date',
	displayFromIndex: 0,
	mistakeHistory: [{
		startDate: moment().format('YYYY-MM-DD'),
		count: 0
	}]
}

export default class MistakeTrackerPlugin extends Plugin {
	data: MistakeTrackerData;
	private statusBarItem: HTMLElement;

	updateStatusBar() {
		// Handle empty array case
		if (this.data.mistakeHistory.length === 0) {
			this.statusBarItem.setText('No flags set');
			return;
		}

		const entry = this.data.mistakeHistory[this.data.displayFromIndex];
		let display = '';
		if (this.data.displayMode === 'since-date') {
			display = `Mistakes: ${entry.count} (since ${entry.startDate})`;
		} else if (this.data.displayMode === 'clean') {
			display = `Mistakes: ${entry.count}`;
		}
		this.statusBarItem.setText(display);
	}

	increaseMistakes() {
		// cumulatively increment mistake count for all periods
		for (let i = 0; i < this.data.mistakeHistory.length; i++) {
			this.data.mistakeHistory[i].count++;
		}
	}

	setNewFlag(){
		// create new flag if possible
		if(this.data.mistakeHistory.length < 1){
			this.data.mistakeHistory.push({
				startDate: moment().format('YYYY-MM-DD'),
				count: 0
			});
			this.saveData();
		} else if(this.data.mistakeHistory[this.data.mistakeHistory.length-1].startDate == moment().format('YYYY-MM-DD')) {
			new Notice ("No duplicate flags allowed!");
		} else {
			new Notice ("flag created successfully");
			this.data.mistakeHistory.push({
				startDate: moment().format('YYYY-MM-DD'),
				count: 0
			});
			this.saveData();
		}
	}

	deleteFlag(indexToDelete: number) {
		// Can't delete if no flags exist
		if (this.data.mistakeHistory.length === 0) {
			return;
		}

		// Remove the flag at the specified index
		this.data.mistakeHistory.splice(indexToDelete, 1);

		// Fix displayFromIndex if needed
		if (this.data.displayFromIndex === indexToDelete) {
			// If we deleted the displayed flag, show index 0 (or first available)
			this.data.displayFromIndex = 0;
		} else if (this.data.displayFromIndex > indexToDelete) {
			// If we deleted a flag before the displayed one, shift down
			this.data.displayFromIndex--;
		}

		// If no flags left, reset to 0
		if (this.data.mistakeHistory.length === 0) {
			this.data.displayFromIndex = 0;
		}

		this.saveData();
		this.updateStatusBar();
	}

	async onload() {
		this.addSettingTab(new MistakeSettingTab(this.app, this));
		await this.loadData();
		this.statusBarItem = this.addStatusBarItem();
		this.updateStatusBar();

		this.addCommand({
			id: 'add-mistake',
			name: 'Add mistake',
			callback: () => {
				this.increaseMistakes();
				this.updateStatusBar();
				this.saveData();
			}
		});

		this.addCommand({
			id:"set-flag",
			name: "set new flag date",
			callback: () => {
				this.setNewFlag();
				this.updateStatusBar();
			}
		})
	}

	async loadData() {
		this.data = Object.assign({}, DEFAULT_DATA, await super.loadData());
	}

	async saveData() {
		await super.saveData(this.data);
	}

	async onunload() {
		await this.saveData();
	}

}

class MistakeSettingTab extends PluginSettingTab {
	plugin: MistakeTrackerPlugin;

	constructor(app: App, plugin: MistakeTrackerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Display mode')
			.setDesc('Display from a specific date i.e 9 mistakes since 1967-06-07 OR display without the date')
			.addDropdown(dropdown => dropdown
				.addOption('since-date', 'Show date')
				.addOption('clean', 'Clean display')
				.setValue(this.plugin.data.displayMode)
				.onChange(async (value) => {
					this.plugin.data.displayMode = value as 'since-date' | 'clean';
					await this.plugin.saveData();
					this.plugin.updateStatusBar();
				}));

		new Setting(containerEl)
			.setName('Display from index')
			.setDesc('Which flag to display mistakes from (0 = total, 1 = first flag, etc.)')
			.addDropdown(dropdown => {
				// Handle empty history
				if (this.plugin.data.mistakeHistory.length === 0) {
					dropdown.addOption('0', 'No flags available');
					dropdown.setDisabled(true);
					return;
				}

				// Add options for each flag
				this.plugin.data.mistakeHistory.forEach((entry, index) => {
					let label;

					if (index === 0) {
						label = `${index}: Total (${entry.startDate})`;
					} else {
						label = `${index}: ${entry.startDate}`;
					}

					dropdown.addOption(index.toString(), label);
				});

				dropdown.setValue(this.plugin.data.displayFromIndex.toString())
					.onChange(async (value) => {
						this.plugin.data.displayFromIndex = parseInt(value);
						await this.plugin.saveData();
						this.plugin.updateStatusBar();
					});
			});


		new Setting(containerEl)
			.setName('Delete this flag')
			.addDropdown(dropdown => {
				// Handle empty history
				if (this.plugin.data.mistakeHistory.length === 0) {
					dropdown.addOption('0', 'No flags available');
					dropdown.setDisabled(true);
					return;
				}

				// Add options for each flag
				this.plugin.data.mistakeHistory.forEach((entry, index) => {
					let label;

					if (index === 0) {
						label = `${index}: Total (${entry.startDate})`;
					} else {
						label = `${index}: ${entry.startDate}`;
					}

					dropdown.addOption(index.toString(), label);
				});

				dropdown.setValue("0");
			})
			.addButton(button => {
				button.setButtonText("Delete");
				button.onClick(()=>{
					const dropdown = button.buttonEl.parentElement?.querySelector('select') as HTMLSelectElement;
					const selectedIndex = parseInt(dropdown.value);

					if(selectedIndex === 0){
						new Notice ("You cannot delete the default flag!");
					} else {
						this.plugin.deleteFlag(selectedIndex);
						this.display();
						new Notice ("Flag deletion successful!")
					}

				})
			})
		;
	}
}
