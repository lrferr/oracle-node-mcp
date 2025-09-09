# 📦 NPM Publishing Guide - Oracle Node MCP Server

This guide explains how to publish the Oracle Node MCP Server to NPM for use with `npx`.

## 🚀 Publishing Preparation

### 1. Check Configuration

```bash
# Check if logged in to NPM
npm whoami

# If not logged in, login
npm login
```

### 2. Check Files

```bash
# Check which files will be included
npm pack --dry-run

# Check if package.json is correct
npm run lint
```

### 3. Test Locally

```bash
# Install globally for testing
npm install -g .

# Test command
oracle-mcp --help
oracle-mcp test-connection
oracle-mcp setup-cursor

# Uninstall after testing
npm uninstall -g oracle-node-mcp
```

## 📋 Publishing Checklist

### ✅ Required Files

- [x] `package.json` with correct configurations
- [x] `bin/oracle-mcp-cli.js` (executable)
- [x] `LICENSE` (MIT)
- [x] `README.md` (complete documentation)
- [x] `.npmignore` (files to ignore)

### ✅ package.json Configuration

- [x] `name`: "oracle-node-mcp"
- [x] `version`: "1.0.0"
- [x] `bin`: executable command
- [x] `files`: files to include
- [x] `engines`: Node.js >= 18.0.0
- [x] `keywords`: relevant keywords
- [x] `repository`: GitHub URL
- [x] `author`: author information

### ✅ Tests

- [x] `npm run lint` (no errors)
- [x] `npm test` (tests passing)
- [x] `npm run test-connection` (Oracle connection)
- [x] `npm run quick-setup` (configuration)

## 🚀 Publishing Process

### 1. Check Version

```bash
# Check current version
npm version

# If needed, increment version
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

### 2. Publish

```bash
# Publish to NPM
npm publish

# Or publish as beta
npm publish --tag beta
```

### 3. Verify Publication

```bash
# Check if published
npm view oracle-node-mcp

# Test installation
npx oracle-node-mcp@latest --help
```

## 🔄 Future Updates

### 1. Increment Version

```bash
# Patch (fixes)
npm version patch

# Minor (new features)
npm version minor

# Major (breaking changes)
npm version major
```

### 2. Publish Update

```bash
# Publish new version
npm publish

# Or publish as beta first
npm publish --tag beta
```

### 3. Deprecate Version

```bash
# Deprecate specific version
npm deprecate oracle-node-mcp@1.0.0 "Outdated version, use 1.1.0+"
```

## 📊 Available Commands After Publication

### Global Installation

```bash
# Install globally
npm install -g oracle-node-mcp

# Use commands
oracle-mcp --help
oracle-mcp test-connection
oracle-mcp setup-cursor
```

### Use with npx

```bash
# Use without installing
npx oracle-node-mcp --help
npx oracle-node-mcp test-connection
npx oracle-node-mcp setup-cursor

# Use specific version
npx oracle-node-mcp@1.0.0 --help
```

## 🎯 Usage Examples After Publication

### 1. Quick Setup

```bash
# Install and configure automatically
npx oracle-node-mcp setup-cursor

# Test connection
npx oracle-node-mcp test-connection

# Start server
npx oracle-node-mcp
```

### 2. Manual Configuration

```bash
# Install globally
npm install -g oracle-node-mcp

# Configure Cursor
oracle-mcp setup-cursor

# Test
oracle-mcp test-connection

# Start
oracle-mcp
```

### 3. Project Integration

```bash
# Add as development dependency
npm install --save-dev oracle-node-mcp

# Use in package.json scripts
{
  "scripts": {
    "db:test": "oracle-mcp test-connection",
    "db:setup": "oracle-mcp setup-cursor",
    "db:start": "oracle-mcp"
  }
}
```

## 🔧 Cursor/Claude Desktop Configuration

After installation, the `setup-cursor` command will automatically create:

```json
{
  "mcpServers": {
    "oracle-monitor": {
      "command": "npx",
      "args": ["oracle-node-mcp"],
      "env": {
        "ORACLE_HOST": "localhost",
        "ORACLE_PORT": "1521",
        "ORACLE_SERVICE_NAME": "ORCL",
        "ORACLE_USER": "your_username",
        "ORACLE_PASSWORD": "your_password"
      }
    }
  }
}
```

## 📈 Metrics and Monitoring

### 1. NPM Statistics

```bash
# View package statistics
npm view oracle-node-mcp

# View downloads
npm view oracle-node-mcp downloads
```

### 2. GitHub Insights

- Access: https://github.com/oracle-mcp/oracle-node-mcp/insights
- Check: Stars, Forks, Clones, Traffic

## 🐛 Troubleshooting

### Problem: "Package already exists"

**Solution:**
```bash
# Check if name is available
npm view oracle-node-mcp

# If exists, choose another name
npm init
# Change name in package.json
```

### Problem: "Permission denied"

**Solution:**
```bash
# Check if logged in
npm whoami

# Login
npm login

# Check permissions
npm access ls-packages
```

### Problem: "Version already exists"

**Solution:**
```bash
# Increment version
npm version patch

# Publish new version
npm publish
```

## 📚 Additional Resources

- [NPM Documentation](https://docs.npmjs.com/)
- [NPM Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [NPM Best Practices](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry/creating-a-package-json-file)

---

**🎉 Congratulations! Your Oracle Node MCP Server package is ready to be published to NPM!**

**💡 Tip:** Always test locally before publishing and keep documentation updated.
