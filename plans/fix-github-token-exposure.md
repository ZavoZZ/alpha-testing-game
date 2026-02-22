# Plan: Fix GitHub Token Exposure in MCP Config

## Problem

The file `.kilocode/mcp.json` previously contained a hardcoded GitHub Personal Access Token.

**IMPORTANT**: The exposed token has been revoked and replaced. Never commit tokens to the repository!

This is a security vulnerability because:

1. The token will be committed to git history
2. Anyone with repository access can use your GitHub credentials
3. Secret scanning may detect and expose the token

## Solution

The MCP server (`@modelcontextprotocol/server-github`) automatically reads the `GITHUB_PERSONAL_ACCESS_TOKEN` environment variable from the process environment. We don't need to specify it in the `env` object of the MCP config.

### How MCP Environment Variables Work

1. The `env` object in MCP config **sets** environment variables for the child process
2. If we omit the `env` section, the child process **inherits** environment variables from the parent (Kilo Code)
3. Kilo Code reads environment variables from the shell where it runs

### Implementation Steps

#### Step 1: Modify `.kilocode/mcp.json`

Remove the hardcoded token from the `env` object:

```json
"github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "alwaysAllow": ["search_repositories", "create_or_update_file"]
}
```

The MCP server will automatically look for `GITHUB_PERSONAL_ACCESS_TOKEN` in the inherited environment.

#### Step 2: Set Environment Variable in Shell

Add to your shell profile (`~/.bashrc`, `~/.zshrc`, or `~/.profile`):

```bash
export GITHUB_PERSONAL_ACCESS_TOKEN="your-token-here"
```

Then reload: `source ~/.bashrc`

#### Step 3: Alternative - Use .env file for Kilo Code

If Kilo Code supports loading `.env` files, create a `.kilocode/.env` file:

```env
GITHUB_PERSONAL_ACCESS_TOKEN=your-token-here
```

And add it to `.gitignore`:

```
.kilocode/.env
```

#### Step 4: Revoke the Exposed Token

**IMPORTANT**: Go to GitHub → Settings → Developer settings → Personal access tokens and revoke any exposed tokens, then create a new one. Never share or commit tokens!

## Files to Modify

| File                 | Action                                      |
| -------------------- | ------------------------------------------- |
| `.kilocode/mcp.json` | Remove hardcoded token from `env` object    |
| `.gitignore`         | Add `.kilocode/.env` if using that approach |
| Shell profile        | Add `export GITHUB_PERSONAL_ACCESS_TOKEN`   |

## Verification

After making changes:

1. Restart Kilo Code
2. Test GitHub MCP functionality with a simple operation
3. Verify no errors in console

## Recommendation

**Option A (Recommended)**: Remove `env` section entirely, set token in shell profile

- Pros: Token never in repository, works across all projects
- Cons: Requires shell configuration

**Option B**: Use `.kilocode/.env` file

- Pros: Project-specific configuration
- Cons: Need to verify Kilo Code supports `.env` loading

---

_Ready for implementation in Code mode_
