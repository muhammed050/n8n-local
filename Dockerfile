FROM n8nio/n8n:2.34.6

USER root
RUN mkdir -p /home/node/.n8n && chown -R node:node /home/node/.n8n
USER node

EXPOSE 5678

CMD ["n8n", "start"]