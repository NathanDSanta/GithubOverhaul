import { App, Editor, MarkdownView, Menu, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import https from 'https';

// Remember to rename these classes and interfaces!

interface GithubOverhaulSettings {
	Github_username: string;
}

const DEFAULT_SETTINGS: GithubOverhaulSettings = {
	Github_username: 'username'
}

export default class GithubOverhaul extends Plugin {
	settings: GithubOverhaulSettings;

  // Configure resources needed by the plugin.
	async onload() {
    // console.log("Start loading plugin");

    await this.loadSettings();
    
    this.addCommand({
      id: 'print-greeting-to-console',
      name: 'Print greeting to console',
      callback: () => {
        console.log('Greeting');
      },
    });

    this.addCommand({
      id: 'editor-sample',
      name: 'editor-sample-command',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        const sel = editor.getSelection();

        console.log(`You have selected: ${sel}`);
        
      },
    });

    this.addRibbonIcon('github', 'Open menu', (event) => {
      const menu = new Menu();

      menu.addItem((item) => 
        item
          .setTitle('Sync')
          .setIcon('folder-sync')
          .onClick(() => {
          new Notice('Copied');
        })
      );

      menu.addItem((item) =>
        item
          .setTitle('Paste')
          .setIcon('paste')
          .onClick(() => {
          new Notice('Pasted');
        })
      );

      menu.showAtMouseEvent(event);
    });

    this.registerEvent(
      this.app.workspace.on('file-menu', (menu, file) => {
        menu.addItem((item) => {
          item
            .setTitle('Comment')
            .setIcon('message-square')
            .onClick(async () => {
              let response = await this.getComments("NathanDSanta", "githubTesting", 1);
              console.log("Button getComments", response);
            })
        });

        menu.addItem((item) => {
          item
            .setTitle('getComments')
            .setIcon('arrow-down-to-line')
            .onClick(async () => {
              let response = await this.getComments("NathanDSanta", "githubTesting", 1);
              console.log("Button getComments", response);
            })
        });
      })
    );
    
    this.addSettingTab(new SampleSettingTab(this.app, this));
	}

  // Release any resources configured by the plugin.
	async onunload() {
    // console.log("... ");

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

    async fetchAPI(url: string): Promise<any> {
        try {
            const response = await fetch(url, {
                method: "GET", // or POST, PUT, DELETE, etc.
                headers: {
                    "Content-Type": "application/json",
                    // Add additional headers if needed
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching API:", error);
            return null;
        }
    }

  async request(options: any, postData?: string) : Promise<any>{
    const req = https.request(options, (res: any) => {
      let data = "";

      res.on("data", (chunk: Buffer) => {
        data += chunk;
      });

      res.on("end", () => {
        console.log("POST Response:", JSON.parse(data));
        return JSON.parse(data);
      });

    });

    req.on("error", (error: Error) => {
      console.error("Error:", error);
    });

    if(postData !== undefined){
      req.write(postData);
    }
    req.end();

  };

  async getComments(owner: string, repo: string, issue: number) : Promise<any>{
    const personalAccessToken = "";
    const options = {
      hostname: "api.github.com",
      path: `/repos/${owner}/${repo}/issues/${issue}/comments`,
      method: "GET",
      headers: {
        "Authorization": `token ${personalAccessToken}`,
        "User-Agent": "Node.js"
      },

    }

    return await this.request(options);
  }

  async addComment(comment: string, owner: string, repo: string, issue: number) : Promise<any>{
    const personalAccessToken = "";

    const postData = JSON.stringify({
      body: comment,
    });

    const options = {
      hostname: "api.github.com",
      path: `/repos/${owner}/${repo}/issues/${issue}/comments`,
      method: "POST",
      headers: {
        "Authorization": `token ${personalAccessToken}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
        "User-Agent": "Node.js"
      },


    };

    return await this.request(options,postData);
  }
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: GithubOverhaul;

	constructor(app: App, plugin: GithubOverhaul) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Github Username')
			.setDesc('Your Github username')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.Github_username)
				.onChange(async (value) => {
					this.plugin.settings.Github_username = value;
					await this.plugin.saveSettings();
				}));
	}
}
