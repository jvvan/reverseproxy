# Reverse Proxy

Reverse Proxy API powered by Nginx.

# Instructions (Fresh Ubuntu 20.04 Setup as Root)

## Installing

```sh
apt-get update && apt-get upgrade -y
apt-get install -y nginx
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
apt-get install -y nodejs unzip certbot
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

## Updating

```sh
cd /etc/reverseproxy
curl -Lo proxy.zip https://github.com/j122j/reverseproxy/releases/latest/download/proxy.zip
unzip -o proxy.zip
npm install
cp reverseproxy.service /etc/systemd/system/reverseproxy.service
systemctl restart reverseproxy
```

## Migrating old nginx configurations

```sh
cd /etc/reverseproxy
node dist/migrate/addMetadata.js
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
  "version": "1.0.2",
  "statusCode": 200
}
```

### GET /proxies

Get all proxies.

Responses

```json
["example.com", "example.org"]
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
  "message": "Could not create SSL certificate",
  "statusCode": 500
}
```

```json
{
  "error": "Could not create proxy",
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

### Not Found Response

```json
{
  "message": "METHOD /PATH not found",
  "statusCode": 404
}
```

### Internal Server Error

```json
{
  "message": "Error Message",
  "stack": "Error Stack",
  "statusCode": 500
}
```
