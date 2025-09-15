FROM nginx:latest
COPY . /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
RUN apt-get update && apt-get install -y python3 python3-pip certbot python3-certbot-nginx
EXPOSE 80 443
