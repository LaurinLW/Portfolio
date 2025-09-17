FROM caddy:alpine
COPY index.html impressum.html stars.js styles.css favicon.svg email-icon.svg linkedin-icon.svg github-icon.svg /usr/share/caddy/
COPY Caddyfile /etc/caddy/Caddyfile
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
