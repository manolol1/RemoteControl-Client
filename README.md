# RemoteControl-Client
### The client module of the [RemoteControl project](https://github.com/manolol1/RemoteControl).

This program must run on the computer that should be controlled. It provides an API, that the user-facing modules use to control the computer.

## Requirements
* WakeOnLan enabled in the BIOS/UEFI
* Git, Node.js and NPM

## Installation and Configuration
1. Enable WakeOnLan in the BIOS/UEFI of your device. WakeOnLan is a standard, that allows waking up a computer by sending a "magic packet" to it. There are plenty of useful guides on the internet.
2. Install the required programs (Git and Node.js) on the computer. This can usually be done with the default package manager of your operating system.
3. Clone the repository to your machine: `git clone https://github.com/manolol1/RemoteControl-Client.git`
4. Copy the configuration file template: `cp config.yaml.template config.yaml`
5. You can now make changes to the configuration file, if you want.
6. Install dependencies: `npm install`
7. Run the program: `sudo node app.js` (root permissions are usually only required for running some special scripts)

The client should now be ready to accept commands. You should also make sure that the client is always automatically started on boot. This can be achieved through a Cronjob or a Systemd service.

Next, you should install one or more of the user-facing modules on another computer. 

## Configuration file (config.yaml)
To create an initial configuration file, copy config.yaml.template into a new file with the name "config.yaml".
The config values should be self-explanatory.

Make sure that the configuration file is always valid. If the configuration file can't be parsed, the program will crash. After making changes, the program needs to be restarted.

## Scripts
Script support can be enabled or disabled in the configuration file.
If scripts are enabled, anyone can run all shell scripts in the scripts directory. **Never put scripts in that directory that could cause any substantial damage to your machine or data!**

Make sure, that all scripts end with the .sh extension. The client will parse the script names and communicate them to the other modules if requested.
