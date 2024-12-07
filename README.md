# CVPN - VPN right from your Terminal

Command Line VPN built with Go and featuring AWS integration and a modern text-based user interface.

## Features

- 🔐 Secure AWS credentials management with local encryption
- 🖥️ Interactive terminal user interface
- 🚀 Quick VPN instance deployment on AWS
- 📊 Real-time connection monitoring
- 🔄 Instance lifecycle management
- 📝 Connection logging and diagnostics

## Installation

```bash
go install github.com/yourusername/vpn-cli@latest
```

Or build from source:

```bash
git clone https://github.com/yourusername/vpn-cli.git
cd vpn-cli
go build ./cmd/vpncli
```

## Quick Start

1. Configure AWS credentials:
```bash
vpncli configure
```

2. Create a new VPN instance:
```bash
vpncli create
```

3. Connect to your VPN:
```bash
vpncli connect
```

## Usage

Press `?` in the interactive interface to see all available commands.

Common operations:
- `c`: Connect to selected VPN
- `d`: Disconnect current VPN
- `n`: Create new VPN instance
- `x`: Delete selected instance
- `q`: Quit application

## Configuration

The CLI supports several configuration options through environment variables or config files:

```bash
VPNCLI_AWS_REGION=us-west-2      # Default AWS region
VPNCLI_CONFIG_PATH=~/.vpncli     # Configuration directory
VPNCLI_LOG_LEVEL=info           # Logging level
```

## Documentation

Complete documentation is available in two formats:

1. Built-in CLI documentation:
```bash
vpncli help
```

2. Comprehensive web documentation at [docs coming soon]()
   - Built with Astro
   - Includes tutorials and best practices
   - Deployment guides
   - AWS cost optimization tips
   - Security recommendations

## Architecture

The application is built using several powerful Go libraries:

- [charmbracelet/bubbletea](https://github.com/charmbracelet/bubbletea) - Terminal UI framework
- [charmbracelet/bubbles](https://github.com/charmbracelet/bubbles) - UI components
- [charmbracelet/huh](https://github.com/charmbracelet/huh) - Form handling
- [aws/aws-sdk-go-v2](https://github.com/aws/aws-sdk-go-v2) - AWS SDK

## Security

- AWS credentials are never stored in plaintext
- Automatic credential rotation
- System keyring integration
- Regular security audits

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📚 Refer to our [Documentation](https://docs.yourdomain.com) for detailed guides
- 🐛 Report bugs via [GitHub Issues](https://github.com/yourusername/vpn-cli/issues)
- 💡 Feature requests are welcome
- 📧 Professional support: support@shashwatdixit.dev