# Reverse Proxy

Reverse Proxy API powered by Nginx.

# Instructions

```sh
mkdir -p /etc/reverseproxy
curl -Lo proxy.zip https://github.com/j122j/reverseproxy/releases/latest/download/proxy.zip
unzip -o proxy.zip
cp example.env .env
# Edit .env
cp reverseproxy.service /etc/systemd/system/reverseproxy.service

systemctl enable --now reverseproxy
# Or if updating
systemctl restart reverseproxy
```
