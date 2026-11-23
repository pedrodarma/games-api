# Get the latest tag from the remote repository
VERSION=$(git describe --tags --always --abbrev=0)

# check if VERSION is empty
if [ -z "$VERSION" ]; then
  echo "0.0.0"
  exit 0
fi

# check if VERSION is string ou hash
if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "0.0.0"
  exit 0
fi

echo $VERSION