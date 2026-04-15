#!/bin/bash

# 前后端接口测试脚本
# 使用方法: ./test-api.sh

BASE_URL="http://localhost:8080/api"

echo "=========================================="
echo "前后端接口测试"
echo "=========================================="

# 测试 1: 获取成员列表
echo -e "\n[测试 1] 获取成员列表 GET /members"
curl -s -X GET "${BASE_URL}/members" | head -c 500
echo -e "\n"

# 测试 2: 注册新用户
echo -e "\n[测试 2] 注册新用户 POST /members/register"
REGISTER_RESULT=$(curl -s -X POST "${BASE_URL}/members/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser123",
    "password": "123456",
    "realName": "测试用户",
    "email": "test@example.com",
    "phone": "13800138000",
    "type": "member"
  }')
echo "$REGISTER_RESULT" | head -c 500

# 测试 3: 登录
echo -e "\n\n[测试 3] 用户登录 POST /members/login"
LOGIN_RESULT=$(curl -s -X POST "${BASE_URL}/members/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser123",
    "password": "123456"
  }')
echo "$LOGIN_RESULT" | head -c 500

# 提取 token 和 memberId
TOKEN=$(echo "$LOGIN_RESULT" | grep -o '"token":"[^"]*"' | sed 's/"token":"//;s/"//')
MEMBER_ID=$(echo "$LOGIN_RESULT" | grep -o '"memberId":[0-9]*' | sed 's/"memberId"://')

if [ -n "$TOKEN" ]; then
  echo -e "\n\n登录成功! Token: ${TOKEN:0:20}... MemberId: $MEMBER_ID"

  # 测试 4: 获取提案列表
  echo -e "\n[测试 4] 获取提案列表 GET /proposals"
  curl -s -X GET "${BASE_URL}/proposals" \
    -H "Authorization: Bearer $TOKEN" \
    -H "X-Member-Id: $MEMBER_ID" | head -c 500

  # 测试 5: 创建提案
  echo -e "\n\n[测试 5] 创建提案 POST /proposals"
  PROPOSAL_RESULT=$(curl -s -X POST "${BASE_URL}/proposals" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -H "X-Member-Id: $MEMBER_ID" \
    -d '{
      "title": "测试提案",
      "description": "这是一个测试提案的描述",
      "voteType": 1,
      "maxChoices": 1,
      "options": ["支持", "反对", "弃权"]
    }')
  echo "$PROPOSAL_RESULT" | head -c 500

  # 提取提案 ID
  PROPOSAL_ID=$(echo "$PROPOSAL_RESULT" | grep -o '"id":[0-9]*' | sed 's/"id"://')

  if [ -n "$PROPOSAL_ID" ]; then
    echo -e "\n\n提案创建成功! ProposalId: $PROPOSAL_ID"

    # 测试 6: 投票
    echo -e "\n[测试 6] 投票 POST /proposals/{id}/vote"
    curl -s -X POST "${BASE_URL}/proposals/${PROPOSAL_ID}/vote" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -H "X-Member-Id: $MEMBER_ID" \
      -d '{
        "optionIds": [1]
      }' | head -c 500
  fi
fi

echo -e "\n\n=========================================="
echo "测试完成"
echo "=========================================="
