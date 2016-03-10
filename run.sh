#!/bin/bash -e

cat<<end-of-nginx-config > /etc/nginx/nginx.conf
worker_processes 1;
daemon off;
events { worker_connections 1024; }

http {

    sendfile on;

    gzip              on;
    gzip_http_version 1.0;
    gzip_proxied      any;
    gzip_min_length   500;
    gzip_disable      "MSIE [1-6]\.";
    gzip_types        text/plain text/xml text/css
                      text/comma-separated-values
                      text/javascript
                      application/x-javascript
                      application/atom+xml;

    # List of backend servers
    upstream gui_servers {
        server ${GUI_SERVICE_HOST}:${GUI_SERVICE_PORT};
    }

    upstream projects_servers {
        server ${PROJECTS_SERVICE_HOST}:${PROJECTS_SERVICE_PORT};
    }

    upstream library_servers {
        server ${LIBRARY_SERVICE_HOST}:${LIBRARY_SERVICE_PORT};
    }

    upstream auth_servers {
        server ${AUTHENTICATION_SERVICE_HOST}:${AUTHENTICATION_SERVICE_PORT};
    }

    server {

        
        listen 80;

        location /v1/library {

            proxy_pass         http://library_servers;
            proxy_redirect     off;
            proxy_set_header   Host \$host;
            proxy_set_header   X-Real-IP \$remote_addr;
            proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header   X-Forwarded-Host \$server_name;

        }

        location /v1/projects {

            proxy_pass         http://projects_servers;
            proxy_redirect     off;
            proxy_set_header   Host \$host;
            proxy_set_header   X-Real-IP \$remote_addr;
            proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header   X-Forwarded-Host \$server_name;

        }

        location /v1/auth/ {

            proxy_pass         http://auth_servers/;
            proxy_redirect     off;
            proxy_set_header   Host \$host;
            proxy_set_header   X-Real-IP \$remote_addr;
            proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header   X-Forwarded-Host \$server_name;

        }

        location / {

            proxy_pass         http://gui_servers;
            proxy_redirect     off;
            proxy_set_header   Host \$host;
            proxy_set_header   X-Real-IP \$remote_addr;
            proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header   X-Forwarded-Host \$server_name;

        }
    }
}
end-of-nginx-config

nginx


