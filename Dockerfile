FROM caddy:alpine
COPY index.html stars.js styles.css favicon.svg /usr/share/caddy/
COPY Caddyfile /etc/caddy/Caddyfile
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
