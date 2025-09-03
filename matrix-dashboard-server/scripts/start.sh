#!/bin/bash

# 启动脚本 - Matrix Dashboard Server

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Matrix Dashboard Server 启动脚本${NC}"
echo -e "${BLUE}========================================${NC}"

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}警告: .env 文件不存在，将复制 .env.example${NC}"
    cp .env.example .env
    echo -e "${YELLOW}请编辑 .env 文件配置相关参数${NC}"
fi

# 检查数据库配置
echo -e "${BLUE}检查数据库配置...${NC}"
if grep -q "DB_PASSWORD=$" .env; then
    echo -e "${YELLOW}检测到数据库密码为空，请输入 MySQL root 密码:${NC}"
    read -s DB_PASSWORD
    sed -i "" "s/DB_PASSWORD=$/DB_PASSWORD=${DB_PASSWORD}/" .env
    echo -e "${GREEN}数据库密码已更新${NC}"
fi

# 检查依赖
echo -e "${BLUE}检查依赖...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: Node.js 未安装${NC}"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}pnpm 未安装，尝试安装...${NC}"
    npm install -g pnpm
fi

# 安装依赖
echo -e "${BLUE}安装依赖...${NC}"
pnpm install

# 构建项目
echo -e "${BLUE}构建项目...${NC}"
pnpm run build

# 运行数据库迁移
echo -e "${BLUE}运行数据库迁移...${NC}"
pnpm run migration:run

echo -e "${GREEN}✅ 项目启动准备完成！${NC}"
echo -e "${GREEN}🚀 启动开发服务器...${NC}"

# 启动开发服务器
pnpm run start:dev
