#！/bin/sh

#错误停止执行
set -e

#等待数据库完全启动
echo "Waiting for MySQL..."
while ! nc -z db 3306
do
sleep 1
done
echo "MySQL started"

#启动数据库迁移
echo "Running migrations..."
if alembic upgrade head; then
  echo "Migrations completed successfully"
else
  echo "Migration failed"
  exit 1
fi

echo "Starting application..."
if [ "$ENVIRONMENT" = "development" ]; then
  uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
else
  uvicorn app.main:app --host 0.0.0.0 --port 8000
fi