# Select the base image
FROM nadavtasher/template:2021.06.04

# Install dependencies
RUN npm install node-fetch

# Disable certificate verification
ENV NODE_TLS_REJECT_UNAUTHORIZED 0

# Copy sources
COPY sources/backend backend
COPY sources/frontend frontend