# Reverse Proxy

Reverse Proxy API powered by Nginx.

# Instructions (Fresh Ubuntu 20.04 Setup as Root)

## Installing

```sh
apt-get update && apt-get upgrade -y
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
apt-get install -y nodejs unzip certbot nginx
mkdir -p /etc/reverseproxy
cd /etc/reverseproxy
curl -Lo proxy.zip https://github.com/j122j/reverseproxy/releases/latest/download/proxy.zip
unzip -o proxy.zip
npm install
cp example.env .env
# Edit .env
cp reverseproxy.service /etc/systemd/system/reverseproxy.service
systemctl enable --now reverseproxy
```

## Stream Support

```sh
mkdir -p /etc/nginx/streams
cat >> /etc/nginx/nginx.conf << EOF
stream {
  include /etc/nginx/streams/*;
}
EOF
nginx -t && systemctl restart nginx
```

## Updating

```sh
cd /etc/reverseproxy
curl -Lo proxy.zip https://github.com/j122j/reverseproxy/releases/latest/download/proxy.zip
unzip -o proxy.zip
npm install
cp reverseproxy.service /etc/systemd/system/reverseproxy.service
systemctl daemon-reload
systemctl restart reverseproxy
```

## Migrating old nginx configurations

```sh
cd /etc/reverseproxy
node dist/migrate/addMetadata.js
```

## Rebuilding nginx configurations

```sh
cd /etc/reverseproxy
node dist/migrate/rebuild.js
nginx -t && nginx -s reload
```

# How To Use

## Authorization

Authentication is performed with the `Authorization` HTTP header in the format `Authorization: AUTHORIZATION`

## API

### GET /

Get the API version.

Responses

```json
{
  "version": "1.2.0",
  "statusCode": 200
}
```

### GET /proxies

Get all proxies.

Responses

```json
[
  {
    "version": "v1.0",
    "domain": "example.com",
    "target": "http://target.com:8080",
    "ssl": true,
    "letsencryptDir": "/var/www/html"
  },
  {
    "version": "v1.0",
    "domain": "example.org",
    "target": "http://target.com:8181",
    "ssl": false
  }
]
```

### POST /proxies

Create a proxy with a domain and a target.
If ssl is set to `true`, a SSL Certificate will be created using [Certbot](https://certbot.eff.org/).

Body

```json
{
  "domain": "example.com",
  "target": "http://target.com:8080",
  "ssl": true
}
```

Responses

```json
{
  "message": "Proxy created",
  "statusCode": 200
}
```

```json
{
  "error": "Invalid request",
  "statusCode": 400
}
```

```json
{
  "error": "Invalid target",
  "statusCode": 400
}
```

```json
{
  "error": "Could not create SSL certificate",
  "statusCode": 500
}
```

```json
{
  "error": "Could not create proxy",
  "statusCode": 500
}
```

```json
{
  "error": "Nginx configuration failed",
  "statusCode": 500
}
```

### DELETE /proxies/:domain

Delete the proxy with the domain.

Add `?keepCertificate=true` to not delete the SSL certificate.

Responses

```json
{
  "message": "Proxy deleted",
  "statusCode": 200
}
```

```json
{
  "error": "Could not delete proxy",
  "statusCode": 500
}
```

### GET /streams

Get all streams.

Responses

```json
[
  {
    "version": "v1.0",
    "name": "example-stream",
    "listen": "8080",
    "target": "target.com:8080"
  },
  {
    "version": "v1.0",
    "name": "example-stream-too",
    "listen": "127.0.0.1:8080 udp",
    "target": "target.com:8181"
  }
]
```

### POST /streams

Create a stream with a name, domain, and target.
You can add udp after listen port (Example: `127.0.0.1:8080 udp`).
Body

```json
{
  "name": "example-stream",
  "listen": "127.0.0.1:8080",
  "target": "target.com:8080"
}
```

Responses

```json
{
  "message": "Stream created",
  "statusCode": 200
}
```

```json
{
  "error": "Invalid request",
  "statusCode": 400
}
```

```json
{
  "error": "Invalid name",
  "statusCode": 400
}
```

```json
{
  "error": "Invalid listen",
  "statusCode": 400
}
```

```json
{
  "error": "Could not create stream",
  "statusCode": 500
}
```

```json
{
  "error": "Nginx configuration failed",
  "statusCode": 500
}
```

### DELETE /streams/:name

Delete the stream with the name.

Responses

```json
{
  "message": "Stream deleted",
  "statusCode": 200
}
```

```json
{
  "error": "Could not delete stream",
  "statusCode": 500
}
```

### Not Found Response

```json
{
  "error": "METHOD /PATH not found",
  "statusCode": 404
}
```

### Internal Server Error

```json
{
  "error": "Error Message",
  "stack": "Error Stack",
  "statusCode": 500
}
```
