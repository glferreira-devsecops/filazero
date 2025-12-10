#!/bin/bash
# FilaZero Saúde - PocketBase Setup Script

echo "🚀 Setting up PocketBase..."

cd "$(dirname "$0")"

# Check if pocketbase exists
if [ ! -f "pocketbase" ]; then
    echo "📦 Downloading PocketBase..."

    # Detect architecture
    ARCH=$(uname -m)
    if [ "$ARCH" = "arm64" ]; then
        URL="https://github.com/pocketbase/pocketbase/releases/download/v0.22.27/pocketbase_0.22.27_darwin_arm64.zip"
    else
        URL="https://github.com/pocketbase/pocketbase/releases/download/v0.22.27/pocketbase_0.22.27_darwin_amd64.zip"
    fi

    curl -L "$URL" -o pocketbase.zip
    unzip -o pocketbase.zip
    rm pocketbase.zip
    chmod +x pocketbase
    echo "✅ PocketBase downloaded!"
fi

echo ""
echo "🏥 Starting FilaZero Saúde Backend..."
echo "   Admin UI: http://127.0.0.1:8090/_/"
echo "   API: http://127.0.0.1:8090/api/"
echo ""

./pocketbase serve
