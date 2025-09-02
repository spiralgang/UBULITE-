import React, { Component } from 'react';
import $ from 'jquery';
import ReactGA from 'react-ga';

export class Terminal extends Component {
    constructor() {
        super();
        this.cursor = "";
        this.terminal_rows = 1;
        this.current_directory = "~";
        this.curr_dir_name = "root";
        this.prev_commands = [];
        this.commands_index = -1;
        this.shell_type = "bash"; // bash or zsh
        this.command_history = [];
        this.auto_complete_cache = new Map();
        
        // Enhanced directory structure with more programming languages
        this.child_directories = {
            root: ["books", "projects", "personal-documents", "skills", "languages", "PDPU", "interests", "tools", "network", "system"],
            PDPU: ["Sem-6"],
            books: ["Eric-Jorgenson_The-Almanack-of-Naval-Ravikant.pdf", "Elon Musk: How the Billionaire CEO of SpaceX.pdf", "The $100 Startup_CHRIS_GUILLEBEAU.pdf", "The_Magic_of_Thinking_Big.pdf"],
            skills: ["Front-end development", "React.js", "jQuery", "Flutter", "Express.js", "SQL", "Firebase", "Docker", "Kubernetes", "Linux", "Android"],
            projects: ["vivek9patel-personal-portfolio", "synonyms-list-react", "economist.com-unlocked", "Improve-Codeforces", "flutter-banking-app", "Meditech-Healthcare", "CPU-Scheduling-APP-React-Native"],
            interests: ["Software Engineering", "Deep Learning", "Computer Vision", "DevOps", "Mobile Development"],
            languages: ["Javascript", "Python", "C++", "Java", "Dart", "Kotlin", "Go", "Rust", "Shell", "TypeScript", "PHP", "Ruby"],
            tools: ["git", "docker", "npm", "pip", "gradle", "maven", "cmake", "make"],
            network: ["ping", "curl", "wget", "netstat", "ss", "iptables", "nmap", "tcpdump"],
            system: ["ps", "top", "htop", "df", "du", "free", "uname", "lscpu", "lsusb"]
        }
        // Network tools from consolidated files
        this.network_tools = [
            'ifconfig', 'ip', 'ping', 'traceroute', 'netstat', 'ss', 'nslookup', 'dig', 'host', 
            'route', 'iwconfig', 'iw', 'nmap', 'tcpdump', 'wget', 'curl', 'ssh', 'scp', 
            'iftop', 'iperf', 'nc', 'telnet', 'ftp', 'rsync'
        ];

        // System tools from Korg Shell
        this.system_tools = [
            'ps', 'top', 'htop', 'kill', 'killall', 'df', 'du', 'free', 'uname', 'uptime',
            'lscpu', 'lsusb', 'lspci', 'mount', 'umount', 'fdisk', 'lsblk', 'systemctl'
        ];

        // Cloud storage integration from Korg Shell
        this.cloud_services = {
            'github': 'GitHub repositories',
            'gitlab': 'GitLab projects', 
            'huggingface': 'HuggingFace models',
            'mediafire': 'MediaFire storage'
        }
        // Smart package knowledge base from TermiMation.py
        this.package_knowledge = {
            'pip': 'python3-pip',
            'pip3': 'python3-pip'
        }
        // Error patterns and auto-fix capabilities from TermiMation.py
        this.error_patterns = new Map();
        this.auto_fix_history = [];

        // Programming language detectors and runners
        this.language_runners = {
            '.js': 'node',
            '.py': 'python3',
            '.java': 'javac && java',
            '.cpp': 'g++ -o output && ./output',
            '.c': 'gcc -o output && ./output',
            '.go': 'go run',
            '.rs': 'rustc && ./output',
            '.kt': 'kotlinc && kotlin',
            '.php': 'php',
            '.rb': 'ruby',
            '.sh': 'bash',
            '.zsh': 'zsh'
        }
        this.state = {
            terminal: [],
        }
    }

    componentDidMount() {
        this.reStartTerminal();
        this.loadTerminalPreferences();
    }

    componentDidUpdate() {
        clearInterval(this.cursor);
        this.startCursor(this.terminal_rows - 2);
    }

    componentWillUnmount() {
        clearInterval(this.cursor);
    }

    // Load user preferences from localStorage
    loadTerminalPreferences() {
        const prefs = localStorage.getItem('terminal_prefs');
        if (prefs) {
            const parsed = JSON.parse(prefs);
            this.shell_type = parsed.shell_type || 'bash';
            this.prev_commands = parsed.command_history || [];
        }
    }

    // Save user preferences 
    saveTerminalPreferences() {
        const prefs = {
            shell_type: this.shell_type,
            command_history: this.prev_commands.slice(-100) // Keep last 100 commands
        }
        localStorage.setItem('terminal_prefs', JSON.stringify(prefs));
    }

    reStartTerminal() {
        clearInterval(this.cursor);
        $('#terminal-body').empty();
        this.appendTerminalRow();
    }

    appendTerminalRow() {
        let terminal = this.state.terminal;
        terminal.push(this.terminalRow(this.terminal_rows));
        this.setState({ terminal });
        this.terminal_rows += 2;
    }

    terminalRow(id) {
        const promptSymbol = this.shell_type === 'zsh' ? '%' : '$';
        const username = this.shell_type === 'zsh' ? 'user@ubulite' : 'vivek@Dell';
        
        return (
            <React.Fragment key={id}>
                <div className="flex w-full h-5">
                    <div className="flex">
                        <div className=" text-ubt-green">{username}</div>
                        <div className="text-white mx-px font-medium">:</div>
                        <div className=" text-ubt-blue">{this.current_directory}</div>
                        <div className="text-white mx-px font-medium mr-1">{promptSymbol}</div>
                    </div>
                    <div id="cmd" onClick={this.focusCursor} className=" bg-transperent relative flex-1 overflow-hidden">
                        <span id={`show-${id}`} className=" float-left whitespace-pre pb-1 opacity-100 font-normal tracking-wider"></span>
                        <div id={`cursor-${id}`} className=" float-left mt-1 w-1.5 h-3.5 bg-white"></div>
                        <input 
                            id={`terminal-input-${id}`} 
                            data-row-id={id} 
                            onKeyDown={this.checkKey} 
                            onBlur={this.unFocusCursor} 
                            className=" absolute top-0 left-0 w-full opacity-0 outline-none bg-transparent" 
                            spellCheck={false} 
                            autoFocus={true} 
                            autoComplete="off" 
                            type="text" 
                        />
                    </div>
                </div>
                <div id={`row-result-${id}`} className={"my-2 font-normal"}></div>
            </React.Fragment>
        );
    }

    focusCursor(e) {
        clearInterval(this.cursor);
        this.startCursor($(e.target).data("row-id"));
    }

    unFocusCursor(e) {
        this.stopCursor($(e.target).data("row-id"));
    }

    startCursor(id) {
        clearInterval(this.cursor);
        $(`input#terminal-input-${id}`).trigger("focus");
        
        // Enhanced input handling with auto-completion
        $(`input#terminal-input-${id}`).on("input", (e) => {
            const value = $(e.target).val();
            $(`#cmd span#show-${id}`).text(value);
            
            // Auto-completion logic
            if (value.length > 2) {
                this.showAutoComplete(value, id);
            }
        });

        this.cursor = window.setInterval(function () {
            if ($(`#cursor-${id}`).css('visibility') === 'visible') {
                $(`#cursor-${id}`).css({ visibility: 'hidden' });
            } else {
                $(`#cursor-${id}`).css({ visibility: 'visible' });
            }
        }, 500);
    }

    stopCursor(id) {
        clearInterval(this.cursor);
        $(`#cursor-${id}`).css({ visibility: 'visible' });
    }

    removeCursor(id) {
        this.stopCursor(id);
        $(`#cursor-${id}`).css({ display: 'none' });
    }

    clearInput(id) {
        $(`input#terminal-input-${id}`).trigger("blur");
    }

    // Auto-completion functionality
    showAutoComplete(input, id) {
        const words = input.split(' ');
        const lastWord = words[words.length - 1];
        
        // Cache lookups for performance
        if (this.auto_complete_cache.has(lastWord)) {
            return this.auto_complete_cache.get(lastWord);
        }

        const suggestions = [];
        
        // Command suggestions
        const allCommands = [
            'cd', 'ls', 'pwd', 'mkdir', 'rmdir', 'rm', 'cp', 'mv', 'cat', 'echo', 
            'grep', 'find', 'chmod', 'chown', 'tar', 'zip', 'unzip', 'git', 'npm', 
            'pip', 'docker', 'kubectl', 'clear', 'exit', 'help', 'man', 'which',
            'shell-type', 'lang-detect', 'run-code', 'network-scan', 'sys-info',
            'github', 'gitlab', 'huggingface', 'mediafire', 'venice', '@venice',
            'smart-install', 'auto-fix', 'monitor-commands', 'history',
            ...this.network_tools, ...this.system_tools
        ];

        allCommands.forEach(cmd => {
            if (cmd.startsWith(lastWord)) {
                suggestions.push(cmd);
            }
        });

        // Directory/file suggestions
        if (words[0] === 'cd' || words[0] === 'ls') {
            const currentDirs = this.child_directories[this.curr_dir_name] || [];
            currentDirs.forEach(dir => {
                if (dir.startsWith(lastWord)) {
                    suggestions.push(dir);
                }
            });
        }

        this.auto_complete_cache.set(lastWord, suggestions.slice(0, 5));
        return suggestions.slice(0, 5);
    }

    checkKey(e) {
        const terminal_row_id = $(e.target).data("row-id");
        
        if (e.key === "Enter") {
            let command = $(`input#terminal-input-${terminal_row_id}`).val().trim();
            if (command.length !== 0) {
                this.removeCursor(terminal_row_id);
                this.handleCommands(command, terminal_row_id);
                
                // Add to command history
                this.prev_commands.push(command);
                this.commands_index = this.prev_commands.length - 1;
                this.saveTerminalPreferences();
            } else return;
            
            this.clearInput(terminal_row_id);
        }
        else if (e.key === "ArrowUp") {
            e.preventDefault();
            let prev_command = this.commands_index >= 0 ? 
                this.prev_commands[this.commands_index] : "";

            $(`input#terminal-input-${terminal_row_id}`).val(prev_command);
            $(`#show-${terminal_row_id}`).text(prev_command);
            this.commands_index--;
        }
        else if (e.key === "ArrowDown") {
            e.preventDefault();
            this.commands_index = Math.min(this.commands_index + 1, this.prev_commands.length);
            let next_command = this.commands_index < this.prev_commands.length ? 
                this.prev_commands[this.commands_index] : "";

            $(`input#terminal-input-${terminal_row_id}`).val(next_command);
            $(`#show-${terminal_row_id}`).text(next_command);
        }
        else if (e.key === "Tab") {
            e.preventDefault();
            // Tab completion
            const input = $(`input#terminal-input-${terminal_row_id}`).val();
            const suggestions = this.showAutoComplete(input, terminal_row_id);
            if (suggestions.length === 1) {
                const words = input.split(' ');
                words[words.length - 1] = suggestions[0];
                const newInput = words.join(' ') + ' ';
                $(`input#terminal-input-${terminal_row_id}`).val(newInput);
                $(`#show-${terminal_row_id}`).text(newInput);
            }
        }
    }

    childDirectories(parent) {
        let files = [];
        files.push(`<div class="flex justify-start flex-wrap">`)
        if (this.child_directories[parent]) {
            this.child_directories[parent].forEach(file => {
                files.push(
                    `<span class="font-bold mr-2 text-ubt-blue">'${file}'</span>`
                )
            });
        }
        files.push(`</div>`)
        return files;
    }

    closeTerminal() {
        $("#close-terminal").trigger('click');
    }

    // Enhanced command handler with consolidated functionality
    handleCommands(command, rowId) {
        let words = command.split(' ').filter(Boolean);
        let main = words[0];
        words.shift();
        let result = "";
        let rest = words.join(" ").trim();

        // Add to command history for analytics (no personal data)
        this.command_history.push({
            command: main,
            timestamp: Date.now(),
            shell: this.shell_type
        });

        switch (main) {
            // Basic file system commands
            case "cd":
                result = this.handleCdCommand(words, rest);
                break;
            case "ls":
                result = this.handleLsCommand(words, rest);
                break;
            case "pwd":
                result = this.current_directory.replace("~", "/home/user");
                break;
            case "mkdir":
                if (words[0]) {
                    this.props.addFolder && this.props.addFolder(words[0]);
                    result = `Directory '${words[0]}' created`;
                } else {
                    result = "mkdir: missing operand";
                }
                break;
            case "echo":
                result = this.xss(words.join(" "));
                break;

            // Shell management
            case "shell-type":
                if (words[0] === 'bash' || words[0] === 'zsh') {
                    this.shell_type = words[0];
                    this.saveTerminalPreferences();
                    result = `Shell changed to ${words[0]}`;
                } else {
                    result = `Current shell: ${this.shell_type}. Available: bash, zsh`;
                }
                break;

            // Language detection and code execution
            case "lang-detect":
                if (words[0]) {
                    result = this.detectLanguage(words[0]);
                } else {
                    result = "Usage: lang-detect <filename>";
                }
                break;
            case "run-code":
                result = this.runCode(words[0]);
                break;

            // Network tools (consolidated from network files)
            case "ping":
                result = this.simulateNetworkCommand('ping', rest);
                break;
            case "curl":
            case "wget":
                result = this.simulateNetworkCommand(main, rest);
                break;
            case "nmap":
                result = this.simulateNetworkCommand('nmap', rest);
                break;
            case "netstat":
                result = this.getNetworkStatus();
                break;
            case "network-scan":
                result = this.performNetworkScan();
                break;

            // System information (from Korg Shell)
            case "sys-info":
                result = this.getSystemInfo();
                break;
            case "ps":
                result = this.getProcessList();
                break;
            case "df":
                result = this.getDiskUsage();
                break;
            case "free":
                result = this.getMemoryInfo();
                break;

            // Git integration (from HF API Call file)
            case "git":
                result = this.handleGitCommand(words);
                break;
            case "gh":
                result = this.handleGitHubCLI(words);
                break;

            // Package management (from Terminal Augment files)
            case "apt":
            case "npm":
            case "pip":
                result = this.handlePackageManager(main, words);
                break;
            // App launching
            case "code":
                if (words.length === 0 || words[0] === ".") {
                    this.props.openApp && this.props.openApp("vscode");
                    result = "Opening VS Code...";
                } else {
                    result = this.getAvailableCommands();
                }
                break;
            case "spotify":
            case "chrome":
            case "todoist":
            case "trash":
            case "about-vivek":
            case "terminal":
            case "settings":
            case "sendmsg":
                if (words.length === 0 || words[0] === ".") {
                    const appMap = {
                        'sendmsg': 'gedit',
                        'about-vivek': 'about-vivek',
                        'todoist': 'todo-ist'
                    }
                    const appName = appMap[main] || main;
                    this.props.openApp && this.props.openApp(appName);
                    result = `Opening ${main}...`;
                } else {
                    result = this.getAvailableCommands();
                }
                break;

            // Terminal management
            case "clear":
                this.reStartTerminal();
                return;
            case "exit":
                this.closeTerminal();
                return;
            case "help":
                result = this.getHelpText();
                break;
            case "history":
                result = this.getCommandHistory();
                break;

            // Cloud storage integration (from Korg Shell)
            case "github":
            case "gitlab":
            case "huggingface":
            case "mediafire":
                result = this.handleCloudStorage(main, words);
                break;
            
            // AI integration and Venice commands (from Korg Shell)
            case "venice":
            case "@venice":
                result = this.handleVeniceAI(words);
                break;
            
            // Smart installation from TermiMation.py
            case "smart-install":
                result = this.handleSmartInstall(words);
                break;
            case "auto-fix":
                result = this.handleAutoFix(words);
                break;
            case "monitor-commands":
                result = this.handleCommandMonitoring(words);
                break;

            // Special commands
            case "sudo":
                ReactGA.event({
                    category: "Sudo Access",
                    action: "lol",
                });
                result = "<img class=' w-2/5' src='./images/memes/used-sudo-command.webp' />";
                break;

            default:
                if (this.network_tools.includes(main) || this.system_tools.includes(main)) {
                    result = this.simulateSystemCommand(main, rest);
                } else {
                    result = `Command '${main}' not found. Type 'help' for available commands.`;
                }
        }

        document.getElementById(`row-result-${rowId}`).innerHTML = result;
        this.appendTerminalRow();
    }

    // Enhanced command implementations
    handleCdCommand(words, rest) {
        if (words.length === 0 || rest === "") {
            this.current_directory = "~";
            this.curr_dir_name = "root";
            return "";
        }
        if (words.length > 1) {
            return "cd: too many arguments";
        }
        if (rest === "personal-documents") {
            return "bash: Permission denied 😏";
        }
        if (this.child_directories[this.curr_dir_name]?.includes(rest)) {
            this.current_directory += "/" + rest;
            this.curr_dir_name = rest;
            return "";
        } else if (rest === ".." || rest === "../") {
            return "Type 'cd' to go back 😅";
        } else {
            return `bash: cd: ${rest}: No such file or directory`;
        }
    }

    handleLsCommand(words, rest) {
        let target = words[0] || this.curr_dir_name;
        if (words.length > 1) return "ls: too many arguments";
        if (target === "personal-documents") return "Nope! 🙃";
        if (target in this.child_directories) {
            return this.childDirectories(target).join("");
        } else {
            return `ls: cannot access '${target}': No such file or directory`;
        }
    }

    detectLanguage(filename) {
        const ext = filename.substring(filename.lastIndexOf('.'));
        if (this.language_runners[ext]) {
            return `Detected language: ${ext} - Use: ${this.language_runners[ext]}`;
        }
        return "Language not recognized. Supported: " + Object.keys(this.language_runners).join(', ');
    }

    runCode(filename) {
        if (!filename) return "Usage: run-code <filename>";
        const ext = filename.substring(filename.lastIndexOf('.'));
        const runner = this.language_runners[ext];
        if (runner) {
            return `Simulating: ${runner} ${filename}\n[This would execute in a real environment]`;
        }
        return "Unsupported file type for execution";
    }

    simulateNetworkCommand(cmd, args) {
        const responses = {
            'ping': `PING ${args || 'localhost'} (192.0.2.1) 56(84) bytes of data.\n64 bytes from localhost: icmp_seq=1 ttl=64 time=0.045 ms\n[Simulation - Android network restricted]`,
            'curl': `HTTP/1.1 200 OK\nContent-Type: text/html\n[Simulation - Would fetch ${args || 'URL'}]`,
            'wget': `Resolving ${args || 'example.com'}... 198.51.100.1\nConnecting to ${args}... connected.\n[Simulation - Would download file]`,
            'nmap': `Starting Nmap scan...\nHost is up (0.00050s latency).\n[Simulation - Network scanning restricted on mobile]`
        }
        return responses[cmd] || `${cmd}: command simulated`;
    }

    getNetworkStatus() {
        return `Active Internet connections:\nProto Recv-Q Send-Q  Local Address          Foreign Address        State\ntcp        0      0  192.0.2.1:631          198.51.100.1:*               LISTEN\n[Limited network access on Android]`;
    }

    performNetworkScan() {
        return `Network Scan Results:\n• WiFi: Connected to local network\n• Mobile Data: Available\n• Bluetooth: Enabled\n• VPN: Disconnected\n[Detailed scanning limited on Android 10]`;
    }

    getSystemInfo() {
        return `System Information:
• OS: Android 10 (API 29)
• Device: Samsung Galaxy S9+ (Limited Storage)
• Shell: ${this.shell_type}
• Free Space: ~2GB (Optimized for light usage)
• RAM: Available
• Network: Connected
• Terminal: UBULITE Enhanced v2.0`;
    }

    getProcessList() {
        return `PID   COMMAND
1     init
2     [kthreadd]
1234  com.android.systemui
5678  UBULITE
9999  ${this.shell_type}
[Process list limited on Android]`;
    }

    getDiskUsage() {
        return `Filesystem      1K-blocks    Used Available Use% Mounted on
/dev/root         8000000 6000000   2000000  75% /
tmpfs             1000000       0   1000000   0% /tmp
[Storage optimized for Android 10]`;
    }

    getMemoryInfo() {
        return `              total        used        free      shared  buff/cache   available
Mem:        4000000     2000000     1000000      100000     1000000     1800000
Swap:             0           0           0
[Memory usage optimized for mobile]`;
    }

    handleGitCommand(words) {
        const gitCommands = {
            'status': 'On branch main\nnothing to commit, working tree clean',
            'log': 'commit abc123 (HEAD -> main)\nAuthor: User\nDate: Now\n\nLatest commit',
            'branch': '* main\n  develop',
            'pull': 'Already up to date.',
            'push': 'Everything up-to-date'
        }
        const cmd = words[0];
        return gitCommands[cmd] || `git ${cmd}: simulated command`;
    }

    handleGitHubCLI(words) {
        if (!words.length) return "gh: GitHub CLI - try 'gh --help'";
        const cmd = words[0];
        const responses = {
            'auth': 'Authentication status: Logged out\n[Use free GitHub API tier]',
            'pr': 'No pull requests found in current repository',
            'repo': 'Repository: spiralgang/UBULITE',
            'issue': 'No issues found'
        }
        return responses[cmd] || `gh ${cmd}: command simulated`;
    }

    handlePackageManager(manager, words) {
        const responses = {
            'apt': `Reading package lists... Done\n[Simulation - Package management limited on Android]`,
            'npm': `npm info: ${words.join(' ')}\n[Node.js package simulation]`,
            'pip': `Collecting ${words.join(' ')}\n[Python package simulation]`
        }
        return responses[manager] || `${manager}: simulated`;
    }

    simulateSystemCommand(cmd, args) {
        return `${cmd} ${args}: System command simulated\n[Limited system access on Android 10]`;
    }

    // Cloud storage integration from Korg Shell
    handleCloudStorage(service, args) {
        const operations = {
            'github': () => {
                if (args[0] === 'clone') {
                    return `Simulating: git clone ${args[1]}\n[GitHub integration - requires authentication]`;
                } else if (args[0] === 'list') {
                    return `Listing GitHub repositories...\n[Connect via: git remote add origin <url>]`;
                }
                return `GitHub service: Available operations: clone, list, push, pull`;
            },
            'gitlab': () => {
                return `GitLab integration: ${args.join(' ')}\n[Sync with GitLab projects]`;
            },
            'huggingface': () => {
                if (args[0] === 'download') {
                    return `Downloading HuggingFace model: ${args[1]}\n[Model integration for AI features]`;
                }
                return `HuggingFace service: Available operations: download, list, info`;
            },
            'mediafire': () => {
                return `MediaFire storage: ${args.join(' ')}\n[File upload/download simulation]`;
            }
        }
        return operations[service] ? operations[service]() : `${service}: Cloud service not recognized`;
    }

    // Venice AI integration from Korg Shell
    handleVeniceAI(args) {
        const command = args.join(' ');
        
        if (command.startsWith('##Persona')) {
            return `Venice AI: Switching to persona ${command}\n[AI persona switching simulated]`;
        } else if (command.startsWith('##System')) {
            return `Venice AI: Applying system prompt\n[System prompt configuration simulated]`;
        } else if (command.startsWith('##Guidelines')) {
            return `Venice AI: Applying operational guidelines\n[AI guidelines application simulated]`;
        } else {
            return `Venice AI: ${command}\n[AI interaction simulated - Connect Venice for full functionality]`;
        }
    }

    // Smart installation system from TermiMation.py
    handleSmartInstall(args) {
        const package_name = args[0];
        if (!package_name) {
            return "Usage: smart-install <package-name>";
        }

        const known_package = this.package_knowledge[package_name];
        if (known_package) {
            return `Smart Install: Would install ${known_package} for ${package_name}\n[Package resolution: ${package_name} -> ${known_package}]\n[Simulation - requires root access on real Android]`;
        } else {
            // Simulate package resolution
            return `Smart Install: Resolving ${package_name}...\n[Attempting to auto-detect correct package]\n[Simulation - package manager learning disabled on Android 10]`;
        }
    }

    // Auto-fix system from TermiMation.py  
    handleAutoFix(args) {
        const issue_type = args[0] || 'permissions';
        
        const fixes = {
            'permissions': 'Scanning for permission issues...\n[Auto-fixed 3 executable permissions]\n[Learning pattern: script files -> chmod +x]',
            'packages': 'Checking package dependencies...\n[Resolved 2 missing packages automatically]\n[dpkg status: healthy]',
            'commands': 'Monitoring command execution...\n[Command not found handler: active]\n[Smart install agent: monitoring]'
        }
        return fixes[issue_type] || `Auto-fix system: Monitoring ${issue_type}\n[Real-time error pattern learning active]`;
    }

    // Command monitoring from TermiMation.py
    handleCommandMonitoring(args) {
        const action = args[0] || 'status';
        
        if (action === 'start') {
            return `Command Monitor: Starting background monitoring\n[Watching for: command not found, permission errors, package issues]\n[Monitoring active - auto-fixes enabled]`;
        } else if (action === 'stop') {
            return `Command Monitor: Stopping background monitoring\n[Auto-fix system disabled]`;
        } else if (action === 'history') {
            return `Auto-fix History:\n${this.auto_fix_history.slice(-5).map(fix => `- ${fix}`).join('\n') || 'No auto-fixes recorded'}\n[Last 5 automatic fixes shown]`;
        } else {
            return `Command Monitor: Status active\n[Error patterns learned: ${this.error_patterns.size}]\n[Auto-fixes applied: ${this.auto_fix_history.length}]`;
        }
    }

    getHelpText() {
        return `UBULITE Enhanced Terminal v2.0 - Complete Consolidation - Help
        
<div class="text-ubt-green font-bold">File System:</div>
cd, ls, pwd, mkdir, echo, cat, find, grep, chmod, mv, cp, rm

<div class="text-ubt-green font-bold">Network Tools:</div>
ping, curl, wget, nmap, netstat, network-scan, ssh, scp, traceroute

<div class="text-ubt-green font-bold">System Info:</div>
sys-info, ps, df, free, top, uname, uptime, htop, kill

<div class="text-ubt-green font-bold">Development:</div>
git, gh, npm, pip, apt, lang-detect, run-code, smart-install

<div class="text-ubt-green font-bold">Cloud Storage (Korg Shell):</div>
github [clone|list], gitlab, huggingface [download], mediafire

<div class="text-ubt-green font-bold">AI Integration (Venice):</div>
venice, @venice [##Persona|##System|##Guidelines]

<div class="text-ubt-green font-bold">Auto-Fix System (TermiMation):</div>
auto-fix [permissions|packages|commands], monitor-commands, smart-install

<div class="text-ubt-green font-bold">Shell:</div>
shell-type [bash|zsh], history, clear, exit, help

<div class="text-ubt-green font-bold">Applications:</div>
code, chrome, spotify, settings, trash, terminal

<div class="text-ubt-blue">✨ Consolidated from 10+ files • Android 10 Optimized • Free APIs Only ✨</div>
<div class="text-yellow-400">All terminal files from folder now integrated into single component</div>`;
    }

    getCommandHistory() {
        if (this.prev_commands.length === 0) return "No commands in history";
        return this.prev_commands.slice(-10).map((cmd, idx) => 
            `${this.prev_commands.length - 10 + idx + 1}  ${cmd}`
        ).join('\n');
    }

    getAvailableCommands() {
        return "Available commands: [ cd, ls, pwd, echo, clear, exit, mkdir, code, spotify, chrome, help, git, network-scan, sys-info, shell-type, lang-detect, github, gitlab, huggingface, venice, smart-install, auto-fix, monitor-commands ]";
    }

    xss = (str) => {
        if (!str) return;
        return str.split('').map(char => {
            switch (char) {
                case '&':
                    return '&amp';
                case '<':
                    return '&lt';
                case '>':
                    return '&gt';
                case '"':
                    return '&quot';
                case "'":
                    return '&#x27';
                case '/':
                    return '&#x2F';
                default:
                    return char;
            }
        }).join('');
    }

    render() {
        return (
            <div className="h-full w-full bg-ub-drk-abrgn text-white text-sm font-bold" id="terminal-body">
                <div className="text-xs text-gray-400 p-2 border-b border-gray-600">
                    UBULITE Complete Terminal v2.1 - {this.shell_type.toUpperCase()} - All Files Consolidated - Type 'help' for commands
                </div>
                {this.state.terminal}
            </div>
        )
    }
}

export default Terminal

export const displayTerminal = (addFolder, openApp) => {
    return <Terminal addFolder={addFolder} openApp={openApp}> </Terminal>;
}
