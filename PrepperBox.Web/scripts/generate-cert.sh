#!/bin/sh
# Generates a self-signed certificate for HTTPS access over a LAN IP address.
# Usage: ./generate-cert.sh <IP_ADDRESS> [OUTPUT_DIR]
# Example: ./generate-cert.sh 192.168.1.100 ../certs

set -e

IP_ADDRESS="${1:?Usage: $0 <IP_ADDRESS> [OUTPUT_DIR]}"
OUTPUT_DIR="${2:-.}"

mkdir -p "$OUTPUT_DIR"

openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout "$OUTPUT_DIR/server.key" \
  -out "$OUTPUT_DIR/server.crt" \
  -days 3650 \
  -subj "/CN=$IP_ADDRESS" \
  -addext "subjectAltName=IP:$IP_ADDRESS"

echo ""
echo "Certificate generated:"
echo "  $OUTPUT_DIR/server.crt"
echo "  $OUTPUT_DIR/server.key"
echo ""
echo "Install server.crt as a trusted certificate on client devices to avoid browser warnings."
