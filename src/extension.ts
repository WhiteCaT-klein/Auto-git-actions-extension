import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as child_process from 'child_process';
 
let gitInterval: NodeJS.Timer | undefined;
let isGitRunning: boolean = false;
let idleTimeout: NodeJS.Timer | undefined;

const terminal = vscode.window.createTerminal({
	name: 'C Program',
	shellPath: 'powershell.exe',
});

const { exec } = require('child_process');
  

export function activate(context: vscode.ExtensionContext) {
    const compileDisposable = vscode.commands.registerCommand('git_plugin.compile', () => {
        compileCProgram();
    });

    const debugStartDisposable = vscode.commands.registerCommand('git_plugin.startExtensionAndDebug', () => {
        startExtension();
    });

    const debugStoptDisposable = vscode.commands.registerCommand('git_plugin.stopExtensionAndDebug', () => {
        stopExtension();
    });

    const gitDisposable = vscode.commands.registerCommand('git_plugin.git', () => {
        gitActions();
    });

    context.subscriptions.push(compileDisposable, debugStartDisposable,debugStoptDisposable, gitDisposable);
}

export function deactivate() {}

function compileCProgram() {
    const editor = vscode.window.activeTextEditor;

    if (editor) {
        const filePath = editor.document.uri.fsPath;

        if (filePath.endsWith('.c')) {
            // On Windows, use 'powershell' for PowerShell execution
           

            const outputFilePath = path.join(path.dirname(filePath), path.basename(filePath, '.c'));
            const compileCommand = `gcc -g "${filePath}" -o "${outputFilePath}.exe" 2>&1`;

            // Execute the compile command directly in the terminal
            terminal.sendText(compileCommand, true);
			const compileProcess = child_process.exec(compileCommand, (error, stdout, stderr) => {
				if (error) {
					terminal.show();
					vscode.window.showErrorMessage('Compilation failed.');
				} else {
					// Compilation successful, run the program
					terminal.show();
					terminal.sendText(`${outputFilePath}.exe`);
				}
			});
        } else {
            vscode.window.showErrorMessage('The active document is not a C program.');
        }
    } else {
        vscode.window.showInformationMessage('Open a Workspace before using the command.');
    }
}


function startExtension() {
    // Your debugging code here
    vscode.window.showInformationMessage('Extension Started');
	startTranscript();


	if (!isGitRunning) {
		isGitRunning = true;
		startGitCommands();
	}

    const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
    idleTimeout = setTimeout(() => {
        stopExtension();
    }, 600000);

}

function stopExtension() {
    // Your debugging code here
    vscode.window.showInformationMessage('Extension Stopped');
	stopTranscript();
	if (isGitRunning) {
		isGitRunning = false;
		stopGitCommands();
		gitActions();
	}

    if (idleTimeout) {
        clearTimeout(idleTimeout as any);
        idleTimeout = undefined;
    }
}

function gitActions() {
    // Your Git actions code here
    vscode.window.showInformationMessage('Git actions command executed.');
	terminal.sendText('git add .');
    const commitMessage = `committed ${new Date().toLocaleString()}`;
    terminal.sendText(`git commit -m "${commitMessage}"`);
	terminal.sendText('git push');
}


function startGitCommands() {
    vscode.window.showInformationMessage('Git commands are running.');

    // Execute Git commands every 30 seconds (adjust the interval as needed)
    gitInterval = setInterval(() => {

		const currentDateTime = new Date().toLocaleString();
        const commitMessage = `committed ${currentDateTime}`;
        // Replace this with your actual Git commands
		setTimeout(() => {
			runGitCommand('git add .');
			setTimeout(() => {
				runGitCommand(`git commit -m "${commitMessage}"`);
				setTimeout(() => {
					runGitCommand('git push');
				}, 500);
			}, 500);
		}, 500);
        
    }, 30000); // 30 seconds interval
}

function stopGitCommands() {
    vscode.window.showInformationMessage('Git commands stopped.');
    if (gitInterval) {
		clearInterval(gitInterval as any);
    }
}

function runGitCommand(command: string) {
    const workspacePath = vscode.workspace.rootPath; // Get the current workspace directory
    console.log(`Executing Git command in workspace: ${workspacePath}`);
    
    // Specify the workspace directory as the current working directory
    exec(command, { cwd: workspacePath }, (error: any, stdout: any, stderr: any) => {
        if (error) {
            console.error(`Error executing Git command: ${error}`);
        } else {
            console.log(`Git command output: ${stdout}`);
        }
    });
}

// Start the transcript when your extension activates
function startTranscript() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active text editor found.');
        return;
    }

	const filePath = editor.document.uri.fsPath;
	if (filePath.endsWith('.c')) {
		const fileName = path.basename(filePath);
    	const fileNameWithoutExtension = path.parse(fileName).name;
    	const transcriptFilePath = path.join(path.dirname(filePath), `${fileNameWithoutExtension}_session.txt`);
    
    	const transcriptStartCommand = `Start-Transcript -Path "${transcriptFilePath}"`;
		terminal.sendText(transcriptStartCommand);
    	vscode.window.showInformationMessage(`Transcript started for ${fileName}. Run your commands...`);
	}

}

// Stop the transcript when your extension deactivates
function stopTranscript() {
    const transcriptStopCommand = 'Stop-Transcript';
	terminal.sendText(transcriptStopCommand);
    vscode.window.showInformationMessage('Transcript stopped.');
}


