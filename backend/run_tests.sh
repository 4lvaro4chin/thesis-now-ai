#!/bin/bash
# ThesisNow Backend - Run Connector Tests (Bash)

echo ""
echo "🔬 Running Connector Tests..."
echo "================================"
echo ""

# Check if poetry or python available
if command -v poetry &> /dev/null; then
    PYTHON_CMD="poetry run python"
    echo "✅ Using Poetry"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
    echo "✅ Using Python"
elif command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
    echo "✅ Using Python3"
else
    echo "❌ Python or Poetry not found!"
    exit 1
fi

echo ""
echo "Running: $PYTHON_CMD test_connectors_local.py"
echo ""

# Run the test
$PYTHON_CMD test_connectors_local.py

exit_code=$?
echo ""
if [ $exit_code -eq 0 ]; then
    echo "✅ Tests completed successfully!"
else
    echo "❌ Tests failed with exit code $exit_code"
fi

exit $exit_code
