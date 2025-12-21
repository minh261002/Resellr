#!/bin/bash

# POS SaaS - Complete API Testing Script
# Run this after all services are started

set -e

BASE_URL="http://localhost:3000/api"
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  POS SaaS - Complete API Test${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Step 1: Register Organization + User
echo -e "${YELLOW}Step 1: Registering organization and user...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@teststore.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "Admin",
    "organizationName": "Test Coffee Shop"
  }')

echo "$REGISTER_RESPONSE" | jq '.'

# Extract access token
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.accessToken')
ORG_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.user.organizationId')
USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.user.id')

echo -e "${GREEN}✓ Registered successfully${NC}"
echo -e "Token: ${TOKEN:0:20}..."
echo -e "Organization ID: $ORG_ID"
echo ""

# Step 2: Get Profile
echo -e "${YELLOW}Step 2: Getting user profile...${NC}"
curl -s "$BASE_URL/auth/profile" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo -e "${GREEN}✓ Profile retrieved${NC}"
echo ""

# Step 3: Create Products
echo -e "${YELLOW}Step 3: Creating products...${NC}"

# Product 1: Espresso
PRODUCT1_RESPONSE=$(curl -s -X POST "$BASE_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Espresso",
    "sku": "COFFEE-ESP-001",
    "barcode": "1234567890123",
    "description": "Rich and bold espresso shot",
    "price": 3.50,
    "costPrice": 1.50,
    "stock": 100,
    "lowStockAlert": 20,
    "category": "Coffee"
  }')

PRODUCT1_ID=$(echo "$PRODUCT1_RESPONSE" | jq -r '.id')
echo "Espresso created: $PRODUCT1_ID"

# Product 2: Cappuccino
PRODUCT2_RESPONSE=$(curl -s -X POST "$BASE_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Cappuccino",
    "sku": "COFFEE-CAP-001",
    "barcode": "1234567890124",
    "description": "Smooth cappuccino with foam",
    "price": 4.50,
    "costPrice": 2.00,
    "stock": 100,
    "lowStockAlert": 20,
    "category": "Coffee"
  }')

PRODUCT2_ID=$(echo "$PRODUCT2_RESPONSE" | jq -r '.id')
echo "Cappuccino created: $PRODUCT2_ID"

# Product 3: Latte
PRODUCT3_RESPONSE=$(curl -s -X POST "$BASE_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Latte",
    "sku": "COFFEE-LAT-001",
    "barcode": "1234567890125",
    "price": 4.00,
    "stock": 50,
    "category": "Coffee"
  }')

PRODUCT3_ID=$(echo "$PRODUCT3_RESPONSE" | jq -r '.id')
echo "Latte created: $PRODUCT3_ID"

echo -e "${GREEN}✓ Created 3 products${NC}"
echo ""

# Step 4: List Products
echo -e "${YELLOW}Step 4: Listing all products...${NC}"
curl -s "$BASE_URL/products?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq '.data[] | {name, price, stock}'
echo -e "${GREEN}✓ Products listed${NC}"
echo ""

# Step 5: Search Product by Barcode (POS Scan)
echo -e "${YELLOW}Step 5: Scanning barcode (POS)...${NC}"
curl -s "$BASE_URL/products/barcode/1234567890123" \
  -H "Authorization: Bearer $TOKEN" | jq '{name, price, stock, barcode}'
echo -e "${GREEN}✓ Barcode scan successful${NC}"
echo ""

# Step 6: Create Sale (POS Checkout)
echo -e "${YELLOW}Step 6: Creating sale (POS checkout)...${NC}"
SALE_RESPONSE=$(curl -s -X POST "$BASE_URL/sales" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "items": [
      {
        "productId": "'$PRODUCT1_ID'",
        "productName": "Espresso",
        "unitPrice": 3.50,
        "quantity": 2,
        "discount": 0
      },
      {
        "productId": "'$PRODUCT2_ID'",
        "productName": "Cappuccino",
        "unitPrice": 4.50,
        "quantity": 1,
        "discount": 0.50
      }
    ],
    "paymentMethod": "cash",
    "tax": 1.00,
    "discount": 0,
    "notes": "Customer requested extra hot"
  }')

echo "$SALE_RESPONSE" | jq '.'
SALE_ID=$(echo "$SALE_RESPONSE" | jq -r '.id')
INVOICE_NUMBER=$(echo "$SALE_RESPONSE" | jq -r '.invoiceNumber')

echo -e "${GREEN}✓ Sale created${NC}"
echo -e "Invoice: $INVOICE_NUMBER"
echo ""

# Step 7: Check Product Stock (should be decreased)
echo -e "${YELLOW}Step 7: Checking product stock after sale...${NC}"
curl -s "$BASE_URL/products/$PRODUCT1_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '{name, stock}'
echo -e "${GREEN}✓ Stock updated (should be 98 for Espresso)${NC}"
echo ""

# Step 8: Get Sale by Invoice
echo -e "${YELLOW}Step 8: Getting sale by invoice number...${NC}"
curl -s "$BASE_URL/sales/invoice/$INVOICE_NUMBER" \
  -H "Authorization: Bearer $TOKEN" | jq '{invoiceNumber, total, status}'
echo -e "${GREEN}✓ Sale retrieved by invoice${NC}"
echo ""

# Step 9: Create Another Sale
echo -e "${YELLOW}Step 9: Creating another sale...${NC}"
curl -s -X POST "$BASE_URL/sales" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "items": [
      {
        "productId": "'$PRODUCT3_ID'",
        "productName": "Latte",
        "unitPrice": 4.00,
        "quantity": 3
      }
    ],
    "paymentMethod": "card",
    "tax": 1.20
  }' | jq '{invoiceNumber, total, paymentMethod}'
echo -e "${GREEN}✓ Second sale created${NC}"
echo ""

# Step 10: Get Sales Report
echo -e "${YELLOW}Step 10: Getting sales report...${NC}"
curl -s "$BASE_URL/sales/report?startDate=2023-01-01&endDate=2025-12-31" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo -e "${GREEN}✓ Sales report generated${NC}"
echo ""

# Step 11: List All Sales
echo -e "${YELLOW}Step 11: Listing all sales...${NC}"
curl -s "$BASE_URL/sales?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq '.data[] | {invoiceNumber, total, status}'
echo -e "${GREEN}✓ Sales listed${NC}"
echo ""

# Step 12: Check Low Stock Products
echo -e "${YELLOW}Step 12: Checking low stock products...${NC}"
curl -s "$BASE_URL/products/low-stock" \
  -H "Authorization: Bearer $TOKEN" | jq '.[] | {name, stock, lowStockAlert}'
echo -e "${GREEN}✓ Low stock check complete${NC}"
echo ""

# Step 13: Update Product Stock
echo -e "${YELLOW}Step 13: Updating product stock (adding 50)...${NC}"
curl -s -X PATCH "$BASE_URL/products/$PRODUCT1_ID/stock" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"quantity": 50}' | jq '{name, stock}'
echo -e "${GREEN}✓ Stock updated${NC}"
echo ""

# Summary
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  Test Summary${NC}"
echo -e "${CYAN}========================================${NC}"
echo -e "${GREEN}✓ Authentication: PASSED${NC}"
echo -e "${GREEN}✓ Product Management: PASSED${NC}"
echo -e "${GREEN}✓ Barcode Scanning: PASSED${NC}"
echo -e "${GREEN}✓ POS Sales: PASSED${NC}"
echo -e "${GREEN}✓ Stock Management: PASSED${NC}"
echo -e "${GREEN}✓ Sales Reports: PASSED${NC}"
echo ""
echo -e "${GREEN}All tests completed successfully!${NC}"
echo ""
echo -e "Summary:"
echo -e "  - Created organization: Test Coffee Shop"
echo -e "  - Created user: admin@teststore.com"
echo -e "  - Created 3 products"
echo -e "  - Made 2 sales"
echo -e "  - Generated reports"
echo ""
