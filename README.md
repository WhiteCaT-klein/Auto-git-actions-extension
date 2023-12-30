# ClassroomPlugin Rework FPC(Windows Only) - Visual Studio Code Extension

![Extension Icon](images/logo.png)

## Overview

The ClassroomPlugin Rework FPC (Windows Only) is a revamped and improved Visual Studio Code extension designed for Windows users. This extension provides enhanced functionality for working with C programming, Git integration, and debugging using GDB.

## Features

- **Compile C Code**: Easily compile your C programs from within Visual Studio Code.
- **Start Extension and Debug**: Start the extension, initiate Git commands and debugging.
- **Stop Extension and Debug**: Stop the extension, halt Git commands, and debugging.
- **Commit and Push to Repository**: Simplify the process of committing and pushing your changes to a Git repository.
- **Start GDB Session**: Initiate a GDB debugging session with logging.
- **Stop GDB Session**: Terminate the GDB debugging session and stop logging.

## Requirements

- Visual Studio Code version 1.81.0 or later.

## Installation

You can install this extension from the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=WhiteCaT-klein.classroomplugin).

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/WhiteCaT-klein/Auto-git-actions-extension.git

2. Open the project in Visual Studio Code:
    
    code classroomplugin

3. Install dependecies by running the below command in the terminal

    npm install

4. Press 'F5' to start the extension in debug mode.

## Usage

1. Open C program in Visual Studio Code

2. Use commands available in the Command Palette to make use of the features

3. Enjoy an improved workflow for C programming and version control.

## Configuration

This extension does not require any specific configuration. It is designed to work seamlessly within Visual Studio Code.

## Bugs and Feedback

If you encounter any issues or have feedback, please [submit an issue on GitHub](https://github.com/WhiteCaT-klein/Auto-git-actions-extension/issues).

## License

This extension is not licensed

## Repository

- [GitHub Repository](https://github.com/WhiteCaT-klein/Auto-git-actions-extension)

## Version 1.0.7

- **Fixed Logging Commands in GDB Session**: Version 1.0.7 addresses an issue with logging commands in the GDB session to ensure accurate capturing of commands used during debugging.


## Version 1.0.8
- **Compile C code and Start GDB session will now for cd into current open directory**: Version 1.0.8 addresses an issue with compilation fails and GDB log not being captured during usage. 
---

Happy coding!

Developed by [WhiteCaT-klein]
