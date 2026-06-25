FROM nginx:alpine

# Copier les fichiers du jeu
COPY index.html          /usr/share/nginx/html/index.html
COPY src/               /usr/share/nginx/html/src/
COPY stats/             /usr/share/nginx/html/stats/

# Configuration Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Port d'écoute
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
