#!/bin/bash
# ============================================================
# ant-toolkit 一键部署脚本
# 作用：重新构建前端 → 同步到 toolkit.011420.xyz 站点目录 → 更新权限
# 用法：cd /home/ant/dev/ant-toolkit && ./deploy.sh
# 依赖：pnpm, sudo（站点目录需 root 权限）
# ============================================================
set -e

# ---------- 配置 ----------
SITE_DIR="/www/wwwroot/toolkit.011420.xyz"   # 宝塔站点目录
DIST_DIR="/home/ant/dev/ant-toolkit/dist"    # 构建产物目录
# sudo 密码从环境变量读取，避免明文入库：SUDO_PASS=xxx ./deploy.sh
SUDO_PASS="${SUDO_PASS:?请通过环境变量提供 sudo 密码：SUDO_PASS=xxx ./deploy.sh}"

# ---------- 1. 检查环境 ----------
echo "[1/4] 检查环境..."
command -v pnpm >/dev/null 2>&1 || { echo "错误: 未找到 pnpm"; exit 1; }
if [ ! -f "package.json" ]; then
  echo "错误: 请在 ant-toolkit 项目根目录运行此脚本"; exit 1
fi

# ---------- 2. 重新构建 ----------
echo "[2/4] 重新构建前端 (vite build)..."
pnpm build

# ---------- 3. 同步到站点目录 ----------
if [ ! -d "$DIST_DIR" ]; then
  echo "错误: 构建产物目录不存在: $DIST_DIR"; exit 1
fi
echo "[3/4] 同步 dist → $SITE_DIR ..."
echo "$SUDO_PASS" | sudo -S rsync -a --delete "$DIST_DIR/" "$SITE_DIR/" >/dev/null 2>&1
echo "$SUDO_PASS" | sudo -S chown -R www:www "$SITE_DIR" >/dev/null 2>&1

# ---------- 4. 完成 ----------
echo "[4/4] 部署完成 ✓"
echo ""
echo "访问: https://toolkit.011420.xyz/"
echo "提示: 浏览器可能缓存旧资源，强制刷新 Ctrl+Shift+R 即可。"
