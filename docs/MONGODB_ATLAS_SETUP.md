# MongoDB Atlas Setup Guide

## After choosing "Drivers"

1. **Select Node.js** as the driver

2. **Copy the connection string** - it looks like:
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/game_db?retryWrites=true&w=majority
   ```

3. **Replace `<password>`** with your password: `Darius12345!`

4. **Your connection string should be:**
   ```
   mongodb+srv://admin:Darius12345!@cluster0.xxxxx.mongodb.net/game_db?retryWrites=true&w=majority
   ```
   (Replace `cluster0.xxxxx` with your actual cluster name)

## IMPORTANT: Network Access

Before connecting, you must allow access from anywhere:

1. Go to **MongoDB Atlas** → **Network Access**
2. Click **Add IP Address**
3. Select **Allow Access from Anywhere** (0.0.0.0/0)
4. Click **Confirm**

## Update .env.sandbox

Edit `.env.sandbox` and replace the DB_URI line:

```
DB_URI=mongodb+srv://admin:Darius12345!@cluster0.xxxxx.mongodb.net/game_db?retryWrites=true&w=majority
```

## Then start the sandbox

```bash
./scripts/sandbox-start.sh
```

## Troubleshooting

If you get connection errors:
1. Check Network Access is set to 0.0.0.0/0
2. Check username/password is correct
3. Check cluster name in connection string
