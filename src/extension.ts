import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as child_process from 'child_process';
 
let gitInterval: NodeJS.Timer | undefined;
let isGitRunning: boolean = false;
let idleTimeout: NodeJS.Timer | undefined;

const terminal = vscode.window.createTerminal({
	name: 'C Program',
	shellPath: 'cmd.exe',
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

    const gdbStartDisposable = vscode.commands.registerCommand('git_plugin.startGDB', () => {
        startGDB();
    });

    const gdbStopDisposable = vscode.commands.registerCommand('git_plugin.stopGDB', () => {
        stopGDB();
    });

    context.subscriptions.push(compileDisposable, debugStartDisposable,debugStoptDisposable, gitDisposable, gdbStartDisposable, gdbStopDisposable);
}

export function deactivate() {}

function compileCProgram() {
    const editor = vscode.window.activeTextEditor;

    if (editor) {
        const filePath = editor.document.uri.fsPath;
        terminal.show();

        if (filePath.endsWith('.c')) {
            // On Windows, use 'powershell' for PowerShell execution
           
            const baseFileName = path.basename(filePath, '.c');
            const outputFilePath = path.join(path.dirname(filePath), path.basename(filePath, '.c'));
            const compileCommand = `gcc -g "${filePath}" -o "${outputFilePath}.exe" 2>&1`;
            const compileErrorsFilePath = path.join(path.dirname(filePath), `${baseFileName}_compile_errors.txt`);

            const logStream = fs.createWriteStream(compileErrorsFilePath, { flags: 'a' });
            terminal.show();

            // Add a timestamp
            const timestamp = new Date().toLocaleString();
            logStream.write(`Compilation started at ${timestamp}\n`);

            // Execute the compile command directly in the terminal
            terminal.sendText(compileCommand, true);
            const compileProcess = child_process.exec(compileCommand, (error, stdout, stderr) => {
                if (error) {
                    terminal.show();
                    vscode.window.showErrorMessage('Compilation failed.');

                    // Capture the error message with a timestamp
                    const errorTimestamp = new Date().toLocaleString();
                    logStream.write(`Compilation error at ${errorTimestamp}\n`);
                    logStream.write(`Error message: ${error}\n`);
                } else {
                    // Compilation successful, run the program
                    terminal.show();
                    terminal.sendText(`"${outputFilePath}.exe"`);
                }
            });
            
            compileProcess.stdout?.pipe(logStream, { end: false });
            compileProcess.stderr?.pipe(logStream, { end: false });

            compileProcess.on('exit',(code) =>{
                // Add a final timestamp
                const endTimestamp = new Date().toLocaleString();
                logStream.write(`Compilation finished at ${endTimestamp}\n`);

                logStream.end();
                if(code === 0){
                    vscode.window.showInformationMessage('Compilation succeeded.');
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
    terminal.show();
    vscode.window.showInformationMessage('Extension Started');
	// startTranscript();


	if (!isGitRunning) {
		isGitRunning = true;
		startGitCommands();
	}

    const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 10 minutes
    idleTimeout = setTimeout(() => {
        stopExtension();
    }, IDLE_TIMEOUT_MS);

}

function stopExtension() {
    // Your debugging code here
    terminal.show();
    vscode.window.showInformationMessage('Extension Stopped');
	// stopTranscript();
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


function startGDB() {
    terminal.show();
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const filePath = editor.document.uri.fsPath;
        terminal.show();

        if (filePath.endsWith('.c')) {
            const baseFileName = path.basename(filePath, '.c');
            const outputFilePath = path.join(path.dirname(filePath), baseFileName);
            const gdbCommand = `gdb ./${baseFileName}`;

            // Execute the GDB command in the terminal
            terminal.sendText(gdbCommand, true);
            setTimeout(() => {
                terminal.sendText('c');
                setTimeout(() => {
                    terminal.sendText(`set logging file ${baseFileName}_debug_log.txt`);
                    setTimeout(() => {
                        terminal.sendText('set logging enabled on');
                        terminal.sendText('set logging on');
                    }, 500);    
                }, 1000);
                
            }, 1000);

        } else {
            vscode.window.showErrorMessage('The active document is not a C program.');
        }
    } else {
        vscode.window.showInformationMessage('Open a Workspace before using the command.');
    }
}







function stopGDB() {
    // Send text to stop logging and quit the GDB session
    terminal.show();
    setTimeout(() => {
        terminal.sendText('set logging enabled off');
        terminal.sendText('set loggin off');
        setTimeout(() => {
            terminal.sendText('q');
            setTimeout(() => {
                gitActions();
            }, 500);
        }, 500);
    }, 500);
}




function gitActions() {
    // Your Git actions code here
    terminal.show();
    vscode.window.showInformationMessage('Git actions command executed.');      
	terminal.sendText('git add .');
    const commitMessage = `committed ${new Date().toLocaleString()}`;
    terminal.sendText(`git commit -m "${commitMessage}"`);
	terminal.sendText('git push');
}


function startGitCommands() {
    vscode.window.showInformationMessage('Git commands are running.');
    const AUTO_TIMER_MS = 30000; // 30 seconds (30000 in ms)


    // Execute Git commands every 30 seconds, timer can be adjusted
    gitInterval = setInterval(() => {
		const currentDateTime = new Date().toLocaleString();
        const commitMessage = `committed ${currentDateTime}`;
        // Git commands that are run
		setTimeout(() => {
			runGitCommand('git add .');
			setTimeout(() => {
				runGitCommand(`git commit -m "${commitMessage}"`);
				setTimeout(() => {
					runGitCommand('git push');
				}, 500);
			}, 500);
		}, 500);
        
    }, AUTO_TIMER_MS); // 30 seconds interval
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


