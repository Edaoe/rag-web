FROM registry.cn-hangzhou.aliyuncs.com/google_containers/python:3.11-silm

WORKDIR /app

#install system dependencies
RUN apt-get update && apt-get install -y \
   build-essential \
   default-libmysqlclient-dev \
   pkg-config \
   netcat-traditional \
   && rm -rf /var/lib/apt/lists/*

#copy requirements.txt file
COPY requirements.txt .

#intall python packages
RUN pip intall -i https://pypi.tuna.tsinghua.edu.cn/simple --no-cache-dir -r requirements.txt

#copy entrypoint.sh script frist
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

#copy app files
COPY . .

#create uploades directory
RUN mkdir -p uploades

# Set Python path and environment
ENV PYTHONPATH=./
ENV ENVIRONMENT=production

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]