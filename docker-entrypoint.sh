#!/bin/sh
set -e
if [ ! -s /etc/nginx/ssl/fullchain.pem ] || [ ! -s /etc/nginx/ssl/privkey.pem ]; then
    mkdir -p /etc/nginx/ssl
    openssl req -x509 -nodes -newkey rsa:2048 -days 825 \
        -keyout /etc/nginx/ssl/privkey.pem \
        -out /etc/nginx/ssl/fullchain.pem \
        -subj "/CN=cafethecore.live" \
        -addext "subjectAltName=DNS:cafethecore.live,DNS:www.cafethecore.live"
fi
exec nginx -g "daemon off;"
