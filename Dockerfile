FROM nginx
COPY run.sh /run.sh
ENTRYPOINT ["bash", "/run.sh"]